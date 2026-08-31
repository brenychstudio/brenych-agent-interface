import type {
  EvidenceVisibility,
  PublicVisibility,
  VerificationLevel,
} from "../domain/types";

const projectVisibilityLabels: Readonly<Record<PublicVisibility, string>> = {
  public: "PUBLIC EVIDENCE",
  public_summary_only: "PUBLIC SUMMARY",
};

const verificationLevelLabels: Readonly<Record<VerificationLevel, string>> = {
  verified_remote: "VERIFIED PUBLIC IMPLEMENTATION",
  verified_local: "OWNER-VERIFIED BEFORE PUBLICATION",
  portfolio_public: "PUBLIC PORTFOLIO EVIDENCE",
  owner_verified_private: "OWNER-VERIFIED IMPLEMENTATION",
};

const evidenceVisibilityLabels: Readonly<Record<EvidenceVisibility, string>> = {
  public_repo: "PUBLIC REPOSITORY",
  public_site: "PUBLIC SITE",
  portfolio_case: "PUBLIC PORTFOLIO CASE",
  owner_verified_private: "OWNER-VERIFIED IMPLEMENTATION",
};

export const projectVisibilityLabel = (visibility: PublicVisibility): string =>
  projectVisibilityLabels[visibility];

export const verificationLevelLabel = (level: VerificationLevel): string =>
  verificationLevelLabels[level];

export const evidenceVisibilityLabel = (visibility: EvidenceVisibility): string =>
  evidenceVisibilityLabels[visibility];
