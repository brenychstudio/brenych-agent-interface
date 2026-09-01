import { motion } from "motion/react";

import type { ActiveMode } from "../application/StatePort";
import type { ReactNode } from "react";

export type ForegroundPhase = "idle" | "entering" | "active";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Staged foreground entry. The paper backdrop lifts beneath the travelling evidence media, then
 * project identity and evidence resolve. Only the backdrop carries a transform, so the sticky Back
 * control and the single document scroll established earlier in 03B stay intact.
 */
const backdropEntry = (still: boolean) => ({
  initial: still ? false : { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: still ? { duration: 0 } : { duration: .48, delay: .3, ease: EASE },
});

const paperEntry = (still: boolean) => ({
  initial: still ? false : { opacity: 0 },
  animate: { opacity: 1 },
  transition: still ? { duration: 0 } : { duration: .34, delay: .3, ease: EASE },
});

const contentEntry = (still: boolean) => ({
  initial: still ? false : { opacity: 0 },
  animate: { opacity: 1 },
  transition: still ? { duration: 0 } : { duration: .32, delay: .46, ease: EASE },
});

export const ExperienceStage = ({
  mode,
  studioRail,
  field,
  match,
  inspect,
  brief,
  phase = "idle",
  motionMode = "full",
  selectedProjectId = null,
}: {
  readonly mode: ActiveMode;
  readonly studioRail: ReactNode;
  readonly field: ReactNode;
  readonly match?: ReactNode;
  readonly inspect?: ReactNode;
  readonly brief?: ReactNode;
  readonly phase?: ForegroundPhase;
  readonly motionMode?: "full" | "reduced";
  readonly selectedProjectId?: string | null;
}) => {
  const foregroundMode = mode === "inspect" || mode === "brief";
  const still = motionMode === "reduced";
  const foreground = mode === "inspect" ? inspect : mode === "brief" ? brief : null;
  return (
    <section
      className={`experience-stage experience-stage--${mode}`}
      data-testid="experience-stage"
      data-mode={mode}
      data-foreground={foregroundMode ? mode : undefined}
      data-foreground-phase={phase}
      data-motion-mode={motionMode}
      data-selected-project-id={selectedProjectId ?? undefined}
      aria-label="Agent evidence experience"
    >
      <div className={`stage-workspace stage-workspace--${mode}`}>
        {foregroundMode ? null : <aside className="stage-studio-rail">{studioRail}</aside>}
        <div className="stage-canvas" data-stage-canvas aria-hidden={foregroundMode || undefined} inert={foregroundMode || undefined}>{field}</div>
        {mode === "match" && match ? <div className="stage-match-rail">{match}</div> : null}
      </div>
      {foregroundMode && foreground ? (
        <motion.div
          key={mode}
          className={`stage-foreground stage-foreground--${mode}`}
          data-testid="foreground-paper"
          data-foreground-phase={phase}
          {...paperEntry(still)}
        >
          <motion.div className="stage-foreground-backdrop" aria-hidden="true" {...backdropEntry(still)} />
          <motion.div
            className={`stage-foreground-inner stage-foreground-inner--${mode}`}
            {...contentEntry(still)}
          >{foreground}</motion.div>
        </motion.div>
      ) : null}
    </section>
  );
};
