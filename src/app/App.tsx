import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { LayoutGroup, useReducedMotion } from "motion/react";

import { agentInterface, resetRuntimeForTesting, toolLifecycle } from "./runtime";
import { useAppStore } from "../state/appStore";
import type { ActiveMode } from "../application/StatePort";
import { selectCapabilityTraces, selectFocusedProjectContext, selectProjectNodeStates } from "../state/selectors";
import { AppShell } from "../components/AppShell";
import { RequirementComposer } from "../components/RequirementComposer";
import { EvidenceField } from "../components/EvidenceField";
import { MatchPanel } from "../components/MatchPanel";
import { AgentActivity } from "../components/AgentActivity";
import { ResetControl } from "../components/ResetControl";
import { ProjectEvidenceInspect } from "../components/ProjectEvidenceInspect";
import { CollaborationBrief } from "../components/CollaborationBrief";
import { ShowcaseProofLayer } from "../components/ShowcaseProofLayer";
import { StudioContext } from "../components/StudioContext";
import { ExperienceStage } from "../components/ExperienceStage";
import { CinematicMediaInspect, type MediaInspectRequest } from "../components/CinematicMediaInspect";

export const resetAppForTesting = (): void => resetRuntimeForTesting();

/** Presentation-only entry lifecycle. Semantic authority stays with the store; this only paces the staging. */
export type ForegroundPhase = "idle" | "entering" | "active";

/** Phase A wake through phase D content stagger, matching the 650–800 ms cinematic entry budget. */
const FOREGROUND_SETTLE_MS = 780;

/** The exact Evidence workspace position a foreground surface was opened from. */
interface SavedPagePosition {
  readonly left: number;
  readonly top: number;
}

