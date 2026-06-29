from typing import Any

from fastapi import FastAPI
from pydantic import BaseModel, Field

from app.services.executor import FlowExecutor

app = FastAPI(title="Promptflow AI Engine", version="0.1.0")
executor = FlowExecutor()


class ExecuteRequest(BaseModel):
    flow_id: int = Field(..., alias="flowId")
    user_message: str = Field(..., alias="userMessage")
    messages: list[dict[str, Any]] = Field(default_factory=list)
    context: dict[str, Any] = Field(default_factory=dict)

    model_config = {"populate_by_name": True}


class ExecuteResponse(BaseModel):
    response: str
    tokens: int = 0
    metadata: dict[str, Any] = Field(default_factory=dict)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/execute", response_model=ExecuteResponse)
async def execute_flow(body: ExecuteRequest) -> ExecuteResponse:
    result = await executor.execute(
        flow_id=body.flow_id,
        user_message=body.user_message,
        messages=body.messages,
        context=body.context,
    )
    return ExecuteResponse(**result)
