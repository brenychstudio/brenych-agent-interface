import type { ActiveMode } from "../application/StatePort";
import type { ReactNode } from "react";

export const ExperienceStage = ({
  mode,
  studioRail,
  field,
  match,
  inspect,
  brief,
}: {
  readonly mode: ActiveMode;
  readonly studioRail: ReactNode;
  readonly field: ReactNode;
  readonly match?: ReactNode;
  readonly inspect?: ReactNode;
  readonly brief?: ReactNode;
}) => {
  const foregroundMode = mode === "inspect" || mode === "brief";
  return (
    <section className={`experience-stage experience-stage--${mode}`} data-testid="experience-stage" data-mode={mode} aria-label="Agent evidence experience">
      <div className={`stage-workspace stage-workspace--${mode}`}>
        {foregroundMode ? null : <aside className="stage-studio-rail">{studioRail}</aside>}
        <div className="stage-canvas" data-stage-canvas aria-hidden={foregroundMode || undefined} inert={foregroundMode || undefined}>{field}</div>
        {mode === "match" && match ? <div className="stage-match-rail">{match}</div> : null}
      </div>
      {mode === "inspect" && inspect ? <div className="stage-foreground stage-foreground--inspect">{inspect}</div> : null}
      {mode === "brief" && brief ? <div className="stage-foreground stage-foreground--brief">{brief}</div> : null}
    </section>
  );
};
