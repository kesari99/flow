from app.nodes.base import BaseNode, NodeInput, NodeOutput, register_node
from app.core.exceptions import LLMProviderError
from app.providers.openai_provider import OpenAIProvider
from app.config import settings


@register_node("openai_llm")
class OpenAILLMNode(BaseNode):
    async def execute(self, input_data: NodeInput) -> NodeOutput:
        model = self.config.get("model") or settings.default_model
        temperature = self.config.get(
            "temperature", settings.default_temperature
        )
        max_tokens = self.config.get("max_tokens", settings.default_max_tokens)
        system_message = self.config.get(
            "system_message", "You are a helpful assistant."
        )

        user_message = input_data.data.get("message", "")
        chat_history = input_data.data.get("chat_history", [])

        if not user_message:
            raise ValueError("No message provided to LLM node")

        if not settings.openai_api_key:
            raise LLMProviderError(
                "openai", model, "OPENAI_API_KEY is not configured"
            )

        messages = [{"role": "system", "content": system_message}]
        for msg in chat_history:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role in ("user", "assistant", "system") and content:
                messages.append({"role": role, "content": content})
        messages.append({"role": "user", "content": user_message})

        try:
            provider = OpenAIProvider(
                api_key=settings.openai_api_key,
                model=model,
                temperature=float(temperature),
                max_tokens=int(max_tokens),
            )
            response = await provider.chat(messages)
            return NodeOutput(
                data={
                    "response": response["content"],
                    "message": response["content"],
                    "model": model,
                    "usage": response.get("usage", {}),
                    "finish_reason": response.get("finish_reason"),
                },
                metadata={
                    "node_type": self.node_type,
                    "model": model,
                    "tokens_used": response.get("usage", {}).get(
                        "total_tokens", 0
                    ),
                },
            )
        except LLMProviderError:
            raise
        except Exception as e:
            raise LLMProviderError("openai", model, str(e)) from e
