import type { ShowcaseProof } from "./types";

export const showcaseProofs: readonly ShowcaseProof[] = [
  {
    id: "webhero",
    title: "WEBHERO",
    role: "Living visual systems / spatial web R&D",
    summary: "WebGL stages, living images, spatial works and Art Room presentation.",
    mediaIds: ["webhero-living-environments", "webhero-metamorph-bubbles"],
    relatedCapabilityIds: ["webgl-3d-web", "webxr", "spatial-archive", "interactive-interface"],
    scoring: false,
  },
  {
    id: "photo-web",
    title: "PHOTO WEB",
    role: "Authored art-fashion photography interface",
    summary: "A living editorial archive shaped through series, image fields and cinematic navigation.",
    mediaIds: ["photo-web-entry", "photo-web-series"],
    relatedCapabilityIds: ["media-workflow", "interactive-interface"],
    scoring: false,
  },
  {
    id: "artist-stage",
    title: "ARTIST STAGE",
    role: "Cinematic artist / collector interface",
    summary: "Living artwork fields, spatial series, object inspection and collector-facing routes.",
    mediaIds: ["artist-stage-meta-bodies", "artist-stage-inner-structures"],
    relatedCapabilityIds: ["webgl-3d-web", "spatial-archive", "interactive-interface"],
    scoring: false,
  },
  {
    id: "model-site",
    title: "MODEL SITE",
    role: "Assisted spatial portfolio product",
    summary: "A live model portfolio and structured builder with human-controlled planning and revision boundaries.",
    mediaIds: ["model-site-portfolio", "model-site-builder"],
    relatedCapabilityIds: [
      "interactive-interface",
      "site-control-architecture",
      "control-contracts",
      "manifest-revision-validation",
    ],
    scoring: false,
  },
] as const;
