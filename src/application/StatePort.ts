import type { CollaborationBrief, MatchResult, ProjectId } from "../domain/types";

export type ActionProvenance = "manual" | "webmcp";
export type ActiveMode = "field" | "match" | "inspect" | "brief";
export type RegistrationState = "idle" | "unavailable" | "registering" | "ready" | "error";

export interface SemanticAction {
  readonly source: ActionProvenance;
  readonly type: string;
  readonly message: string;
}

export interface AppSemanticState {
  readonly activeMode: ActiveMode;
  readonly modeHistory: readonly ActiveMode[];
  readonly resetGeneration: number;
  readonly requirements: readonly string[];
  readonly matchResult: MatchResult | null;
  readonly focusedProjectId: ProjectId | null;
  readonly collaborationDraft: CollaborationBrief | null;
  readonly currentAgentAction: SemanticAction | null;
  readonly webMcpAvailable: boolean;
  readonly registrationState: RegistrationState;
}

export type AppEvent =
  | { readonly type: "match_evaluated"; readonly match: MatchResult; readonly requirements: readonly string[]; readonly provenance: ActionProvenance }
  | { readonly type: "project_focused"; readonly projectId: ProjectId; readonly provenance: ActionProvenance }
  | { readonly type: "brief_created"; readonly match: MatchResult; readonly requirements: readonly string[]; readonly brief: CollaborationBrief; readonly provenance: ActionProvenance }
  | { readonly type: "brief_updated"; readonly match: MatchResult; readonly requirements: readonly string[]; readonly brief: CollaborationBrief; readonly provenance: ActionProvenance }
  | { readonly type: "mode_closed"; readonly provenance: ActionProvenance }
  | { readonly type: "match_cleared"; readonly provenance: ActionProvenance }
  | { readonly type: "semantic_reset"; readonly provenance: ActionProvenance }
  | { readonly type: "registration_changed"; readonly webMcpAvailable: boolean; readonly registrationState: RegistrationState; readonly provenance: ActionProvenance };

export interface StatePort {
  snapshot(): AppSemanticState;
  apply(event: AppEvent): void;
}
