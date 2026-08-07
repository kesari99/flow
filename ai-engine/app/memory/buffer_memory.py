from collections import deque
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class Message(BaseModel):
    role: str
    content: str
    metadata: dict = Field(default_factory=dict)
    timestamp: Optional[str] = None


class BufferMemory:
    def __init__(self, session_id: str, max_messages: int = 50):
        self.session_id = session_id
        self.max_messages = max_messages
        self._messages: deque = deque(maxlen=max_messages)

    def add_message(self, message: Message) -> None:
        if not message.timestamp:
            message.timestamp = datetime.utcnow().isoformat()
        self._messages.append(message)

    def get_messages(self, last_n: Optional[int] = None) -> List[Message]:
        messages = list(self._messages)
        if last_n:
            return messages[-last_n:]
        return messages

    def clear(self) -> None:
        self._messages.clear()

    def get_context_string(self) -> str:
        return "\n".join(
            f"{msg.role}: {msg.content}" for msg in self.get_messages()
        )
