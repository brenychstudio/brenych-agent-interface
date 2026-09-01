import { useCallback, useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

export interface AnimatedDisclosureProps {
  readonly label: string;
  readonly children: ReactNode;
  /** Always-visible caption under the trigger, for counts that must read while the panel is closed. */
  readonly meta?: ReactNode;
  readonly defaultOpen?: boolean;
  readonly className?: string;
  readonly panelClassName?: string;
  readonly onOpenChange?: (open: boolean) => void;
}

/**
 * One quiet disclosure used by both the full evidence index and the inspect evidence details, so
 * every expandable surface in the interface opens with the same restraint as the rest of the system.
 * Presentation state only: the semantic store is never involved.
 */
export const AnimatedDisclosure = ({
  label,
  children,
  meta,
  defaultOpen = false,
  className,
  panelClassName,
  onOpenChange,
}: AnimatedDisclosureProps) => {
  const panelId = useId();
  const triggerId = useId();
  const [open, setOpen] = useState(defaultOpen);
  const reduceMotion = useReducedMotion();
  const still = reduceMotion === true;

  const toggle = useCallback((): void => {
    setOpen((current) => {
      const next = !current;
      onOpenChange?.(next);
      return next;
    });
  }, [onOpenChange]);

  return (
    <div className={`disclosure${className ? ` ${className}` : ""}`} data-open={open ? "true" : "false"}>
      <button
        type="button"
        id={triggerId}
        className="disclosure-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
      >
        <motion.span
          className="disclosure-indicator"
          aria-hidden="true"
          initial={false}
          animate={{ rotate: open ? 90 : 0 }}
          transition={still ? { duration: 0 } : { duration: .26, ease: EASE }}
        >›</motion.span>
        <span>{label}</span>
      </button>
      {meta ? <div className="disclosure-meta">{meta}</div> : null}
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="panel"
            id={panelId}
            role="region"
            aria-labelledby={triggerId}
            className={`disclosure-panel${panelClassName ? ` ${panelClassName}` : ""}`}
            initial={still ? false : { height: 0, opacity: 0, y: -6 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={still ? { height: 0, opacity: 0, y: 0 } : { height: 0, opacity: 0, y: -4 }}
            transition={still
              ? { duration: 0 }
              : {
                height: { duration: .29, ease: EASE },
                opacity: { duration: .24, ease: EASE },
                y: { duration: .29, ease: EASE },
              }}
          >
            <div className="disclosure-panel-inner">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
