import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

import { SAFE_EXTERNAL_REL } from "../presentation/publicDestinations";
import type { EvidenceMedia, ShowcaseProof } from "../presentation/types";
import type { MediaInspectRequest } from "./CinematicMediaInspect";

/**
 * One authored showcase chapter. Scroll progress drives the two media planes through MotionValues,
 * so nothing here re-renders while the page scrolls; the copy stays a stable editorial anchor.
 */
export const ShowcaseProofChapter = ({
  proof,
  media,
  index,
  mode,
  onMediaInspect,
}: {
  readonly proof: ShowcaseProof;
  readonly media: readonly EvidenceMedia[];
  readonly index: number;
  readonly mode: "field" | "match";
  readonly onMediaInspect?: (request: MediaInspectRequest) => void;
}) => {
  const chapter = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: chapter,
    offset: ["start end", "end start"],
  });

  // The primary plane travels less than the secondary, so the pair separates gently while reading.
  const primaryY = useTransform(scrollYProgress, [0, 1], [24, -24]);
  const secondaryY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const settle = useTransform(scrollYProgress, [0, .22, .78, 1], [.9, 1, 1, .94]);

  const still = reduceMotion === true;
  const planeStyle = (offset: typeof primaryY) => (still ? undefined : { y: offset, opacity: settle });

  return (
    <motion.article
      ref={chapter}
      className="showcase-proof"
      data-showcase-id={proof.id}
      data-chapter-mode={mode}
      data-motion-state={still ? "static-final" : "scroll-linked"}
      aria-labelledby={`showcase-${proof.id}-title`}
    >
      <div className="showcase-media" aria-label={`${proof.title} supporting media`}>
        {media.map((item) => (
          <motion.figure
            key={item.id}
            className={`showcase-frame showcase-frame--${item.role}`}
            style={planeStyle(item.role === "primary" ? primaryY : secondaryY)}
          >
            <button
              type="button"
              className="media-open"
              data-layout-id={`media-inspect-${item.id}`}
              aria-label={`VIEW INTERFACE — ${proof.title} / ${item.caption}`}
              onClick={(event) => onMediaInspect?.({
                title: proof.title,
                media,
                activeId: item.id,
                origin: event.currentTarget,
                liveUrl: proof.liveUrl,
              })}
            >
              <img
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                loading="lazy"
                decoding="async"
                data-fit="contain"
                style={{ aspectRatio: `${item.width} / ${item.height}` }}
              />
              <span className="media-open-label" aria-hidden="true">VIEW INTERFACE</span>
            </button>
            <figcaption>{item.caption}</figcaption>
          </motion.figure>
        ))}
      </div>
      <div className="showcase-copy">
        <p className="showcase-index">{String(index + 1).padStart(2, "0")} / 04</p>
        <h3 id={`showcase-${proof.id}-title`}>{proof.title}</h3>
        <p className="showcase-role">{proof.role}</p>
        <p className="showcase-summary">{proof.summary}</p>
        <ul className="showcase-capabilities">
          {proof.capabilityLabels.map((label) => <li key={label}>{label}</li>)}
        </ul>
        {proof.liveUrl ? (
          <a
            className="showcase-live-link"
            href={proof.liveUrl}
            target="_blank"
            rel={SAFE_EXTERNAL_REL}
          >OPEN LIVE SITE ↗</a>
        ) : null}
      </div>
    </motion.article>
  );
};
