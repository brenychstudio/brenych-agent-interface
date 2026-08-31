import type { CapabilityId, ProjectId } from "../domain/types";

export type ShowcaseProofId = "webhero" | "photo-web" | "artist-stage" | "model-site";

export interface ShowcaseProof {
  readonly id: ShowcaseProofId;
  readonly title: string;
  readonly role: string;
  readonly summary: string;
  readonly mediaIds: readonly EvidenceMediaId[];
  readonly relatedCapabilityIds: readonly CapabilityId[];
  readonly scoring: false;
}

export type EvidenceMediaId =
  | "bdb-task-control"
  | "bdb-workspace"
  | "distribution-campaign-setup"
  | "distribution-campaign-workspace"
  | "storyform-editor-workflow"
  | "model-site-portfolio"
  | "model-site-builder"
  | "photo-web-entry"
  | "photo-web-series"
  | "artist-stage-meta-bodies"
  | "artist-stage-inner-structures"
  | "webhero-living-environments"
  | "webhero-metamorph-bubbles"
  | "weekfield-smart-mix"
  | "weekfield-planet-field";

export interface EvidenceMedia {
  readonly id: EvidenceMediaId;
  readonly ownerId: ProjectId | ShowcaseProofId;
  readonly role: "primary" | "secondary";
  readonly src: string;
  readonly alt: string;
  readonly caption: string;
  readonly sourceKind: "user_approved_screenshot";
  readonly publicSafe: true;
  readonly contentHash: string;
  readonly width: number;
  readonly height: number;
}
