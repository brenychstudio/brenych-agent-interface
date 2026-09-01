import type { ProjectDossier } from "../application/AgentInterface";
import type { MatchResult } from "../domain/types";
import { projectVisibilityLabel, verificationLevelLabel } from "../presentation/displayLabels";
import { mediaForOwner } from "../presentation/evidenceMedia";

import { RequirementMatrix } from "./RequirementMatrix";

export const MatchPanel = ({ result, dossiers }: { readonly result: MatchResult; readonly dossiers: readonly ProjectDossier[] }) => (
  <aside className="match-panel" aria-labelledby="fit-heading">
    <p className="eyebrow">EVIDENCE-BACKED FIT</p>
    <h2 id="fit-heading">{result.labels.coverage}</h2>
    <p className="coverage-value">{Math.round(result.evidenceCoverage * 100)}%</p>
    {/* The engine is deterministic evidence matching, never a probability about future success. */}
    <p className="evidence-model">EVIDENCE MODEL: DETERMINISTIC</p>
    <div className="coverage-counts" aria-label="Requirement coverage counts">
      <span><strong>{result.matched.length} / {result.requirements.length}</strong> REQUIREMENTS MATCHED</span>
      <span><strong>{result.partial.length}</strong> RELATED</span>
      <span><strong>{result.missing.length}</strong> NOT DEMONSTRATED</span>
    </div>
    <div className="match-compact-summary" aria-hidden="true">
      <span>MATCH SUMMARY</span>
      <strong>{Math.round(result.evidenceCoverage * 100)}%</strong>
      <span>{result.matched.length}/{result.requirements.length} REQUIREMENTS MATCHED · {result.partial.length} RELATED · {result.missing.length} NOT DEMONSTRATED</span>
    </div>
    <section className="strongest-evidence" aria-labelledby="strongest-evidence-heading">
      <h3 id="strongest-evidence-heading">STRONGEST EVIDENCE</h3>
      <ol>
        {result.rankedProjects.filter((project) => project.score > 0).slice(0, 3).map((ranked) => {
          const dossier = dossiers.find((candidate) => candidate.id === ranked.projectId);
          const primaryMedia = mediaForOwner(ranked.projectId).find((item) => item.role === "primary");
          const rank = result.rankedProjects.findIndex((candidate) => candidate.projectId === ranked.projectId) + 1;
          const direct = result.requirements
            .filter((requirement) => ranked.matchedRequirementIds.includes(requirement.id))
            .map((requirement) => requirement.original)
            .join(" · ");
          const related = result.requirements
            .filter((requirement) => ranked.partialRequirementIds.includes(requirement.id))
            .map((requirement) => requirement.original)
            .join(" · ");
          return (
            <li key={ranked.projectId} aria-label={`Rank ${rank} ${dossier?.title ?? ranked.projectId}`}>
              {primaryMedia ? (
                <img src={primaryMedia.src} alt="" width={primaryMedia.width} height={primaryMedia.height} loading="lazy" decoding="async" />
              ) : (
                <span className="match-type-mark" aria-hidden="true">{dossier?.title.slice(0, 2).toUpperCase()}</span>
              )}
              <div>
                <p><b>{String(rank).padStart(2, "0")}</b><strong>{dossier?.title}</strong></p>
                <span>{dossier?.verificationLevels[0]
                  ? verificationLevelLabel(dossier.verificationLevels[0])
                  : dossier ? projectVisibilityLabel(dossier.visibility) : "PUBLIC EVIDENCE"}</span>
                {direct ? <small>DIRECT: {direct}</small> : null}
                {related ? <small>RELATED: {related}</small> : null}
                {!direct && !related ? <small>Contributes verified project evidence</small> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
    <RequirementMatrix result={result} />
  </aside>
);
