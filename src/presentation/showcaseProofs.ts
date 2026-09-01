import { showcaseLiveUrl } from "./projectLinks";
import type { ShowcaseProof } from "./types";

export const showcaseProofs: readonly ShowcaseProof[] = [
  {
    id: "webhero",
    title: "WEBHERO",
    role: "Living visual systems / spatial web R&D",
    summary: "Living visual systems and spatial web R&D where WebGL stages, atmosphere, media and spatial presentation behave as one interface infrastructure.",
    mediaIds: ["webhero-living-environments", "webhero-metamorph-bubbles"],
    capabilityLabels: ["WEBGL STAGES", "SPATIAL MEDIA", "LIVING INTERFACES"],
    liveUrl: showcaseLiveUrl("webhero"),
    relatedCapabilityIds: ["webgl-3d-web", "webxr", "spatial-archive", "interactive-interface"],
    scoring: false,
  },
  {
    id: "photo-web",
    title: "PHOTO WEB",
    role: "Authored art-fashion photography interface",
    summary: "An authored art-fashion archive where photography, series and cinematic navigation operate as one living editorial field.",
    mediaIds: ["photo-web-entry", "photo-web-series"],
    capabilityLabels: ["EDITORIAL SYSTEM", "CINEMATIC NAVIGATION", "ART ARCHIVE"],
    liveUrl: showcaseLiveUrl("photo-web"),
    relatedCapabilityIds: ["media-workflow", "interactive-interface"],
    scoring: false,
  },
  {
    id: "artist-stage",
    title: "ARTIST STAGE",
    role: "Cinematic artist / collector interface",
    summary: "A cinematic artist and collector interface built around living artwork fields, spatial series, object inspection and collector-facing routes.",
    mediaIds: ["artist-stage-meta-bodies", "artist-stage-inner-structures"],
    capabilityLabels: ["ARTWORK SYSTEM", "COLLECTOR INTERFACE", "SPATIAL SERIES"],
    liveUrl: showcaseLiveUrl("artist-stage"),
    relatedCapabilityIds: ["webgl-3d-web", "spatial-archive", "interactive-interface"],
    scoring: false,
  },
  {
    id: "model-site",
    title: "MODEL SITE",
    role: "Assisted spatial portfolio product",
    summary: "An assisted spatial portfolio product combining a live model-facing site with structured planning, revision and builder surfaces.",
    mediaIds: ["model-site-portfolio", "model-site-builder"],
    capabilityLabels: ["PORTFOLIO BUILDER", "LIVE PREVIEW", "HUMAN CONTROL"],
    relatedCapabilityIds: [
      "interactive-interface",
      "site-control-architecture",
      "control-contracts",
      "manifest-revision-validation",
    ],
    scoring: false,
  },
] as const;
