from app.nodes.base import BaseNode, NodeInput, NodeOutput, register_node


@register_node("text_combiner")
class TextCombinerNode(BaseNode):
    async def execute(self, input_data: NodeInput) -> NodeOutput:
        texts = input_data.data.get("texts", [])
        if not texts:
            texts = []
            for key, value in input_data.data.items():
                if key in ("message", "response", "context") and isinstance(
                    value, str
                ):
                    texts.append(value)
                elif isinstance(value, list) and all(
                    isinstance(t, str) for t in value
                ):
                    texts.extend(value)

        if not texts:
            raise ValueError("No texts provided to combine")

        separator = self.config.get("separator", "\n\n")
        combined = separator.join(texts)

        return NodeOutput(
            data={
                "combined_text": combined,
                "message": combined,
                "response": combined,
                "source_count": len(texts),
            },
            metadata={
                "node_type": self.node_type,
                "texts_combined": len(texts),
            },
        )
