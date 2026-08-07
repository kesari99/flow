from app.nodes.base import BaseNode, NodeInput, NodeOutput, register_node


@register_node("conditional")
class ConditionalNode(BaseNode):
    async def execute(self, input_data: NodeInput) -> NodeOutput:
        condition = self.config.get("condition", "")
        true_output = self.config.get("true_output", "true")
        false_output = self.config.get("false_output", "false")

        if not condition:
            raise ValueError("No condition provided")

        context = {
            "input": input_data.data,
            "metadata": input_data.metadata,
            "len": len,
            "str": str,
            "int": int,
            "float": float,
            "bool": bool,
        }

        try:
            result = eval(condition, {"__builtins__": {}}, context)
            is_true = bool(result)
            return NodeOutput(
                data={
                    "result": true_output if is_true else false_output,
                    "condition_result": is_true,
                    "message": input_data.data.get("message", ""),
                    "response": input_data.data.get("response", ""),
                },
                metadata={
                    "node_type": self.node_type,
                    "evaluated_to": is_true,
                },
            )
        except Exception as e:
            raise ValueError(
                f"Failed to evaluate condition: {condition}. Error: {e}"
            ) from e
