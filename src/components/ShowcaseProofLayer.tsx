import { evidenceMedia } from "../presentation/evidenceMedia";
import { showcaseProofs } from "../presentation/showcaseProofs";
import type { MediaInspectRequest } from "./CinematicMediaInspect";
import { ShowcaseProofChapter } from "./ShowcaseProofChapter";

export const ShowcaseProofLayer = ({
  mode,
  mediaViewerOpen = false,
  onMediaInspect,
}: {
  readonly mode: "field" | "match";
  readonly mediaViewerOpen?: boolean;
  readonly onMediaInspect?: (request: MediaInspectRequest) => void;
}) => (
  <section
    className={`showcase-layer${mode === "match" ? " is-subdued" : ""}`}
    aria-label="Selected studio systems"
  >
    <header className="showcase-header">
      <div>
        <p className="eyebrow">SUPPORTING PROOF — NON-SCORING</p>
        <h2 id="showcase-heading">SELECTED STUDIO SYSTEMS</h2>
        <p className="showcase-subtitle">Creative, spatial and product interfaces from the wider Brenych Studio practice.</p>
        <p className="showcase-media-authority">SHOWCASE VISUALS: USER-APPROVED SCREENSHOTS · TECHNICAL CLAIMS VERIFIED SEPARATELY</p>
      </div>
      <p className="showcase-boundary">NOT INCLUDED IN EVIDENCE COVERAGE</p>
    </header>
    <div className="showcase-grid">
      {showcaseProofs.map((proof, index) => (
        <ShowcaseProofChapter
          key={proof.id}
          proof={proof}
          index={index}
          mode={mode}
          frozen={mediaViewerOpen}
          onMediaInspect={onMediaInspect}
          media={proof.mediaIds.flatMap((id) => {
            const item = evidenceMedia.find((candidate) => candidate.id === id);
            return item ? [item] : [];
          })}
        />
      ))}
    </div>
  </section>
);
