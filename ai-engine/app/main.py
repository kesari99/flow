from typing import Any, Optional

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.config import settings
from app.core.exceptions import FlowExecutorError
from app.core.logging import setup_logging
from app.executor.flow_executor import FlowExecutor
import app.nodes  # noqa: F401 — register nodes

setup_logging()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
)
executor = FlowExecutor()


class ExecuteRequest(BaseModel):
    flow_id: int = Field(..., alias="flowId")
    user_message: str = Field(..., alias="userMessage")
    messages: list[dict[str, Any]] = Field(default_factory=list)
    context: dict[str, Any] = Field(default_factory=dict)
    session_id: Optional[str] = Field(default=None, alias="sessionId")
    flow_data: Optional[dict[str, Any]] = Field(default=None, alias="flowData")

    model_config = {"populate_by_name": True}


class ExecuteResponse(BaseModel):
    response: str
    tokens: int = 0
    metadata: dict[str, Any] = Field(default_factory=dict)
    nodeResults: list[dict[str, Any]] = Field(default_factory=list)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "version": settings.app_version}


@app.post("/execute", response_model=ExecuteResponse)
async def execute_flow(body: ExecuteRequest) -> ExecuteResponse:
    result = await executor.execute(
        flow_id=body.flow_id,
        user_message=body.user_message,
        messages=body.messages,
        context=body.context,
        flow_data=body.flow_data,
        session_id=body.session_id,
    )
    return ExecuteResponse(
        response=result.get("response", ""),
        tokens=int(result.get("tokens") or 0),
        metadata=result.get("metadata") or {},
        nodeResults=result.get("nodeResults") or [],
    )


@app.exception_handler(FlowExecutorError)
async def flow_executor_error_handler(
    _request: Request, exc: FlowExecutorError
):
    return JSONResponse(status_code=exc.status_code, content=exc.to_dict())


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
