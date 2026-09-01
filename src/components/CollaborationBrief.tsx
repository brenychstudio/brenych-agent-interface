import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { AgentInterface, ProjectDossier } from "../application/AgentInterface";
import { BRIEF_REQUIREMENTS_HINT, BRIEF_REQUIREMENTS_MAX_LENGTH, parseBriefRequirements, PUBLIC_INPUT_LIMITS } from "../application/inputBounds";
import type { CollaborationBrief as CollaborationBriefDraft } from "../domain/types";
import { SAFE_EXTERNAL_REL, STUDIO_URL } from "../presentation/publicDestinations";

type EditableField = "projectType" | "requirements" | "context" | "timeline" | "budget";

interface EditableBrief {
  readonly projectType: string;
  readonly requirements: string;
  readonly context: string;
  readonly timeline: string;
  readonly budget: string;
}

const toEditable = (brief: CollaborationBriefDraft): EditableBrief => ({
  projectType: brief.projectType,
  requirements: brief.requirements.join("\n"),
  context: brief.context,
  timeline: brief.timeline,
  budget: brief.budget,
});

const formatBrief = (brief: CollaborationBriefDraft, projects: readonly ProjectDossier[]): string => [
  "PROJECT BRIEF — DRAFT",
  `Project type: ${brief.projectType}`,
  `Requirements: ${brief.requirements.join(", ")}`,
  `Context: ${brief.context}`,
  `Timeline: ${brief.timeline}`,
  `Budget: ${brief.budget}`,
  `Relevant evidence projects: ${projects.map((project) => project.title).join(", ") || "None"}`,
  `Known gaps: ${brief.knownGaps.join(", ") || "None"}`,
  `Source match: ${brief.sourceMatchId}`,
].join("\n");

const fallbackCopy = (text: string): boolean => {
  const selection = document.createElement("textarea");
  selection.value = text;
  selection.setAttribute("readonly", "");
  selection.style.position = "fixed";
  selection.style.opacity = "0";
  document.body.append(selection);
  selection.select();
  const copied = typeof document.execCommand === "function" && document.execCommand("copy");
  selection.remove();
  return copied;
};

