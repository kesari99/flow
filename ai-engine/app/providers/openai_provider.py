from typing import Any, Dict, List, Optional

from openai import AsyncOpenAI

from app.core.exceptions import LLMProviderError
from app.core.logging import get_logger
from app.providers.base import BaseLLMProvider


class OpenAIProvider(BaseLLMProvider):
    def __init__(
        self,
        api_key: str,
        model: str = "gpt-4o-mini",
        temperature: float = 0.7,
        max_tokens: int = 2048,
        **kwargs,
    ):
        super().__init__(model, temperature, max_tokens, **kwargs)
        self.client = AsyncOpenAI(api_key=api_key)
        self.logger = get_logger("openai_provider")

    async def chat(
        self,
        messages: List[Dict[str, str]],
        system: Optional[str] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        payload = list(messages)
        if system:
            payload = [{"role": "system", "content": system}] + payload

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=payload,  # type: ignore[arg-type]
                temperature=kwargs.get("temperature", self.temperature),
                max_tokens=kwargs.get("max_tokens", self.max_tokens),
            )
            choice = response.choices[0]
            usage = response.usage
            return {
                "content": choice.message.content or "",
                "role": choice.message.role,
                "finish_reason": choice.finish_reason,
                "usage": {
                    "prompt_tokens": usage.prompt_tokens if usage else 0,
                    "completion_tokens": usage.completion_tokens if usage else 0,
                    "total_tokens": usage.total_tokens if usage else 0,
                },
                "model": response.model,
            }
        except Exception as e:
            self.logger.error("OpenAI API error: %s", str(e))
            raise LLMProviderError("openai", self.model, str(e)) from e

    async def complete(self, prompt: str, **kwargs) -> Dict[str, Any]:
        return await self.chat(
            [{"role": "user", "content": prompt}], **kwargs
        )
