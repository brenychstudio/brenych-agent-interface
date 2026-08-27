import type { SemanticAction } from "../application/StatePort";

export const AgentActivity = ({ action }: { readonly action: SemanticAction | null }) => (
  <p className="agent-activity" role="status" aria-live="polite" aria-atomic="true">
    {action ? `${action.source === "manual" ? "Manual" : "WebMCP"} action: ${action.message}` : "Ready for a manual requirement evaluation."}
  </p>
);
