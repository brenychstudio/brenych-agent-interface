import { useEffect, useRef, useState } from "react";

import type { AgentInterface, ProjectDossier } from "../application/AgentInterface";
import type { MatchResult } from "../domain/types";
import type { FocusedProjectContext } from "../state/selectors";

export const ProjectEvidenceInspect = ({
  agent,
  dossier,
  focus,
  match,
}: {
  readonly agent: AgentInterface;
  readonly dossier: ProjectDossier;
  readonly focus: FocusedProjectContext;
  readonly match: MatchResult | null;
}) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { headingRef.current?.focus(); }, []);

  const createBrief = (): void => {
    if (!match) return;
    try {
      agent.createCollaborationBrief({
        projectType: dossier.productType,
        requirements: match.requirements.map((requirement) => requirement.original),
      }, "manual");
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The collaboration brief could not be created.");
    }
  };

  return (
    <section className="inspect-surface" data-surface="integrated-shell" aria-labelledby="inspect-heading">
      <div className="inspect-header">
        <p className="eyebrow">PROJECT EVIDENCE INSPECT</p>
        <button type="button" className="surface-return" onClick={() => agent.close("manual")}>BACK TO EVIDENCE</button>
      </div>
      <h2 id="inspect-heading" tabIndex={-1} ref={headingRef}>SELECTED EVIDENCE</h2>
      <p className="inspect-project">{dossier.title}</p>
      <dl className="inspect-facts">
        <div><dt>PRODUCT</dt><dd>{dossier.productType}</dd></div>
        <div><dt>MATURITY</dt><dd>{dossier.maturity.replaceAll("_", " ")}</dd></div>
        <div><dt>VERIFICATION</dt><dd>{dossier.verificationLevels.map((level) => level.replaceAll("_", " ")).join(", ")}</dd></div>
      </dl>

      <section className="inspect-section" aria-labelledby="why-selected-heading">
        <h3 id="why-selected-heading">WHY SELECTED</h3>
        <p>{focus.reason}</p>
      </section>
      <section className="inspect-section" aria-labelledby="matched-requirements-heading" aria-label="MATCHED REQUIREMENTS">
        <h3 id="matched-requirements-heading">MATCHED REQUIREMENTS</h3>
        <ul>
          {focus.matchedRequirements.length > 0
            ? focus.matchedRequirements.map((requirement) => <li key={requirement}>{requirement}</li>)
            : <li>No directly matched requirements for this selection.</li>}
        </ul>
      </section>
      {focus.partialRequirements.length > 0 ? (
        <section className="inspect-section" aria-labelledby="partial-requirements-heading" aria-label="PARTIAL / RELATED EVIDENCE">
          <h3 id="partial-requirements-heading">PARTIAL / RELATED EVIDENCE</h3>
          <ul>{focus.partialRequirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul>
        </section>
      ) : null}
      <section className="inspect-section" aria-labelledby="claims-heading">
        <h3 id="claims-heading">EVIDENCE CLAIMS</h3>
        <ul className="evidence-claims">
          {dossier.evidence.map((evidence) => (
            <li key={evidence.id}>
              <p>{evidence.claim}</p>
              <p className="evidence-provenance">EVIDENCE VISIBILITY: {evidence.visibility.replaceAll("_", " ")}</p>
              <p className="evidence-provenance">SOURCE: {evidence.sourceLabel}{evidence.sourceReference ? ` — ${evidence.sourceReference}` : ""}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="inspect-section" aria-labelledby="limitations-heading">
        <h3 id="limitations-heading">LIMITATIONS / GAPS</h3>
        <ul>{dossier.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
      </section>
      <section className="inspect-section" aria-labelledby="public-boundary-heading">
        <h3 id="public-boundary-heading">PUBLIC BOUNDARY: {dossier.visibility.replaceAll("_", " ")}</h3>
        {dossier.links.length > 0 ? (
          <ul className="public-links">
            {dossier.links.map((link) => <li key={link.href}><a href={link.href}>{link.label}</a></li>)}
          </ul>
        ) : <p>No public link is represented for this evidence record.</p>}
      </section>
      {match ? <button type="button" className="primary-action inspect-brief-action" onClick={createBrief}>CREATE COLLABORATION BRIEF</button> : null}
      {error ? <p role="alert" className="form-error">{error}</p> : null}
    </section>
  );
};
