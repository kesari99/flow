from typing import Any


class FlowExecutor:
    """Executes a chat flow graph. Implementation will use LangGraph or custom runner."""

    async def execute(
        self,
        flow_id: int,
        user_message: str,
        messages: list[dict[str, Any]],
        context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        context = context or {}
        # TODO: load flow from backend, run nodes, call LLM providers
        return {
            "response": f"Echo from flow {flow_id}: {user_message}",
            "tokens": 0,
            "metadata": {"context_keys": list(context.keys())},
        }
