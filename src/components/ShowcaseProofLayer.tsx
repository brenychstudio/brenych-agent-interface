import { evidenceMedia } from "../presentation/evidenceMedia";
import { showcaseProofs } from "../presentation/showcaseProofs";

export const ShowcaseProofLayer = ({ quiet = false }: { readonly quiet?: boolean }) => (
  <section
    className={`showcase-layer${quiet ? " is-quiet" : ""}`}
    aria-label="Selected studio systems"
  >
    <header className="showcase-header">
      <div>
        <p className="eyebrow">SUPPORTING PROOF — NON-SCORING</p>
        <h2 id="showcase-heading">SELECTED STUDIO SYSTEMS</h2>
        <p className="showcase-media-authority">SHOWCASE VISUALS: USER-APPROVED SCREENSHOTS · TECHNICAL CLAIMS VERIFIED SEPARATELY</p>
      </div>
      <p className="showcase-boundary">NOT INCLUDED IN EVIDENCE COVERAGE</p>
    </header>
    <div className="showcase-grid">
      {showcaseProofs.map((proof, index) => {
        const media = proof.mediaIds.flatMap((id) => {
          const item = evidenceMedia.find((candidate) => candidate.id === id);
          return item ? [item] : [];
        });
        return (
          <article className="showcase-proof" key={proof.id} data-showcase-id={proof.id}>
            <div className="showcase-media" aria-label={`${proof.title} supporting media`}>
              {media.map((item) => (
                <figure key={item.id} className={`showcase-frame showcase-frame--${item.role}`}>
                  <img
                    src={item.src}
                    alt={item.alt}
                    width={item.width}
                    height={item.height}
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption>{item.caption}</figcaption>
                </figure>
              ))}
            </div>
            <div className="showcase-copy">
              <p className="showcase-index">{String(index + 1).padStart(2, "0")} / 04</p>
              <h3>{proof.title}</h3>
              <p className="showcase-role">{proof.role}</p>
              <p>{proof.summary}</p>
            </div>
          </article>
        );
      })}
    </div>
  </section>
);
