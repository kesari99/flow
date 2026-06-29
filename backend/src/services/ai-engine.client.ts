const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export interface ExecuteFlowPayload {
  flowId: number;
  userMessage: string;
  messages: Array<Record<string, unknown>>;
  context?: Record<string, unknown>;
}

export interface ExecuteFlowResult {
  response: string;
  tokens: number;
  metadata: Record<string, unknown>;
}

export async function executeFlow(
  payload: ExecuteFlowPayload
): Promise<ExecuteFlowResult> {
  const response = await fetch(`${AI_ENGINE_URL}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      flowId: payload.flowId,
      userMessage: payload.userMessage,
      messages: payload.messages,
      context: payload.context ?? {},
    }),
  });

  if (!response.ok) {
    throw new Error(`AI engine error: ${response.status}`);
  }

  return response.json() as Promise<ExecuteFlowResult>;
}
