import time
from typing import Any, Dict, List, Optional

from app.config import settings
from app.core.exceptions import (
    ExecutionTimeoutError,
    FlowExecutorError,
    LLMProviderError,
)
from app.core.logging import create_context_logger, get_logger
from app.executor.graph_traverser import FlowGraph, GraphTraverser
from app.executor.node_executor import NodeExecutor
from app.providers.openai_provider import OpenAIProvider


class ExecutionContext:
    def __init__(
        self,
        session_id: str,
        flow_id: int,
        user_message: str,
        chat_history: List[Dict[str, Any]],
        variables: Dict[str, Any],
    ):
        self.session_id = session_id
        self.flow_id = flow_id
        self.user_message = user_message
        self.chat_history = chat_history
        self.variables = variables
        self.node_outputs: Dict[str, Dict[str, Any]] = {}
        self.start_time: float = 0
        self.end_time: Optional[float] = None
        self.status: str = "pending"
        self.error: Optional[str] = None

    @property
    def execution_time(self) -> Optional[float]:
        if self.end_time is not None:
            return self.end_time - self.start_time
        return None


class FlowExecutor:
    def __init__(
        self,
        max_execution_time: Optional[int] = None,
        max_retries: Optional[int] = None,
    ):
        self.max_execution_time = max_execution_time or settings.max_execution_time
        self.max_retries = max_retries or settings.max_retries
        self.node_executor = NodeExecutor()
        self.logger = get_logger("flow_executor")

    async def execute(
        self,
        flow_id: int,
        user_message: str,
        messages: Optional[List[Dict[str, Any]]] = None,
        context: Optional[Dict[str, Any]] = None,
        flow_data: Optional[Dict[str, Any]] = None,
        session_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        messages = messages or []
        context = context or {}
        flow_data = flow_data or {}
        session_id = session_id or "default"

        chat_history = [
            {"role": m.get("role", "user"), "content": m.get("content", "")}
            for m in messages
            if m.get("content")
        ]

        exec_context = ExecutionContext(
            session_id=session_id,
            flow_id=flow_id,
            user_message=user_message,
            chat_history=chat_history,
            variables=dict(context),
        )

        logger = create_context_logger(
            "execution", session_id=session_id, flow_id=flow_id
        )
        logger.info("Starting flow execution")
        exec_context.start_time = time.time()
        exec_context.status = "running"

        try:
            has_graph = bool(flow_data.get("nodes"))
            if has_graph:
                result = await self._execute_graph(flow_data, exec_context, logger)
            else:
                result = await self._execute_fallback_chat(exec_context, logger)

            exec_context.end_time = time.time()
            if exec_context.status == "running":
                exec_context.status = "completed"

            return {
                "response": result.get("response", ""),
                "tokens": result.get("tokens", 0),
                "metadata": {
                    **result.get("metadata", {}),
                    "session_id": session_id,
                    "flow_id": flow_id,
                    "status": exec_context.status,
                    "execution_time": exec_context.execution_time,
                    "mode": "graph" if has_graph else "fallback",
                },
                "nodeResults": result.get("node_results", []),
            }
        except ExecutionTimeoutError:
            exec_context.end_time = time.time()
            exec_context.status = "timeout"
            raise
        except FlowExecutorError:
            exec_context.end_time = time.time()
            exec_context.status = "failed"
            raise
        except Exception as e:
            exec_context.end_time = time.time()
            exec_context.status = "failed"
            logger.error("Flow execution failed: %s", str(e))
            raise FlowExecutorError(
                message=f"Flow execution failed: {e}",
                code="EXECUTION_FAILED",
                details={
                    "flow_id": flow_id,
                    "session_id": session_id,
                    "error": str(e),
                },
            ) from e

    async def _execute_fallback_chat(
        self, context: ExecutionContext, logger
    ) -> Dict[str, Any]:
        if not settings.openai_api_key:
            raise LLMProviderError(
                "openai",
                settings.default_model,
                "OPENAI_API_KEY is not configured",
            )

        provider = OpenAIProvider(
            api_key=settings.openai_api_key,
            model=settings.default_model,
            temperature=settings.default_temperature,
            max_tokens=settings.default_max_tokens,
        )

        messages = [{"role": "system", "content": "You are a helpful assistant."}]
        messages.extend(context.chat_history)
        messages.append({"role": "user", "content": context.user_message})

        response = await provider.chat(messages)
        tokens = response.get("usage", {}).get("total_tokens", 0)
        logger.info("Fallback OpenAI chat completed (%s tokens)", tokens)

        return {
            "response": response["content"],
            "tokens": tokens,
            "metadata": {"model": settings.default_model},
            "node_results": [
                {
                    "node_id": "fallback_openai",
                    "node_type": "openai_llm",
                    "status": "success",
                    "outputs": {"response": response["content"]},
                    "execution_time": context.execution_time,
                }
            ],
        }

    async def _execute_graph(
        self,
        flow_data: Dict[str, Any],
        context: ExecutionContext,
        logger,
    ) -> Dict[str, Any]:
        graph = FlowGraph(flow_data)
        traverser = GraphTraverser(graph)
        plan = traverser.get_execution_plan()
        logger.debug("Execution plan: %s", plan)

        node_results: List[Dict[str, Any]] = []
        total_tokens = 0

        for node_id in plan:
            if time.time() - context.start_time > self.max_execution_time:
                raise ExecutionTimeoutError(self.max_execution_time)

            node = graph.nodes.get(node_id)
            if not node:
                continue

            input_data = self._prepare_node_input(context)
            node_instance = self.node_executor.get_or_create_node(
                node_id=node.id,
                node_type=node.type,
                config=node.config,
                session_id=context.session_id,
                flow_id=context.flow_id,
            )

            result = await self.node_executor.execute_node(
                node_instance, input_data
            )
            node_results.append(result)

            if result["status"] == "success":
                outputs = result.get("outputs") or {}
                context.node_outputs[node_id] = outputs
                usage = outputs.get("usage") or {}
                total_tokens += int(usage.get("total_tokens") or 0)
                meta_tokens = (result.get("metadata") or {}).get("tokens_used")
                if meta_tokens and not usage:
                    total_tokens += int(meta_tokens)
            else:
                context.status = "failed"
                context.error = result.get("error", "Unknown error")
                break

        final_output = self._get_final_output(graph, context)
        response_text = (
            final_output.get("response")
            or final_output.get("message")
            or ""
        )

        return {
            "response": response_text,
            "tokens": total_tokens,
            "metadata": {"nodes_executed": len(node_results)},
            "node_results": node_results,
        }

    def _prepare_node_input(self, context: ExecutionContext) -> Dict[str, Any]:
        input_data: Dict[str, Any] = {
            "message": context.user_message,
            "chat_history": context.chat_history,
            "variables": context.variables,
            "session_id": context.session_id,
        }
        for nid, outputs in context.node_outputs.items():
            input_data[nid] = outputs
            for key, value in outputs.items():
                if key not in input_data:
                    input_data[key] = value
        return input_data

    def _get_final_output(
        self, graph: FlowGraph, context: ExecutionContext
    ) -> Dict[str, Any]:
        for node_id in graph.get_exit_nodes():
            output = context.node_outputs.get(node_id)
            if output:
                return output
        if context.node_outputs:
            last_id = list(context.node_outputs.keys())[-1]
            return context.node_outputs[last_id]
        return {}
