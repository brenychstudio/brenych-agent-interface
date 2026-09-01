import type { RegistrationState } from "../application/StatePort";

/**
 * The indicator reports the real registration state and nothing else. A connection is claimed only
 * once the agent tools are actually registered with a host; every other state keeps honest wording,
 * and manual control remains a supported product path rather than a failure.
 */
const presentation: Record<RegistrationState, { readonly label: string; readonly note?: string }> = {
  ready: { label: "WEBMCP CONNECTED · AGENT TOOLS ONLINE" },
  registering: {
    label: "CONNECTING TO WEBMCP HOST",
    note: "Registering agent tools with the host.",
  },
  idle: {
    label: "CHECKING FOR WEBMCP HOST",
    note: "Looking for a supported WebMCP host.",
  },
  unavailable: {
    label: "MANUAL MODE",
    note: "Agent tools activate in a supported WebMCP host.",
  },
  error: {
    label: "MANUAL MODE",
    note: "Agent tools could not register here. Manual control remains available.",
  },
};

export const AgentReadyIndicator = ({ state }: { readonly state: RegistrationState }) => {
  const { label, note } = presentation[state];
  return (
    <p
      className={`agent-ready${state === "ready" ? " is-online" : " is-manual"}`}
      data-registration-state={state}
      aria-label="WebMCP host status"
    >
      <span className="agent-ready-dot" aria-hidden="true">●</span>
      <strong>{label}</strong>
      {note ? <small>{note}</small> : null}
    </p>
  );
};
