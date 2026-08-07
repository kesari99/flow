from app.nodes.base import BaseNode, NodeInput, NodeOutput, register_node


@register_node("chat_output")
class ChatOutputNode(BaseNode):
    async def execute(self, input_data: NodeInput) -> NodeOutput:
        response = (
            input_data.data.get("response")
            or input_data.data.get("message")
            or ""
        )
        source_documents = input_data.data.get("source_documents", [])

        output_data = {"response": response}
        if source_documents:
            output_data["source_documents"] = source_documents

        return NodeOutput(
            data=output_data,
            metadata={
                "node_type": self.node_type,
                "response_length": len(str(response)),
            },
        )
