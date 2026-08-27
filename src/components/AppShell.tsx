import type { ReactNode } from "react";

import { AgentReadyIndicator } from "./AgentReadyIndicator";
import type { RegistrationState } from "../application/StatePort";

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
      <a href="#workspace" className="wordmark">BRENYCH / EVIDENCE</a>
      <AgentReadyIndicator state={registrationState} />
    </header>
    <main id="workspace" tabIndex={-1}>{children}</main>
  </div>
);
