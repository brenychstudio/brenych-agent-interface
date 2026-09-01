import type { ProjectDossier } from "../application/AgentInterface";
import type { ShowcaseProofId } from "./types";

/**
 * Presentation-only continuation links. Nothing here is inferred, generated, or derived from
 * scoring: every destination was independently checked for HTTPS, a 200 response and the rendered
 * product before it was written down. A system without a verified public destination gets no entry
 * and therefore no call to action.
 */
export const verifiedShowcaseUrls: Partial<Record<ShowcaseProofId, string>> = {
  webhero: "https://brenychstudio.com/immersive/webhero",
  "photo-web": "https://photo.brenychstudio.com",
  "artist-stage": "https://brenych-artist-stage.brenychinfo.workers.dev/",
  // Model Site has no deployed public URL: hosting.liveUrl is null and deployment is not-deployed.
};

export const showcaseLiveUrl = (id: ShowcaseProofId): string | undefined => verifiedShowcaseUrls[id];

/**
 * A project's live continuation is only ever a dossier link the evidence record already classified
 * as a site. Case studies and repositories stay what they are and are never promoted to live sites.
 */
export const projectLiveUrl = (links: ProjectDossier["links"]): string | undefined =>
  links.find((link) => link.kind === "site")?.href;
