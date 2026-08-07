from abc import ABC, abstractmethod
from enum import Enum
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class NodeStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"


class NodeInput(BaseModel):
    data: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class NodeOutput(BaseModel):
    data: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    status: NodeStatus = NodeStatus.SUCCESS


class BaseNode(ABC):
    def __init__(
        self,
        node_id: str,
        node_type: str,
        config: Dict[str, Any],
        logger=None,
    ):
        self.node_id = node_id
        self.node_type = node_type
        self.config = config
        self.logger = logger
        self._status = NodeStatus.PENDING
        self._execution_time: Optional[float] = None

    @property
    def status(self) -> NodeStatus:
        return self._status

    @property
    def execution_time(self) -> Optional[float]:
        return self._execution_time

    @abstractmethod
    async def execute(self, input_data: NodeInput) -> NodeOutput:
        pass

    async def run(self, input_data: NodeInput) -> NodeOutput:
        import time

        from app.core.exceptions import NodeExecutionError
        from app.core.logging import create_context_logger

        if not self.logger:
            self.logger = create_context_logger("node", node_id=self.node_id)

        self._status = NodeStatus.RUNNING
        self.logger.info(
            "Executing node %s of type %s", self.node_id, self.node_type
        )

        start_time = time.time()
        try:
            result = await self.execute(input_data)
            self._status = NodeStatus.SUCCESS
            self._execution_time = time.time() - start_time
            self.logger.info(
                "Node %s completed in %.3fs",
                self.node_id,
                self._execution_time,
            )
            return result
        except Exception as e:
            self._status = NodeStatus.FAILED
            self._execution_time = time.time() - start_time
            self.logger.error("Node %s failed: %s", self.node_id, str(e))
            if isinstance(e, NodeExecutionError):
                raise
            raise NodeExecutionError(
                node_id=self.node_id,
                node_type=self.node_type,
                message=str(e),
            ) from e


class NodeFactory:
    _registry: Dict[str, type] = {}

    @classmethod
    def register(cls, node_type: str, node_class: type) -> None:
        cls._registry[node_type] = node_class

    @classmethod
    def create(
        cls,
        node_type: str,
        node_id: str,
        config: Dict[str, Any],
        logger=None,
    ) -> BaseNode:
        # Normalize common aliases from React Flow UI
        aliases = {
            "openai": "openai_llm",
            "llm": "openai_llm",
            "chatInput": "chat_input",
            "chatOutput": "chat_output",
            "ChatInput": "chat_input",
            "ChatOutput": "chat_output",
            "OpenAI": "openai_llm",
        }
        resolved = aliases.get(node_type, node_type)

        if resolved not in cls._registry:
            raise ValueError(
                f"Unknown node type: {node_type}. "
                f"Available: {list(cls._registry.keys())}"
            )

        return cls._registry[resolved](
            node_id=node_id,
            node_type=resolved,
            config=config,
            logger=logger,
        )

    @classmethod
    def get_registered_types(cls) -> list:
        return list(cls._registry.keys())


def register_node(node_type: str):
    def decorator(cls):
        NodeFactory.register(node_type, cls)
        return cls

    return decorator
