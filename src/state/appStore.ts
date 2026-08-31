import { create } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";

import type { AppEvent, AppSemanticState, ActiveMode, SemanticAction } from "../application/StatePort";

export interface AppStore extends AppSemanticState {
  apply(event: AppEvent): void;
}

const initialState = (): AppSemanticState => ({
  activeMode: "field",
  modeHistory: [],
  resetGeneration: 0,
  requirements: [],
  matchResult: null,
  focusedProjectId: null,
  collaborationDraft: null,
  currentAgentAction: null,
  webMcpAvailable: false,
  registrationState: "idle",
});

const cloneRequirements = (requirements: readonly string[]): readonly string[] => [...requirements];

const cloneEvent = (event: AppEvent): AppEvent =>
  "requirements" in event ? { ...event, requirements: cloneRequirements(event.requirements) } : { ...event };

const freezeStoreState = (state: AppStore): AppStore =>
  Object.freeze({
    ...state,
    modeHistory: Object.freeze([...state.modeHistory]),
    requirements: Object.freeze([...state.requirements]),
    currentAgentAction: state.currentAgentAction
      ? Object.freeze({ ...state.currentAgentAction })
      : null,
  });

const actionFor = (event: AppEvent): SemanticAction | null => {
  const source = event.provenance;
  switch (event.type) {
    case "match_evaluated": return { source, type: "match_requirements", message: "Requirements evaluated." };
    case "project_focused": return { source, type: "focus_project", message: "Project selected." };
    case "brief_created": return { source, type: "create_collaboration_brief", message: "Collaboration brief created in page state." };
    case "brief_updated": return { source, type: "update_collaboration_brief", message: "Collaboration brief updated in page state." };
    case "mode_closed": return { source, type: "close", message: "Returned to the prior workspace." };
    case "match_cleared": return { source, type: "clear_match", message: "Requirement evaluation cleared." };
    case "semantic_reset": return { source, type: "reset", message: "Semantic user state reset." };
    case "registration_changed": return null;
  }
};

const pushMode = (state: AppSemanticState, next: ActiveMode): Pick<AppSemanticState, "activeMode" | "modeHistory"> => {
  if (state.activeMode === next) return { activeMode: next, modeHistory: state.modeHistory };
  const modeHistory = [...state.modeHistory, state.activeMode].slice(-3);
  return { activeMode: next, modeHistory };
};

export const reduceAppEvent = (state: AppSemanticState, event: AppEvent): AppSemanticState => {
  const currentAgentAction = actionFor(event) ?? state.currentAgentAction;
  switch (event.type) {
    case "match_evaluated":
      return { ...state, activeMode: "match", modeHistory: ["field"], requirements: cloneRequirements(event.requirements), matchResult: event.match, focusedProjectId: null, collaborationDraft: null, currentAgentAction };
    case "project_focused":
      return { ...state, ...pushMode(state, "inspect"), focusedProjectId: event.projectId, currentAgentAction };
    case "brief_created":
      return {
        ...state,
        ...(state.activeMode === "field"
          ? { activeMode: "brief" as const, modeHistory: ["field", "match"] as const }
          : pushMode(state, "brief")),
        requirements: cloneRequirements(event.requirements),
        matchResult: event.match,
        focusedProjectId: state.matchResult?.id === event.match.id
          ? state.focusedProjectId
          : event.brief.relevantProjectIds[0] ?? null,
        collaborationDraft: event.brief,
        currentAgentAction,
      };
    case "brief_updated":
      return {
        ...state,
        requirements: cloneRequirements(event.requirements),
        matchResult: event.match,
        focusedProjectId: state.matchResult?.id === event.match.id
          ? state.focusedProjectId
          : event.brief.relevantProjectIds[0] ?? null,
        collaborationDraft: event.brief,
        currentAgentAction,
      };
    case "mode_closed": {
      const previous = state.modeHistory.at(-1) ?? "field";
      const modeHistory = state.modeHistory.slice(0, -1);
      return { ...state, activeMode: previous, modeHistory, currentAgentAction };
    }
    case "match_cleared":
      return { ...state, activeMode: "field", modeHistory: [], requirements: [], matchResult: null, focusedProjectId: null, collaborationDraft: null, currentAgentAction };
    case "semantic_reset":
      return {
        ...initialState(),
        resetGeneration: state.resetGeneration + 1,
        matchResult: null,
        focusedProjectId: null,
        collaborationDraft: null,
        webMcpAvailable: state.webMcpAvailable,
        registrationState: state.registrationState,
        currentAgentAction,
      };
    case "registration_changed":
      return { ...state, webMcpAvailable: event.webMcpAvailable, registrationState: event.registrationState, currentAgentAction };
  }
};

const createStoreCreator = (set: (updater: (state: AppStore) => AppStore, replace: true) => void): AppStore => {
  const apply: AppStore["apply"] = (event) =>
    set(
      (state) => freezeStoreState({ ...reduceAppEvent(state, cloneEvent(event)), apply: state.apply }),
      true,
    );
  return freezeStoreState({ ...initialState(), apply });
};

export const createAppStore = (): StoreApi<AppStore> => createStore<AppStore>()((set) => createStoreCreator(set));

export const useAppStore = create<AppStore>()((set) => createStoreCreator(set));
