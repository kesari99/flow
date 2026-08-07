from typing import Any, Dict, List, Optional


class FlowExecutorError(Exception):
    def __init__(
        self,
        message: str,
        code: str = "EXECUTOR_ERROR",
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details
        super().__init__(message)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "error": {
                "code": self.code,
                "message": self.message,
                "details": self.details,
            }
        }


class NodeExecutionError(FlowExecutorError):
    def __init__(
        self,
        node_id: str,
        node_type: str,
        message: str,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=f"Error executing node '{node_id}' of type '{node_type}': {message}",
            code="NODE_EXECUTION_ERROR",
            status_code=500,
            details={"node_id": node_id, "node_type": node_type, **(details or {})},
        )


class LLMProviderError(FlowExecutorError):
    def __init__(self, provider: str, model: str, message: str):
        super().__init__(
            message=f"LLM provider '{provider}' error for model '{model}': {message}",
            code="LLM_PROVIDER_ERROR",
            status_code=502,
            details={"provider": provider, "model": model},
        )


class ExecutionTimeoutError(FlowExecutorError):
    def __init__(self, timeout: int):
        super().__init__(
            message=f"Flow execution timed out after {timeout} seconds",
            code="EXECUTION_TIMEOUT",
            status_code=504,
            details={"timeout": timeout},
        )


class ValidationError(FlowExecutorError):
    def __init__(self, message: str, errors: List[Dict[str, Any]]):
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=400,
            details={"errors": errors},
        )