export const CollaborationBrief = ({
  agent,
  brief,
  relevantProjects,
}: {
  readonly agent: AgentInterface;
  readonly brief: CollaborationBriefDraft;
  readonly relevantProjects: readonly ProjectDossier[];
}) => {
  const [values, setValues] = useState<EditableBrief>(() => toEditable(brief));
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [fallbackText, setFallbackText] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const fallbackRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => { headingRef.current?.focus(); }, []);
  useEffect(() => { setValues(toEditable(brief)); }, [brief]);
  useLayoutEffect(() => {
    if (fallbackText) {
      fallbackRef.current?.focus();
      fallbackRef.current?.select();
    }
  }, [fallbackText]);

  const save = (field: EditableField, value: string): void => {
    setValues((current) => ({ ...current, [field]: value }));
    try {
      agent.updateCollaborationBrief({
        projectType: field === "projectType" ? value : values.projectType,
        requirements: field === "requirements" ? parseBriefRequirements(value) : parseBriefRequirements(values.requirements),
        context: field === "context" ? value : values.context,
        timeline: field === "timeline" ? value : values.timeline,
        budget: field === "budget" ? value : values.budget,
      }, "manual");
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The page-local draft could not be updated.");
    }
  };

  const updateRequirements = (value: string): void => {
    if (value.length > BRIEF_REQUIREMENTS_MAX_LENGTH) {
      setError(`requirements text must be at most ${BRIEF_REQUIREMENTS_MAX_LENGTH} characters`);
      return;
    }
    setValues((current) => ({ ...current, requirements: value }));
    setError(null);
  };

  const copy = async (): Promise<void> => {
    const text = formatBrief(brief, relevantProjects);
    setFallbackText(null);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopyStatus("Brief copied to clipboard.");
        return;
      }
      if (fallbackCopy(text)) {
        setCopyStatus("Brief copied to clipboard.");
      } else {
        setFallbackText(text);
        setCopyStatus("Brief could not be copied. The full draft is selected below for manual copy.");
      }
    } catch {
      if (fallbackCopy(text)) {
        setCopyStatus("Brief copied to clipboard.");
      } else {
        setFallbackText(text);
        setCopyStatus("Brief could not be copied. The full draft is selected below for manual copy.");
      }
    }
  };

  return (
    <section className="brief-surface" data-scroll-owner="document" aria-labelledby="brief-heading">
      <button type="button" className="surface-return brief-return" onClick={() => agent.close("manual")}>BACK TO EVIDENCE</button>
      <header className="brief-header">
        <div>
          <p className="eyebrow">HUMAN-CONTROLLED HANDOFF</p>
          <h2 id="brief-heading" tabIndex={-1} ref={headingRef}>PROJECT BRIEF</h2>
          <p className="brief-draft-label">EDITABLE PAGE-LOCAL WORKING DOCUMENT</p>
        </div>
      </header>
      <div className="brief-authority" aria-label="Brief authority boundary">
        <strong>PAGE-LOCAL DRAFT ONLY</strong>
        <span>NO SEND</span>
        <span>NO CRM</span>
        <span>NO NETWORK WRITE</span>
      </div>
      <div className="brief-fields">
        <label>Project type<input aria-label="Project type" value={values.projectType} maxLength={PUBLIC_INPUT_LIMITS.projectTypeLength} onChange={(event) => setValues({ ...values, projectType: event.target.value })} onBlur={(event) => save("projectType", event.target.value)} /></label>
        <label>Requirements<textarea aria-label="Requirements" aria-describedby="brief-requirements-hint" value={values.requirements} maxLength={BRIEF_REQUIREMENTS_MAX_LENGTH} onChange={(event) => updateRequirements(event.target.value)} onBlur={(event) => save("requirements", event.target.value)} /></label>
        <p id="brief-requirements-hint" className="brief-input-hint">{BRIEF_REQUIREMENTS_HINT}</p>
        <label>Context<textarea aria-label="Context" value={values.context} maxLength={PUBLIC_INPUT_LIMITS.contextLength} onChange={(event) => setValues({ ...values, context: event.target.value })} onBlur={(event) => save("context", event.target.value)} /></label>
        <label>Timeline<input aria-label="Timeline" value={values.timeline} maxLength={PUBLIC_INPUT_LIMITS.timelineLength} onChange={(event) => setValues({ ...values, timeline: event.target.value })} onBlur={(event) => save("timeline", event.target.value)} /></label>
        <label>Budget<input aria-label="Budget" value={values.budget} maxLength={PUBLIC_INPUT_LIMITS.budgetLength} onChange={(event) => setValues({ ...values, budget: event.target.value })} onBlur={(event) => save("budget", event.target.value)} /></label>
      </div>
      <section className="brief-evidence" aria-labelledby="relevant-projects-heading">
        <h3 id="relevant-projects-heading">RELEVANT EVIDENCE PROJECTS</h3>
        <ul className="evidence-chip-list">{relevantProjects.map((project) => <li className="evidence-chip" key={project.id}>{project.title}</li>)}</ul>
      </section>
      <section className="brief-evidence" aria-labelledby="known-gaps-heading">
        <h3 id="known-gaps-heading">KNOWN GAPS</h3>
        {brief.knownGaps.length > 0 ? <ul>{brief.knownGaps.map((gap) => <li key={gap}>{gap}</li>)}</ul> : <p>No known gaps in this source match.</p>}
      </section>
      <p className="brief-source">SOURCE MATCH: {brief.sourceMatchId}</p>
      <div className="brief-actions">
        <button type="button" className="primary-action" onClick={() => { void copy(); }}>COPY BRIEF</button>
        <a className="brief-studio-link" href={STUDIO_URL} target="_blank" rel={SAFE_EXTERNAL_REL}>CONTINUE WITH BRENYCH STUDIO ↗</a>
      </div>
      {fallbackText ? <textarea ref={fallbackRef} className="brief-copy-fallback" aria-label="Copyable brief text" value={fallbackText} readOnly /> : null}
      {copyStatus ? <p className="copy-status" role="status" aria-live="polite">{copyStatus}</p> : null}
      {error ? <p role="alert" className="form-error">{error}</p> : null}
    </section>
  );
};
