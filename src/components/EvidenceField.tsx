import type { AgentInterface, ProjectDossier } from "../application/AgentInterface";
import type { ProjectNodeState } from "../state/selectors";

import { ProjectNode } from "./ProjectNode";

export const EvidenceField = ({
  agent,
  dossiers,
  nodes,
  receded = false,
  onProjectFocus,
  inspectedProjectId,
}: {
  readonly agent: AgentInterface;
  readonly dossiers: readonly ProjectDossier[];
  readonly nodes: readonly ProjectNodeState[];
  readonly receded?: boolean;
  readonly onProjectFocus?: (node: HTMLButtonElement) => void;
  readonly inspectedProjectId?: string | null;
}) => (
  <section className={`evidence-field${receded ? " is-receded" : ""}`} data-testid="evidence-field" aria-label="Evidence field">
    <div className="field-grid" aria-hidden="true" />
    <p className="field-label">SEVEN PUBLIC EVIDENCE RECORDS</p>
    {nodes.map((node) => {
      const dossier = dossiers.find((candidate) => candidate.id === node.projectId);
      return dossier ? <ProjectNode key={node.projectId} dossier={dossier} node={node} agent={agent} onProjectFocus={onProjectFocus} inspectedProjectId={inspectedProjectId} /> : null;
    })}
  </section>
);
