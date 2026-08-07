import time
from typing import Any, Dict, Optional

from app.core.exceptions import NodeExecutionError
from app.core.logging import create_context_logger
from app.nodes.base import BaseNode, NodeFactory, NodeInput


class NodeExecutor:
    def __init__(self):
        self.logger = create_context_logger("node_executor")
        self._node_cache: Dict[str, BaseNode] = {}

    def get_or_create_node(
        self,
        node_id: str,
        node_type: str,
        config: Dict[str, Any],
        session_id: Optional[str] = None,
        flow_id: Optional[int] = None,
    ) -> BaseNode:
        cache_key = f"{flow_id}:{node_id}"
        if cache_key not in self._node_cache:
            logger = create_context_logger(
                "node",
                session_id=session_id,
                flow_id=flow_id,
                node_id=node_id,
            )
            self._node_cache[cache_key] = NodeFactory.create(
                node_type=node_type,
                node_id=node_id,
                config=config,
                logger=logger,
            )
        return self._node_cache[cache_key]

    async def execute_node(
        self, node: BaseNode, input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        node_input = NodeInput(data=input_data)
        start_time = time.time()
        try:
            result = await node.run(node_input)
            return {
                "node_id": node.node_id,
                "node_type": node.node_type,
                "status": "success",
                "outputs": result.data,
                "metadata": result.metadata,
                "execution_time": time.time() - start_time,
            }
        except NodeExecutionError as e:
            return {
                "node_id": node.node_id,
                "node_type": node.node_type,
                "status": "failed",
                "error": e.message,
                "execution_time": time.time() - start_time,
            }
        except Exception as e:
            return {
                "node_id": node.node_id,
                "node_type": node.node_type,
                "status": "failed",
                "error": str(e),
                "execution_time": time.time() - start_time,
            }

    def clear_cache(self, flow_id: Optional[int] = None) -> None:
        if flow_id is not None:
            keys = [
                k for k in self._node_cache if k.startswith(f"{flow_id}:")
            ]
            for key in keys:
                del self._node_cache[key]
        else:
            self._node_cache.clear()
