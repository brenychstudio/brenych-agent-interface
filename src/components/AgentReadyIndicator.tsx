import type { RegistrationState } from "../application/StatePort";

export const AgentReadyIndicator = ({ state }: { readonly state: RegistrationState }) => (
  <p className={`agent-ready${state === "ready" ? " is-online" : " is-manual"}`} aria-label="WebMCP host status">
    <span className="agent-ready-dot" aria-hidden="true">●</span>
    <strong>{state === "ready" ? "AGENT TOOLS ONLINE" : "MANUAL MODE"}</strong>
    {state === "ready" ? null : <small>Agent tools activate in a supported WebMCP host.</small>}
  </p>
);
