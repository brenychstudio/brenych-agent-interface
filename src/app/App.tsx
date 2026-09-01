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

export const App = () => {
  const state = useAppStore();
  const nodes = selectProjectNodeStates(state);
  const dossiers = agentInterface.listProjects({ limit: 7 });
  const focus = selectFocusedProjectContext(state);
  const connections = selectCapabilityTraces(state);
  const previousMode = useRef<ActiveMode>(state.activeMode);
  const originatingNode = useRef<HTMLButtonElement | null>(null);
  const savedScrollPosition = useRef<number | null>(null);
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

  useEffect(() => {
    void toolLifecycle.start();
    return () => { void toolLifecycle.stop(); };
  }, []);

  useLayoutEffect(() => {
    const previous = previousMode.current;
    const enteredIntegratedSurface = previous !== "inspect"
      && previous !== "brief"
      && (state.activeMode === "inspect" || state.activeMode === "brief");
    if (enteredIntegratedSurface && savedScrollPosition.current === null) {
      savedScrollPosition.current = window.scrollY;
    }
    const leftIntegratedSurface = (previous === "inspect" || previous === "brief")
      && state.activeMode !== "inspect"
      && state.activeMode !== "brief";
    if (leftIntegratedSurface) {
      const matchingOrigin = originatingNode.current?.dataset.projectId === state.focusedProjectId
        ? originatingNode.current
        : null;
      const fallback = state.focusedProjectId
        ? document.querySelector<HTMLButtonElement>(`button[data-project-id="${state.focusedProjectId}"]`)
        : null;
      (matchingOrigin ?? fallback)?.focus({ preventScroll: true });
      if (savedScrollPosition.current !== null) {
        window.scrollTo({ left: 0, top: savedScrollPosition.current, behavior: "instant" });
        savedScrollPosition.current = null;
      }
      originatingNode.current = null;
    }
    previousMode.current = state.activeMode;
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
            field={<EvidenceField agent={agentInterface} dossiers={dossiers} nodes={nodes} connections={connections} action={state.currentAgentAction} receded={state.activeMode === "inspect" || state.activeMode === "brief"} inspectedProjectId={inspectedProjectId} onProjectFocus={(node) => { originatingNode.current = node; }} />}
            match={state.matchResult ? <MatchPanel result={state.matchResult} dossiers={dossiers} /> : null}
            inspect={state.activeMode === "inspect" && focusedDossier && focus ? <ProjectEvidenceInspect agent={agentInterface} dossier={focusedDossier} focus={focus} match={state.matchResult} onMediaInspect={openMediaInspect} /> : null}
            brief={state.activeMode === "brief" && state.collaborationDraft ? <CollaborationBrief agent={agentInterface} brief={state.collaborationDraft} relevantProjects={relevantProjects} /> : null}
          />
          {state.activeMode === "field" || state.activeMode === "match"
            ? <ShowcaseProofLayer mode={state.activeMode} onMediaInspect={openMediaInspect} />
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
