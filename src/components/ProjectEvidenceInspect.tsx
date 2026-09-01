import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

import type { AgentInterface, ProjectDossier } from "../application/AgentInterface";
import type { MatchResult } from "../domain/types";
import {
  evidenceVisibilityLabel,
  projectVisibilityLabel,
  verificationLevelLabel,
} from "../presentation/displayLabels";
import { mediaForOwner } from "../presentation/evidenceMedia";
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
  const media = mediaForOwner(dossier.id).slice(0, 2);

  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, []);

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
        <div>
          <p className="eyebrow">PROJECT EVIDENCE INSPECT</p>
          <p className="inspect-project">{dossier.title}</p>
        </div>
        <button type="button" className="surface-return" onClick={() => agent.close("manual")}>BACK TO EVIDENCE</button>
      </div>

      <div className="inspect-hero">
        <div className="inspect-narrative">
          <div className="inspect-title-block">
            <p className="inspect-selection">SELECTED / DETERMINISTIC EVIDENCE</p>
            <h2 id="inspect-heading" tabIndex={-1} ref={headingRef}>SELECTED EVIDENCE</h2>
            <p>{dossier.productType}</p>
          </div>
          <section className="inspect-section" aria-labelledby="project-is-heading">
            <h3 id="project-is-heading">WHAT THIS PROJECT IS</h3>
            <p className="inspect-summary">{dossier.summary}</p>
          </section>
          <section className="inspect-section" aria-labelledby="why-selected-heading">
            <h3 id="why-selected-heading">WHY IT WAS SELECTED</h3>
            <p>{match
              ? focus.reason
              : "Opened manually. Evaluate requirements to see evidence-backed relevance."}</p>
          </section>
          {match && focus.matchedRequirements.length > 0 ? (
            <section className="inspect-section" aria-labelledby="matched-requirements-heading" aria-label="MATCHED REQUIREMENTS">
              <h3 id="matched-requirements-heading">MATCHED REQUIREMENTS</h3>
              <ul className="inspect-chips">{focus.matchedRequirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul>
            </section>
          ) : null}
          {match && focus.partialRequirements.length > 0 ? (
            <section className="inspect-section" aria-labelledby="partial-requirements-heading" aria-label="PARTIAL / RELATED EVIDENCE">
              <h3 id="partial-requirements-heading">PARTIAL / RELATED EVIDENCE</h3>
              <ul className="inspect-chips">{focus.partialRequirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul>
            </section>
          ) : null}
          <section className="inspect-section" aria-labelledby="highlights-heading" aria-label="VERIFIED HIGHLIGHTS">
            <h3 id="highlights-heading">VERIFIED HIGHLIGHTS</h3>
            <ul className="verified-highlights">
              {dossier.verifiedHighlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
            </ul>
          </section>
        </div>

        {media.length > 0 ? (
          <div className="inspect-media" role="region" aria-label={`${dossier.title} evidence media`}>
            {media.map((item, index) => (
              <motion.figure
                key={item.id}
                className={`inspect-media-frame inspect-media-frame--${item.role}`}
                layoutId={index === 0 ? `project-evidence-${dossier.id}` : undefined}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  width={item.width}
                  height={item.height}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
                <figcaption>
                  <span>{item.caption}</span>
                  <small>USER-APPROVED VISUAL EVIDENCE · TECHNICAL CLAIMS VERIFIED SEPARATELY</small>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        ) : (
          <motion.div className="inspect-type-frame" layoutId={`project-evidence-${dossier.id}`} aria-label={`${dossier.title} type-led evidence`}>
            <span aria-hidden="true">{dossier.title.slice(0, 2).toUpperCase()}</span>
            <p>TYPE-LED EVIDENCE / NO SCREENSHOT CLAIMED</p>
          </motion.div>
        )}

        <aside className="inspect-evidence-rail" aria-label="Evidence provenance">
          <dl className="inspect-facts">
            <div><dt>PRODUCT</dt><dd>{dossier.productType}</dd></div>
            <div><dt>MATURITY</dt><dd>{dossier.maturityLabel}</dd></div>
            <div><dt>VERIFICATION</dt><dd>{dossier.verificationLevels.map(verificationLevelLabel).join(", ")}</dd></div>
          </dl>
          <section className="inspect-section inspect-boundary" aria-labelledby="public-boundary-heading">
            <h3 id="public-boundary-heading">PUBLIC / PRIVATE BOUNDARY</h3>
            <p className="boundary-label">{projectVisibilityLabel(dossier.visibility)}</p>
            {dossier.links.length > 0 ? (
              <ul className="public-links">
                {dossier.links.map((link) => <li key={link.href}><a href={link.href}>{link.label}</a></li>)}
              </ul>
            ) : <p>No public link is represented for this evidence record.</p>}
          </section>
        </aside>
      </div>

      <details className="inspect-details">
        <summary>VIEW EVIDENCE DETAILS</summary>
        <div className="inspect-details-layout">
          <section className="inspect-section" aria-labelledby="claims-heading">
            <h3 id="claims-heading">EVIDENCE VISIBILITY</h3>
            <ul className="evidence-claims">
              {dossier.evidence.map((evidence) => (
                <li key={evidence.id}>
                  <p>{evidence.claim}</p>
                  <p className="evidence-provenance">EVIDENCE VISIBILITY: {evidenceVisibilityLabel(evidence.visibility)}</p>
                  <p className="evidence-provenance">VERIFICATION: {verificationLevelLabel(evidence.verificationLevel)}</p>
                  <p className="evidence-provenance">SOURCE: {evidence.sourceLabel}{evidence.sourceReference ? ` — ${evidence.sourceReference}` : ""}</p>
                </li>
              ))}
            </ul>
          </section>
          <section className="inspect-section" aria-labelledby="limitations-heading">
            <h3 id="limitations-heading">KNOWN LIMITATIONS</h3>
            <ul>{dossier.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
          </section>
        </div>
      </details>
      {match ? <button type="button" className="primary-action inspect-brief-action" onClick={createBrief}>CREATE COLLABORATION BRIEF</button> : null}
      {error ? <p role="alert" className="form-error">{error}</p> : null}
    </section>
  );
};
