import { useEffect, useRef } from "react";

import { agentInterface, resetRuntimeForTesting, toolLifecycle } from "./runtime";
import { useAppStore } from "../state/appStore";
import type { ActiveMode } from "../application/StatePort";
import { selectFocusedProjectContext, selectProjectNodeStates } from "../state/selectors";
import { AppShell } from "../components/AppShell";
import { RequirementComposer } from "../components/RequirementComposer";
import { EvidenceField } from "../components/EvidenceField";
import { MatchPanel } from "../components/MatchPanel";
import { AgentActivity } from "../components/AgentActivity";
import { ResetControl } from "../components/ResetControl";
import { ProjectEvidenceInspect } from "../components/ProjectEvidenceInspect";
import { CollaborationBrief } from "../components/CollaborationBrief";

export const resetAppForTesting = (): void => resetRuntimeForTesting();

export const App = () => {
  const state = useAppStore();
  const nodes = selectProjectNodeStates(state);
  const dossiers = agentInterface.listProjects({ limit: 7 });
  const focus = selectFocusedProjectContext(state);
  const previousMode = useRef<ActiveMode>(state.activeMode);
  const originatingNode = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    void toolLifecycle.start();
    return () => { void toolLifecycle.stop(); };
  }, []);

  useEffect(() => {
    const previous = previousMode.current;
    if (previous === "inspect" && state.activeMode !== "brief") {
      const fallback = state.focusedProjectId
        ? document.querySelector<HTMLButtonElement>(`[data-project-id="${state.focusedProjectId}"]`)
        : null;
      (originatingNode.current ?? fallback)?.focus();
    }
    previousMode.current = state.activeMode;
  }, [state.activeMode, state.focusedProjectId]);

  useEffect(() => {
    if (state.activeMode !== "inspect" && state.activeMode !== "brief") return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        agentInterface.close("manual");
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [state.activeMode]);

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
      <div className="workspace-layout">
        <RequirementComposer agent={agentInterface} requirements={state.requirements} resetGeneration={state.resetGeneration} />
        <EvidenceField agent={agentInterface} dossiers={dossiers} nodes={nodes} receded={state.activeMode === "inspect" || state.activeMode === "brief"} inspectedProjectId={inspectedProjectId} onProjectFocus={(node) => { originatingNode.current = node; }} />
        {state.matchResult ? <MatchPanel result={state.matchResult} dossiers={dossiers} /> : null}
      </div>
      {state.activeMode === "inspect" && focusedDossier && focus ? <ProjectEvidenceInspect agent={agentInterface} dossier={focusedDossier} focus={focus} match={state.matchResult} /> : null}
      {state.activeMode === "brief" && state.collaborationDraft ? <CollaborationBrief agent={agentInterface} brief={state.collaborationDraft} relevantProjects={relevantProjects} /> : null}
      <footer className="workspace-footer">
        <AgentActivity action={state.currentAgentAction} />
        <ResetControl agent={agentInterface} />
      </footer>
    </AppShell>
  );
};
