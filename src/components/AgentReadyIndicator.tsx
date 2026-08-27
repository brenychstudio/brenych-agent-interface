import type { RegistrationState } from "../application/StatePort";

const labelFor = (state: RegistrationState): string => {
  switch (state) {
    case "ready": return "WebMCP ready";
    case "registering": return "WebMCP registering";
    case "error": return "WebMCP unavailable; manual controls remain available";
    case "unavailable": return "WebMCP unavailable; manual controls remain available";
    default: return "WebMCP checking";
  }
};

export const AgentReadyIndicator = ({ state }: { readonly state: RegistrationState }) => (
  <p className="agent-ready" aria-label={labelFor(state)}>
    <span aria-hidden="true">●</span> {labelFor(state)}
  </p>
);
