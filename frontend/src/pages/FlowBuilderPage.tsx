import { useParams } from "react-router-dom";
import { PageShell } from "@/components/PageShell";

export default function FlowBuilderPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <PageShell
      title="Flow Builder"
      description={`Canvas editor for flow #${id}. Loads flow_data with version history (flow_versions).`}
    />
  );
}
