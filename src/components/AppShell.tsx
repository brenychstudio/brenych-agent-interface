import type { ReactNode } from "react";

import { AgentReadyIndicator } from "./AgentReadyIndicator";
import type { RegistrationState } from "../application/StatePort";
import { SAFE_EXTERNAL_REL, STUDIO_URL } from "../presentation/publicDestinations";

export const AppShell = ({
  registrationState,
  children,
}: {
  readonly registrationState: RegistrationState;
  readonly children: ReactNode;
}) => (
  <div className="app-shell">
    <a className="skip-link" href="#workspace">Skip to evidence workspace</a>
    <header className="app-header">
      <a href={STUDIO_URL} className="wordmark" target="_blank" rel={SAFE_EXTERNAL_REL} aria-label="BRENYCH STUDIO">
        <strong>BRENYCH STUDIO</strong>
        <span>AGENT INTERFACE</span>
      </a>
      <AgentReadyIndicator state={registrationState} />
    </header>
    <main id="workspace" tabIndex={-1}>{children}</main>
  </div>
);
