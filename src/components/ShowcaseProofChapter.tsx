import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

import { SAFE_EXTERNAL_REL } from "../presentation/publicDestinations";
import type { EvidenceMedia, ShowcaseProof } from "../presentation/types";
import type { MediaInspectRequest } from "./CinematicMediaInspect";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * One authored showcase chapter. Scroll progress drives the two media planes through MotionValues,
 * so nothing here re-renders while the page scrolls; the copy stays a stable editorial anchor.
 */
export const ShowcaseProofChapter = ({
  proof,
  media,
  index,
  mode,
  frozen = false,
  onMediaInspect,
}: {
  readonly proof: ShowcaseProof;
  readonly media: readonly EvidenceMedia[];
  readonly index: number;
  readonly mode: "field" | "match";
  /** Holds the planes still while the media viewer owns the screen. */
  readonly frozen?: boolean;
  readonly onMediaInspect?: (request: MediaInspectRequest) => void;
}) => {
  const chapter = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: chapter,
    offset: ["start end", "end start"],
  });

  // Two separate systems, never competing for one property on one element.
  //
  // The outer plane carries continuous scroll parallax. On its own it is imperceptible: a chapter
  // passes through roughly 1500 px of scrolling, so even a 60 px range moves the cover only about
  // 3 px per 100 px scrolled, which the eye cannot separate from the page scrolling underneath it.
  // Depth comes from the secondary plane travelling visibly further than the primary.
  const primaryY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const secondaryX = useTransform(scrollYProgress, [0, 1], [12, -8]);
  const secondaryY = useTransform(scrollYProgress, [0, 1], [55, -55]);

  const still = reduceMotion === true;

  /**
   * The media viewer locks the body with a fixed negative offset. That makes scroll progress read
   * an artificial value, which would drift these planes by the full parallax range and leave the
   * cover in the wrong place exactly as the returning screenshot lands on it. Holding the last
   * live value keeps the return target still; the page cannot scroll while the viewer is open, so
   * releasing the hold afterwards resolves to the same number and never snaps.
   */
  const held = useRef<{ primaryY: number; secondaryX: number; secondaryY: number } | null>(null);
  const [, releaseHold] = useState(0);
  if (frozen && !held.current) {
    held.current = { primaryY: primaryY.get(), secondaryX: secondaryX.get(), secondaryY: secondaryY.get() };
  }

  // Released two frames after the viewer leaves. Closing restores the page position and unlocks the
  // body in the same commit, but scroll progress only recomputes on the following frame, so letting
  // go any earlier would show the cover at its locked value for one frame and correct it visibly.
  useEffect(() => {
    if (frozen || !held.current) return;
    let next = 0;
    const first = requestAnimationFrame(() => {
      next = requestAnimationFrame(() => {
        held.current = null;
        releaseHold((tick) => tick + 1);
      });
    });
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(next); };
  }, [frozen]);

  const planeStyle = (role: EvidenceMedia["role"]) => {
    if (still) return undefined;
    const hold = held.current;
    if (hold) {
      return role === "primary"
        ? { y: hold.primaryY }
        : { x: hold.secondaryX, y: hold.secondaryY };
    }
    return role === "primary" ? { y: primaryY } : { x: secondaryX, y: secondaryY };
  };

  // The inner surface carries the entry reveal. This one is time-based rather than scroll-linked,
  // so the movement is authored at a speed a reader actually perceives whatever their scroll rate.
  const entry = (role: EvidenceMedia["role"]) => {
    if (still) return { initial: false as const, animate: { x: 0, y: 0, opacity: 1, scale: 1 } };
    const primary = role === "primary";
    return {
      initial: primary
        ? { y: 38, opacity: .72, scale: .985 }
        : { x: 15, y: 58, opacity: .62, scale: .98 },
      whileInView: { x: 0, y: 0, opacity: 1, scale: 1 },
      viewport: { once: true, amount: .2 },
      transition: {
        duration: primary ? .62 : .72,
        delay: primary ? 0 : .09,
        ease: EASE,
      },
    };
  };

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
            style={planeStyle(item.role)}
          >
            <motion.div className="showcase-plane" {...entry(item.role)}>
              <motion.button
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
              </motion.button>
            </motion.div>
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