export const App = () => {
  const state = useAppStore();
  const nodes = selectProjectNodeStates(state);
  const dossiers = agentInterface.listProjects({ limit: 7 });
  const focus = selectFocusedProjectContext(state);
  const connections = selectCapabilityTraces(state);
  const previousMode = useRef<ActiveMode>(state.activeMode);
  const previousFocusedProjectId = useRef<string | null>(state.focusedProjectId);
  const originatingNode = useRef<HTMLButtonElement | null>(null);
  const savedPagePosition = useRef<SavedPagePosition | null>(null);
  const scrollFrame = useRef<number | null>(null);
  const [mediaRequest, setMediaRequest] = useState<MediaInspectRequest | null>(null);
  const mediaRequestRef = useRef<MediaInspectRequest | null>(null);
  const [foregroundPhase, setForegroundPhase] = useState<ForegroundPhase>("idle");
  const reduceMotion = useReducedMotion();

  const openMediaInspect = useCallback((request: MediaInspectRequest): void => {
    mediaRequestRef.current = request;
    setMediaRequest(request);
  }, []);
  const closeMediaInspect = useCallback((): void => {
    mediaRequestRef.current = null;
    setMediaRequest(null);
  }, []);

  /**
   * Records the exact Evidence position and origin control while the workspace is still laid out.
   * Opening a project collapses the document to the foreground surface, and the browser clamps the
   * scroll position during that mutation, so reading it afterwards returns the clamped value.
   */
  const rememberEvidenceOrigin = useCallback((node: HTMLButtonElement): void => {
    originatingNode.current = node;
    if (savedPagePosition.current === null) {
      savedPagePosition.current = { left: window.scrollX, top: window.scrollY };
    }
  }, []);

  /**
   * The store notifies synchronously, before React commits the foreground DOM. Agent-driven
   * transitions such as the WebMCP focus_project tool have no originating control to capture from,
   * and by the time a layout effect runs the browser has already clamped the scroll position to the
   * shorter foreground document. Recording it on the transition itself is the only point where the
   * Evidence workspace position is still true for every entry path.
   */
  useEffect(() => useAppStore.subscribe((next, previous) => {
    const enteredForeground = (next.activeMode === "inspect" || next.activeMode === "brief")
      && previous.activeMode !== "inspect" && previous.activeMode !== "brief";
    if (enteredForeground && savedPagePosition.current === null) {
      savedPagePosition.current = { left: window.scrollX, top: window.scrollY };
    }
  }), []);

  useEffect(() => {
    void toolLifecycle.start();
    return () => { void toolLifecycle.stop(); };
  }, []);

  useLayoutEffect(() => {
    const previous = previousMode.current;
    const previousProject = previousFocusedProjectId.current;
    const isForeground = state.activeMode === "inspect" || state.activeMode === "brief";
    const wasForeground = previous === "inspect" || previous === "brief";

    // Last resort only. Both real entry paths capture earlier and more accurately: manual opens in
    // rememberEvidenceOrigin, agent transitions in the store subscription above. This value can
    // already be clamped, so it is never allowed to replace one of those.
    if (isForeground && !wasForeground && savedPagePosition.current === null) {
      savedPagePosition.current = { left: window.scrollX, top: window.scrollY };
    }

    // Every newly entered foreground surface starts from the top of the document, so the studio
    // header and the project heading are always in view and no position leaks between projects.
    const enteredForegroundSurface = isForeground
      && (!wasForeground || previous !== state.activeMode || previousProject !== state.focusedProjectId);
    if (enteredForegroundSurface) {
      if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
      scrollFrame.current = null;
      window.scrollTo({ left: 0, top: 0, behavior: "instant" });
    }

    if (wasForeground && !isForeground) {
      const matchingOrigin = originatingNode.current?.isConnected
        && originatingNode.current.dataset.projectId === state.focusedProjectId
        ? originatingNode.current
        : null;
      const fallback = state.focusedProjectId
        ? document.querySelector<HTMLButtonElement>(`button[data-project-id="${state.focusedProjectId}"]`)
        : null;
      (matchingOrigin ?? fallback)?.focus({ preventScroll: true });
      const saved = savedPagePosition.current;
      if (saved) {
        // The restored workspace only regains its full height once the browser has laid it out, and
        // a scroll target beyond the momentary document height is silently clamped. Apply the exact
        // position immediately, then re-apply for a couple of frames until the layout can hold it.
        const restore = (): void => window.scrollTo({ left: saved.left, top: saved.top, behavior: "instant" });
        restore();
        let attemptsLeft = 3;
        const settleScroll = (): void => {
          if (Math.abs(window.scrollY - saved.top) <= 1 && Math.abs(window.scrollX - saved.left) <= 1) return;
          restore();
          attemptsLeft -= 1;
          if (attemptsLeft > 0) scrollFrame.current = requestAnimationFrame(settleScroll);
        };
        scrollFrame.current = requestAnimationFrame(settleScroll);
        savedPagePosition.current = null;
      }
      originatingNode.current = null;
    }
    previousMode.current = state.activeMode;
    previousFocusedProjectId.current = state.focusedProjectId;
  }, [state.activeMode, state.focusedProjectId]);

  useEffect(() => {
    if (state.activeMode !== "inspect" && state.activeMode !== "brief") return;
    const onKeyDown = (event: KeyboardEvent): void => {
      // The media viewer is the topmost surface: it consumes the first Escape whichever listener runs first.
      if (event.key !== "Escape" || mediaRequestRef.current !== null || event.defaultPrevented) return;
      event.preventDefault();
      agentInterface.close("manual");
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [state.activeMode]);

  const foregroundMode = state.activeMode === "inspect" || state.activeMode === "brief";

  useLayoutEffect(() => {
    if (!foregroundMode) {
      setForegroundPhase("idle");
      return;
    }
    if (reduceMotion) {
      setForegroundPhase("active");
      return;
    }
    setForegroundPhase("entering");
    const settle = window.setTimeout(() => setForegroundPhase("active"), FOREGROUND_SETTLE_MS);
    return () => window.clearTimeout(settle);
  }, [foregroundMode, reduceMotion, state.activeMode, state.focusedProjectId]);

  const focusedDossier = focus ? dossiers.find((dossier) => dossier.id === focus.projectId) : undefined;
  const relevantProjects = state.collaborationDraft
    ? state.collaborationDraft.relevantProjectIds.flatMap((id) => {
      const dossier = dossiers.find((candidate) => candidate.id === id);
      return dossier ? [dossier] : [];
    })
    : [];
  const inspectedProjectId = state.activeMode === "inspect" || state.activeMode === "brief"
    ? state.focusedProjectId
    : null;

  return (
    <AppShell registrationState={state.registrationState}>
      <LayoutGroup id="cinematic-evidence">
        <div className={`experience experience--${state.activeMode}`} data-layout-group="media-inspect">
          <ExperienceStage
            mode={state.activeMode}
            phase={foregroundPhase}
            motionMode={reduceMotion ? "reduced" : "full"}
            selectedProjectId={inspectedProjectId}
            studioRail={<div className="studio-rail">
              <StudioContext />
              <RequirementComposer agent={agentInterface} requirements={state.requirements} resetGeneration={state.resetGeneration} />
            </div>}
            field={<EvidenceField agent={agentInterface} dossiers={dossiers} nodes={nodes} connections={connections} action={state.currentAgentAction} receded={state.activeMode === "inspect" || state.activeMode === "brief"} inspectedProjectId={inspectedProjectId} onProjectFocus={rememberEvidenceOrigin} />}
            match={state.matchResult ? <MatchPanel result={state.matchResult} dossiers={dossiers} /> : null}
            inspect={state.activeMode === "inspect" && focusedDossier && focus ? <ProjectEvidenceInspect agent={agentInterface} dossier={focusedDossier} focus={focus} match={state.matchResult} onMediaInspect={openMediaInspect} /> : null}
            brief={state.activeMode === "brief" && state.collaborationDraft ? <CollaborationBrief agent={agentInterface} brief={state.collaborationDraft} relevantProjects={relevantProjects} /> : null}
          />
          {state.activeMode === "field" || state.activeMode === "match"
            ? <ShowcaseProofLayer mode={state.activeMode} mediaViewerOpen={mediaRequest !== null} onMediaInspect={openMediaInspect} />
            : null}
          <CinematicMediaInspect request={mediaRequest} onClose={closeMediaInspect} />
        </div>
      </LayoutGroup>
      <footer className="workspace-footer">
        <AgentActivity action={state.currentAgentAction} />
        <ResetControl agent={agentInterface} />
      </footer>
    </AppShell>
  );
};
