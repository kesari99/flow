import { useParams } from "react-router-dom";
import { PageShell } from "@/components/PageShell";

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <PageShell
      title="Session Detail"
      description={`Transcript (chat_messages) and node execution timeline (node_executions) for session ${id}.`}
    />
  );
}
