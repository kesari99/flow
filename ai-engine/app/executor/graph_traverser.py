from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set

from app.core.logging import get_logger


@dataclass
class Edge:
    source: str
    target: str
    condition: Optional[str] = None


@dataclass
class GraphNode:
    id: str
    type: str
    config: Dict[str, Any] = field(default_factory=dict)
    position: Dict[str, Any] = field(default_factory=dict)


class FlowGraph:
    def __init__(self, flow_data: Dict[str, Any]):
        self.nodes: Dict[str, GraphNode] = {}
        self.edges: List[Edge] = []
        self._parse_flow_data(flow_data or {})

    def _parse_flow_data(self, flow_data: Dict[str, Any]) -> None:
        for node in flow_data.get("nodes", []):
            node_id = node.get("id")
            if not node_id:
                continue
            data = node.get("data") or {}
            node_type = (
                data.get("type")
                or data.get("nodeType")
                or node.get("type")
                or ""
            )
            self.nodes[node_id] = GraphNode(
                id=node_id,
                type=str(node_type),
                config=data,
                position=node.get("position") or {},
            )

        for edge in flow_data.get("edges", []):
            source = edge.get("source")
            target = edge.get("target")
            if source and target:
                self.edges.append(
                    Edge(
                        source=source,
                        target=target,
                        condition=(edge.get("data") or {}).get("condition"),
                    )
                )

    def get_entry_nodes(self) -> List[str]:
        targets = {edge.target for edge in self.edges}
        return [node_id for node_id in self.nodes if node_id not in targets]

    def get_exit_nodes(self) -> List[str]:
        sources = {edge.source for edge in self.edges}
        return [node_id for node_id in self.nodes if node_id not in sources]

    def get_outgoing_edges(self, node_id: str) -> List[Edge]:
        return [edge for edge in self.edges if edge.source == node_id]

    def topological_sort(self) -> List[str]:
        in_degree = {node_id: 0 for node_id in self.nodes}
        for edge in self.edges:
            if edge.target in in_degree:
                in_degree[edge.target] += 1

        queue = [node_id for node_id, degree in in_degree.items() if degree == 0]
        result: List[str] = []

        while queue:
            node = queue.pop(0)
            result.append(node)
            for edge in self.get_outgoing_edges(node):
                if edge.target not in in_degree:
                    continue
                in_degree[edge.target] -= 1
                if in_degree[edge.target] == 0:
                    queue.append(edge.target)

        for node_id in self.nodes:
            if node_id not in result:
                result.append(node_id)

        return result


class GraphTraverser:
    def __init__(self, graph: FlowGraph):
        self.graph = graph
        self.logger = get_logger("graph_traverser")

    def get_execution_plan(self) -> List[str]:
        entry = self.graph.get_entry_nodes()
        if entry:
            return self._bfs_from(entry[0])
        return self.graph.topological_sort()

    def _bfs_from(self, start_node: str) -> List[str]:
        visited: Set[str] = set()
        queue = [start_node]
        path: List[str] = []

        while queue:
            node_id = queue.pop(0)
            if node_id in visited:
                continue
            visited.add(node_id)
            path.append(node_id)
            for edge in self.graph.get_outgoing_edges(node_id):
                if edge.target not in visited:
                    queue.append(edge.target)

        for node_id in self.graph.topological_sort():
            if node_id not in visited:
                path.append(node_id)

        return path
