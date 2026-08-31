import type { PublicProfile } from "./types";

export const PUBLIC_EVIDENCE_DATA_VERSION = "2026-08-27";

export const profile: PublicProfile = {
  name: "Brenych",
  studio: "Brenych Studio",
  roles: ["Design", "Development"],
  practiceAreas: ["Digital products", "Interactive interfaces", "Spatial web"],
  location: "Barcelona, Spain",
  focus: "Evidence-backed product, interface, workflow, and spatial-web work.",
  publicLinks: [{ label: "Brenych Studio", href: "https://brenychstudio.com", kind: "site" }],
  headline: "Public evidence workspace",
  summary:
    "A local, public-safe index of evidence-backed product and interface work.",
  dataVersion: PUBLIC_EVIDENCE_DATA_VERSION,
  evidenceBoundary: "Public summaries and verified public evidence only; no private repository access.",
};
