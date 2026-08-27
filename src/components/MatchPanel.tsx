import type { MatchResult } from "../domain/types";
import type { ProjectDossier } from "../application/AgentInterface";

import { RequirementMatrix } from "./RequirementMatrix";

export const MatchPanel = ({ result, dossiers }: { readonly result: MatchResult; readonly dossiers: readonly ProjectDossier[] }) => (
  <aside className="match-panel" aria-labelledby="fit-heading">
    <p className="eyebrow">EVIDENCE-BACKED FIT</p>
    <h2 id="fit-heading">{result.labels.coverage}</h2>
    <p className="coverage-value">{Math.round(result.evidenceCoverage * 100)}%</p>
    <p className="confidence">Confidence: {result.evidenceConfidence}</p>
    <section className="strongest-evidence" aria-labelledby="strongest-evidence-heading">
      <h3 id="strongest-evidence-heading">STRONGEST EVIDENCE</h3>
      <ol>
        {result.rankedProjects.filter((project) => project.score > 0).slice(0, 3).map((ranked) => {
          const dossier = dossiers.find((candidate) => candidate.id === ranked.projectId);
          const evidence = ranked.evidence[0] ? dossier?.evidence.find((record) => record.id === ranked.evidence[0]?.evidenceRecordId) : undefined;
          return <li key={ranked.projectId}><strong>{dossier?.title}</strong><span> Provenance: {evidence?.sourceLabel ?? "Public evidence record"}</span></li>;
        })}
      </ol>
    </section>
    <RequirementMatrix result={result} />
  </aside>
);
