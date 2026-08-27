export type ProjectId =
  | "bdb"
  | "distribution-desk"
  | "weekfield"
  | "sprintcrm"
  | "storyform"
  | "native-site-control"
  | "presence-os-memory-atlas";

export type CapabilityId =
  | "electron"
  | "mcp"
  | "ai-automation"
  | "supabase"
  | "crm"
  | "gmail-communication"
  | "operator-workflow"
  | "webgl-3d-web"
  | "webxr"
  | "spatial-archive"
  | "interactive-interface"
  | "publishing-workflow"
  | "integration-workflow"
  | "media-workflow"
  | "site-control-architecture"
  | "control-contracts"
  | "manifest-revision-validation";

export type PublicVisibility = "public" | "public_summary_only";

export type VerificationLevel =
  | "verified_remote"
  | "verified_local"
  | "portfolio_public"
  | "owner_verified_private";

export type EvidenceVisibility =
  | "public_repo"
  | "public_site"
  | "portfolio_case"
  | "owner_verified_private";

export type ProjectMaturity =
  | "owner_verified_implementation"
  | "beta_ready_prototype"
  | "public_case"
  | "functional_mvp_prototype";

export interface PublicLink {
  readonly label: string;
  readonly href: string;
  readonly kind: "site" | "case_study" | "repository";
}

export interface Project {
  readonly id: ProjectId;
  readonly displayName: string;
  readonly publicName: string;
  readonly publicEvidenceName?: string;
  readonly productType: string;
  readonly maturity: ProjectMaturity;
  readonly visibility: PublicVisibility;
  readonly verificationLevels: readonly VerificationLevel[];
  readonly summary: string;
  readonly capabilityIds: readonly CapabilityId[];
  readonly limitations: readonly string[];
  readonly links: readonly PublicLink[];
  readonly prohibitedClaims: readonly string[];
}

export interface Capability {
  readonly id: CapabilityId;
  readonly label: string;
  readonly category: string;
  readonly source: string;
  readonly summary: string;
  readonly aliases: readonly string[];
  readonly relatedCapabilityIds: readonly CapabilityId[];
}

export interface EvidenceRecord {
  readonly id: string;
  readonly projectId: ProjectId;
  readonly capabilityId: CapabilityId;
  readonly claim: string;
  readonly visibility: EvidenceVisibility;
  readonly verificationLevel: VerificationLevel;
  readonly sourceLabel: string;
  readonly sourceReference?: string;
}

export type MatchStrength = 0 | 0.45 | 0.9 | 1;

export type SupportedMatchStrength = Exclude<MatchStrength, 0>;

export type MatchMethod = "exact" | "alias" | "related" | "missing";

export interface NormalizedRequirement {
  readonly original: string;
  readonly normalized: string;
}

export interface RequirementDescriptor extends NormalizedRequirement {
  readonly id: string;
}

export interface CapabilityResolution {
  readonly capabilityId: CapabilityId;
  readonly strength: 1 | 0.9;
  readonly method: "exact" | "alias";
}

export interface CapabilityMatch {
  readonly requirementCapabilityId?: CapabilityId;
  readonly candidateCapabilityId: CapabilityId;
  readonly strength: MatchStrength;
  readonly method: MatchMethod;
}

export interface CollectedEvidence {
  readonly projectId: ProjectId;
  readonly requirementId: string;
  readonly evidenceRecordId: string;
  readonly capabilityId: CapabilityId;
  readonly strength: SupportedMatchStrength;
  readonly method: Exclude<MatchMethod, "missing">;
}

export type RequirementMatchLabel = "matched" | "partial" | "missing";

export interface RequirementResult {
  readonly id: string;
  readonly original: string;
  readonly normalized: string;
  readonly label: RequirementMatchLabel;
  readonly strength: MatchStrength;
  readonly capabilityId?: CapabilityId;
  readonly evidenceRecordIds: readonly string[];
}

export interface RankedProject {
  readonly projectId: ProjectId;
  readonly score: number;
  readonly matchedRequirementIds: readonly string[];
  readonly partialRequirementIds: readonly string[];
  readonly missingRequirementIds: readonly string[];
  readonly evidence: readonly CollectedEvidence[];
}

export interface MatchResult {
  readonly id: string;
  readonly requirements: readonly RequirementResult[];
  readonly evidenceCoverage: number;
  readonly evidenceConfidence: "high" | "medium" | "limited";
  readonly matched: readonly string[];
  readonly partial: readonly string[];
  readonly missing: readonly string[];
  readonly labels: {
    readonly coverage: "EVIDENCE COVERAGE";
    readonly matched: "MATCHED";
    readonly partial: "PARTIAL";
    readonly missing: "NOT DEMONSTRATED";
  };
  readonly rankedProjects: readonly RankedProject[];
  readonly methodVersion: "1.0.0";
  readonly dataVersion: string;
}

export interface MatchDataset {
  readonly projects: readonly Project[];
  readonly evidenceRecords: readonly EvidenceRecord[];
  readonly dataVersion: string;
}

export interface CollaborationBrief {
  readonly id: string;
  readonly projectType: string;
  readonly requirements: readonly string[];
  readonly context: string;
  readonly timeline: string;
  readonly budget: string;
  readonly relevantProjectIds: readonly ProjectId[];
  readonly knownGaps: readonly string[];
  readonly sourceMatchId: string;
  readonly provenance: "manual" | "webmcp";
}

export interface AgentAction {
  readonly source: "manual" | "webmcp";
  readonly type: string;
  readonly message: string;
}

export interface InputError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
}

export interface PublicProfile {
  readonly name: string;
  readonly studio: string;
  readonly roles: readonly string[];
  readonly practiceAreas: readonly string[];
  readonly location: string;
  readonly focus: string;
  readonly publicLinks: readonly PublicLink[];
  readonly headline: string;
  readonly summary: string;
  readonly dataVersion: string;
  readonly evidenceBoundary: string;
}
