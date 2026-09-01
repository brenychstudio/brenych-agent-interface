import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

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
  const close = useRef(onClose);
  close.current = onClose;

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
        close.current();
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
  }, [step, total]);

  useLayoutEffect(() => {
    const body = document.body;
    const root = appRoot();
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

  return (
    <motion.div
      className="media-inspect"
      data-testid="media-inspect"
      data-motion-state={reduceMotion ? "static-final" : "cinematic"}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: reduceMotion ? 1 : 0 }}
      transition={{ duration: reduceMotion ? 0 : .2, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="media-inspect-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={captionId}
      >
        <header className="media-inspect-chrome">
          <div className="media-inspect-identity">
            <p className="media-inspect-eyebrow">FULL INTERFACE EVIDENCE</p>
            <h2 id={titleId}>{title}</h2>
          </div>
          <button
            type="button"
            ref={closeRef}
            className="media-inspect-control media-inspect-close"
            aria-label="Close media viewer"
            onClick={() => close.current()}
          >CLOSE</button>
        </header>

        <div className="media-inspect-stage">
          {total > 1 ? (
            <button
              type="button"
              className="media-inspect-control media-inspect-step"
              aria-label="Previous media"
              onClick={() => step(-1)}
            >PREV</button>
          ) : null}
          <motion.figure
            className="media-inspect-figure"
            data-layout-id={`media-inspect-${item.id}`}
            layoutId={reduceMotion ? undefined : `media-inspect-${item.id}`}
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
          </motion.figure>
          {total > 1 ? (
            <button
              type="button"
              className="media-inspect-control media-inspect-step"
              aria-label="Next media"
              onClick={() => step(1)}
            >NEXT</button>
          ) : null}
        </div>

        <footer className="media-inspect-meta">
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
        </footer>
      </div>
    </motion.div>
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
