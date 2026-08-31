import type { ProjectDossier } from "../application/AgentInterface";
import type { CapabilityTrace, ProjectNodeState } from "../state/selectors";

export const CapabilityConnections = ({
  traces,
  nodes,
  dossiers,
}: {
  readonly traces: readonly CapabilityTrace[];
  readonly nodes: readonly ProjectNodeState[];
  readonly dossiers: readonly ProjectDossier[];
}) => {
  if (traces.length === 0) return null;

  return (
    <section className="capability-connections" aria-label="Evidence connections">
      <svg className="capability-connection-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {traces.map((trace, index) => {
          const node = nodes.find((item) => item.projectId === trace.projectId);
          const endX = Math.min(96, (node?.transform.x ?? 50) + 12);
          const endY = Math.min(94, (node?.transform.y ?? 50) + 11);
          const startY = 16 + index * 7;
          return (
            <path
              key={`${trace.requirementId}-${trace.projectId}`}
              d={`M 1 ${startY} C 22 ${startY}, ${Math.max(24, endX - 24)} ${endY}, ${endX} ${endY}`}
              pathLength="1"
            />
          );
        })}
      </svg>
      <ol className="capability-trace-list">
        {traces.map((trace) => {
          const title = dossiers.find((item) => item.id === trace.projectId)?.title ?? trace.project;
          return (
            <li
              key={`${trace.requirementId}-${trace.projectId}`}
              data-capability-id={trace.capabilityId}
              data-project-id={trace.projectId}
            >
              <span>{trace.requirement}</span>
              <span aria-hidden="true"> → </span>
              <strong>{trace.capability}</strong>
              <span aria-hidden="true"> → </span>
              <span>{title}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
