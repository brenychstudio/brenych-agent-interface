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
import { projectLiveUrl } from "../presentation/projectLinks";
import { SAFE_EXTERNAL_REL } from "../presentation/publicDestinations";
import type { FocusedProjectContext } from "../state/selectors";
import { AnimatedDisclosure } from "./AnimatedDisclosure";
import type { MediaInspectRequest } from "./CinematicMediaInspect";

const nativeSiteControlFoundation = [
  "typed site contracts",
  "site manifest",
  "revision model",
  "validation and apply boundaries",
  "repository provider boundary",
  "deployment provider boundary",
] as const;

export const ProjectEvidenceInspect = ({
  agent,
  dossier,
  focus,
  match,
  onMediaInspect,
}: {
  readonly agent: AgentInterface;
  readonly dossier: ProjectDossier;
  readonly focus: FocusedProjectContext;
  readonly match: MatchResult | null;
  readonly onMediaInspect?: (request: MediaInspectRequest) => void;
}) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [error, setError] = useState<string | null>(null);
  const media = mediaForOwner(dossier.id);
  const liveUrl = projectLiveUrl(dossier.links);
  const rank = match
    ? match.rankedProjects.findIndex((ranked) => ranked.projectId === dossier.id) + 1
    : 0;
  // Presentation-only kicker. The project name remains the dominant heading of the surface.
  const kicker = rank > 0
    ? `${String(rank).padStart(2, "0")} / SELECTED EVIDENCE`
    : "SELECTED / DETERMINISTIC EVIDENCE";
  const evidenceVisibilitySummary = [
    ...new Set(dossier.evidence.map((evidence) => evidenceVisibilityLabel(evidence.visibility))),
  ].join(", ") || "NOT REPRESENTED";

  // The App establishes the canonical entry position; focus must not scroll it away again.
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
    <section
      className="inspect-surface"
      data-surface="integrated-shell"
      data-scroll-owner="document"
      aria-label={`${dossier.title} evidence inspect`}
    >
      <button type="button" className="surface-return inspect-return" onClick={() => agent.close("manual")}>BACK TO EVIDENCE</button>

      <div className="inspect-zone inspect-zone--identity" data-inspect-zone="identity">
        <p className="inspect-selection">{kicker}</p>
        <h2 id="inspect-heading" tabIndex={-1} ref={headingRef}>{dossier.title}</h2>
        <p className="inspect-product-type">{dossier.productType}</p>
      </div>

      <div className="inspect-zone inspect-zone--media" data-inspect-zone="media">
        {media.length > 0 ? (
          <div className="inspect-media" role="region" aria-label={`${dossier.title} evidence media`}>
            {media.map((item, index) => (
              <motion.figure
                key={item.id}
                className={`inspect-media-frame inspect-media-frame--${item.role}`}
                data-fit="contain"
                data-entry-layout-id={index === 0 ? `project-evidence-${dossier.id}` : undefined}
                layoutId={index === 0 ? `project-evidence-${dossier.id}` : undefined}
              >
                <motion.button
                  type="button"
                  className="media-open"
                  data-layout-id={`media-inspect-${item.id}`}
                  aria-label={`VIEW FULL INTERFACE ↗ — ${item.caption}`}
                  onClick={(event) => onMediaInspect?.({
                    title: dossier.title,
                    media,
                    activeId: item.id,
                    origin: event.currentTarget,
                    liveUrl,
                  })}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    width={item.width}
                    height={item.height}
                    data-fit="contain"
                    style={{ aspectRatio: `${item.width} / ${item.height}` }}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                  <span className="media-open-label" aria-hidden="true">VIEW FULL INTERFACE ↗</span>
                </motion.button>
                <figcaption>
                  <span>{item.caption}</span>
                  <small>USER-APPROVED VISUAL EVIDENCE · TECHNICAL CLAIMS VERIFIED SEPARATELY</small>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        ) : (
          <motion.div
            className="inspect-type-frame"
            data-entry-layout-id={`project-evidence-${dossier.id}`}
            layoutId={`project-evidence-${dossier.id}`}
            aria-label={`${dossier.title} type-led evidence`}
          >
            <span aria-hidden="true">{dossier.title.slice(0, 2).toUpperCase()}</span>
            {dossier.id === "native-site-control" ? (
              <>
                <p>ARCHITECTURE FOUNDATION</p>
                <p>PUBLIC UI NOT YET AVAILABLE</p>
              </>
            ) : <p>TYPE-LED EVIDENCE / NO SCREENSHOT CLAIMED</p>}
          </motion.div>
        )}
      </div>

      <div className="inspect-zone inspect-zone--summary" data-inspect-zone="summary" data-line-length="summary">
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
        {dossier.id === "native-site-control" ? (
          <section className="inspect-section inspect-foundation" aria-label="ARCHITECTURE FOUNDATION">
            <ul>
              {nativeSiteControlFoundation.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>
        ) : null}
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

      <aside className="inspect-zone inspect-evidence-rail" data-inspect-zone="rail" aria-label="Evidence provenance">
        <dl className="inspect-facts">
          <div><dt>PRODUCT</dt><dd>{dossier.productType}</dd></div>
          <div><dt>MATURITY</dt><dd>{dossier.maturityLabel}</dd></div>
          <div><dt>VERIFICATION</dt><dd>{dossier.verificationLevels.map(verificationLevelLabel).join(", ")}</dd></div>
          <div><dt>EVIDENCE VISIBILITY</dt><dd>{evidenceVisibilitySummary}</dd></div>
        </dl>
        <section className="inspect-section inspect-boundary" aria-labelledby="public-boundary-heading">
          <h3 id="public-boundary-heading">PUBLIC / PRIVATE BOUNDARY</h3>
          <p className="boundary-label">{projectVisibilityLabel(dossier.visibility)}</p>
          {dossier.links.length > 0 ? (
            <ul className="public-links">
              {dossier.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel={SAFE_EXTERNAL_REL}>{link.label}</a>
                </li>
              ))}
            </ul>
          ) : <p>No public link is represented for this evidence record.</p>}
        </section>
        {liveUrl ? (
          <a
            className="inspect-live-link"
            href={liveUrl}
            target="_blank"
            rel={SAFE_EXTERNAL_REL}
          >OPEN LIVE SITE ↗</a>
        ) : null}
      </aside>

      <div className="inspect-details">
        <AnimatedDisclosure label="VIEW EVIDENCE DETAILS" panelClassName="inspect-details-panel">
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
        </AnimatedDisclosure>
      </div>
      {match ? <button type="button" className="primary-action inspect-brief-action" onClick={createBrief}>CREATE COLLABORATION BRIEF</button> : null}
      {error ? <p role="alert" className="form-error">{error}</p> : null}
    </section>
  );
};
