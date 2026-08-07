from app.nodes.base import BaseNode, NodeInput, NodeOutput, register_node


@register_node("chat_input")
class ChatInputNode(BaseNode):
    async def execute(self, input_data: NodeInput) -> NodeOutput:
        user_message = input_data.data.get("message", "")
        return NodeOutput(
            data={
                "message": user_message,
                "chat_history": input_data.data.get("chat_history", []),
                "raw_input": input_data.data,
            },
            metadata={
                "node_type": self.node_type,
                "message_length": len(user_message),
            },
        )
