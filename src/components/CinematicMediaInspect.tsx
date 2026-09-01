import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";

import { SAFE_EXTERNAL_REL } from "../presentation/publicDestinations";
import type { EvidenceMedia, EvidenceMediaId } from "../presentation/types";

export interface MediaInspectCollection {
  readonly title: string;
  readonly media: readonly EvidenceMedia[];
  readonly liveUrl?: string;
}

export interface MediaInspectRequest extends MediaInspectCollection {
  readonly activeId: EvidenceMediaId;
  readonly origin: HTMLElement;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const appRoot = (): HTMLElement | null =>
  document.getElementById("root") ?? document.querySelector<HTMLElement>("[data-app-root]");

const MediaInspectSession = ({
  request,
  onClose,
}: {
  readonly request: MediaInspectRequest;
  readonly onClose: () => void;
}) => {
  const { title, media, liveUrl, activeId, origin } = request;
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const captionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [figureScope, animateFigure] = useAnimate<HTMLElement>();
  const close = useRef(onClose);
  close.current = onClose;

  // Presentation-only lifecycle. The store never learns about it: the viewer simply stays mounted,
  // holding its scroll lock, inert root and origin, until the media has finished returning home.
  const [phase, setPhase] = useState<"open" | "closing">("open");
  const closing = phase === "closing";

  /**
   * The geometry the media must return to, measured before the body scroll lock is applied.
   * The lock pins the body with a negative offset, which shifts every page element out of its
   * visible position, so the source cannot be measured while the viewer is open: it reports a
   * rect far off-screen. Captured here once, this is exactly where the cover sits again after
   * the lock is released.
   */
  const originGeometry = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  const requestClose = useCallback((): void => {
    setPhase((current) => (current === "open" ? "closing" : current));
  }, []);

  const total = media.length;
  const [index, setIndex] = useState(() => {
    const found = media.findIndex((item) => item.id === activeId);
    return found < 0 ? 0 : found;
  });
  const item = media[Math.min(index, total - 1)];

  const step = useCallback((delta: number): void => {
    setIndex((current) => (current + delta + total) % total);
  }, [total]);

  // Declared before the page-state effect so these listeners are removed before focus returns to the origin.
  useLayoutEffect(() => {
    const onFocusIn = (event: FocusEvent): void => {
      const dialog = dialogRef.current;
      if (!dialog || (event.target instanceof Node && dialog.contains(event.target))) return;
      closeRef.current?.focus({ preventScroll: true });
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }
      if (total > 1 && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
        event.preventDefault();
        step(event.key === "ArrowRight" ? 1 : -1);
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const controls = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (controls.length === 0) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      const active = document.activeElement;
      const boundary = event.shiftKey ? first : last;
      if (active === boundary || !(active instanceof Node) || !dialog.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus({ preventScroll: true });
      }
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [requestClose, step, total]);

  useLayoutEffect(() => {
    const body = document.body;
    const root = appRoot();
    const sourceMedia = origin.querySelector("img") ?? origin;
    const sourceRect = sourceMedia.getBoundingClientRect();
    originGeometry.current = {
      x: sourceRect.x, y: sourceRect.y, width: sourceRect.width, height: sourceRect.height,
    };
    const previous = {
      hadInert: root?.hasAttribute("inert") ?? false,
      inert: root?.getAttribute("inert") ?? "",
      hadStyle: body.hasAttribute("style"),
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    };
    root?.setAttribute("inert", "");
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `${-previous.scrollY}px`;
    body.style.left = `${-previous.scrollX}px`;
    body.style.right = "0";
    body.style.width = "100%";
    closeRef.current?.focus({ preventScroll: true });
    let released = false;
    return () => {
      if (released) return;
      released = true;
      if (previous.hadInert) root?.setAttribute("inert", previous.inert);
      else root?.removeAttribute("inert");
      body.style.overflow = previous.overflow;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      if (!previous.hadStyle && body.getAttribute("style") === "") body.removeAttribute("style");
      window.scrollTo({ left: previous.scrollX, top: previous.scrollY, behavior: "instant" });
      if (origin.isConnected) origin.focus({ preventScroll: true });
    };
  }, [origin]);

  // The environment rises progressively behind the travelling screenshot rather than cutting in.
  const backdrop = reduceMotion
    ? { initial: false as const, animate: { opacity: closing ? 0 : 1 } }
    : {
      initial: { opacity: 0 },
      // Held through most of the return so the page behind never shows a second copy of the cover.
      animate: closing
        ? { opacity: 0, transition: { duration: .4, delay: .06, ease: EASE } }
        : { opacity: 1, transition: { duration: .36, ease: EASE } },
    };

  // Chrome resolves after the media has begun expanding, and leaves first on the way out.
  const chrome = reduceMotion
    ? { initial: false as const, animate: { opacity: closing ? 0 : 1, y: 0 } }
    : {
      initial: { opacity: 0, y: 6 },
      animate: closing
        ? { opacity: 0, y: 4, transition: { duration: .14, ease: EASE } }
        : { opacity: 1, y: 0, transition: { duration: .3, delay: .18, ease: EASE } },
    };

  /**
   * One continuous transform in both directions, measured against the real source rect. Both the
   * viewer plane and the cover render the same screenshot with contain geometry, so scaling by the
   * width ratio lands the image exactly, with no distortion and no correction at the end.
   */
  const flipToSource = useCallback((): { x: number; y: number; scale: number } | null => {
    const figure = figureScope.current;
    const source = originGeometry.current;
    if (!figure || !source || !source.width) return null;
    const rect = figure.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const image = figure.querySelector("img");
    const media = image?.getBoundingClientRect() ?? rect;
    if (!media.width) return null;
    const scale = source.width / media.width;
    return {
      scale,
      x: (source.x + source.width / 2) - (rect.x + rect.width / 2),
      y: (source.y + source.height / 2) - (rect.y + rect.height / 2),
    };
  }, [figureScope]);

  // Opening: the plane starts on the cover and expands into place.
  useLayoutEffect(() => {
    if (reduceMotion) return;
    const figure = figureScope.current;
    const from = flipToSource();
    if (!figure || !from) return;
    // Placed on the cover synchronously, before this frame is painted, so the plane is never shown
    // at its full size first. Motion then takes the same value over and expands it into place.
    figure.style.transformOrigin = "50% 50%";
    figure.style.transform = `translate(${from.x}px, ${from.y}px) scale(${from.scale})`;
    const controls = animateFigure(
      figure,
      { x: [from.x, 0], y: [from.y, 0], scale: [from.scale, 1] },
      { duration: .46, ease: EASE },
    );
    return () => controls.stop();
  // Intentionally session-scoped: the opening geometry is fixed at mount.
  }, [animateFigure, figureScope, flipToSource, reduceMotion]);

  // Closing: the same plane contracts back onto the cover, and only then does the shell leave.
  useLayoutEffect(() => {
    if (!closing) return;
    const figure = figureScope.current;
    const to = reduceMotion ? null : flipToSource();
    if (!figure || !to) {
      close.current();
      return;
    }
    let cancelled = false;
    const controls = animateFigure(
      figure,
      { x: to.x, y: to.y, scale: to.scale },
      { duration: .44, ease: EASE },
    );
    void controls.then(() => { if (!cancelled) close.current(); });
    return () => { cancelled = true; controls.stop(); };
  }, [animateFigure, closing, figureScope, flipToSource, reduceMotion]);

  return (
    <div
      className="media-inspect"
      data-media-returning={closing ? "true" : undefined}
      data-testid="media-inspect"
      data-motion-state={reduceMotion ? "static-final" : "cinematic"}
    >
      <motion.div className="media-inspect-backdrop" aria-hidden="true" {...backdrop} />
      <div
        className="media-inspect-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={captionId}
      >
        <motion.header className="media-inspect-chrome" {...chrome}>
          <div className="media-inspect-identity">
            <p className="media-inspect-eyebrow">FULL INTERFACE EVIDENCE</p>
            <h2 id={titleId}>{title}</h2>
          </div>
          <button
            type="button"
            ref={closeRef}
            className="media-inspect-control media-inspect-close"
            aria-label="Close media viewer"
            onClick={requestClose}
          >CLOSE</button>
        </motion.header>

        <div className="media-inspect-stage">
          {total > 1 ? (
            <motion.button
              type="button"
              className="media-inspect-control media-inspect-step"
              aria-label="Previous media"
              onClick={() => step(-1)}
              {...chrome}
            >PREV</motion.button>
          ) : null}
          {/* A plain element on purpose: a Motion component rewrites its own transform on mount,
              which would discard the pre-paint starting geometry and show one full-size frame. */}
          <figure
            ref={figureScope}
            className="media-inspect-figure"
            data-layout-id={`media-inspect-${item.id}`}
          >
            <img
              src={item.src}
              alt={item.alt}
              width={item.width}
              height={item.height}
              loading="eager"
              decoding="async"
              data-fit="contain"
              style={{ aspectRatio: `${item.width} / ${item.height}` }}
            />
          </figure>
          {total > 1 ? (
            <motion.button
              type="button"
              className="media-inspect-control media-inspect-step"
              aria-label="Next media"
              onClick={() => step(1)}
              {...chrome}
            >NEXT</motion.button>
          ) : null}
        </div>

        <motion.footer className="media-inspect-meta" {...chrome}>
          <div className="media-inspect-copy">
            <p className="media-inspect-caption" id={captionId}>{item.caption}</p>
            <p className="media-inspect-role">{item.role === "primary" ? "PRIMARY EVIDENCE" : "SUPPORTING EVIDENCE"}</p>
          </div>
          <p className="media-inspect-count" role="status" aria-live="polite">{`${index + 1} / ${total}`}</p>
          {liveUrl ? (
            <a
              className="media-inspect-live"
              href={liveUrl}
              target="_blank"
              rel={SAFE_EXTERNAL_REL}
            >OPEN LIVE SITE ↗</a>
          ) : null}
        </motion.footer>
      </div>
    </div>
  );
};

export const CinematicMediaInspect = ({
  request,
  onClose,
}: {
  readonly request: MediaInspectRequest | null;
  readonly onClose: () => void;
}) => {
  const open = request && request.media.length > 0 ? request : null;
  return createPortal(
    <AnimatePresence>
      {open ? (
        <MediaInspectSession key={`${open.title}:${open.activeId}`} request={open} onClose={onClose} />
      ) : null}
    </AnimatePresence>,
    document.body,
  );
};
