import type { MatchResult } from "../domain/types";

const labels = ["matched", "partial", "missing"] as const;

export const RequirementMatrix = ({ result }: { readonly result: MatchResult }) => (
  <section className="requirement-matrix" aria-labelledby="matrix-heading">
    <h2 id="matrix-heading">REQUIREMENT MATRIX</h2>
    {labels.map((label) => (
      <section key={label} className={`matrix-group matrix-${label}`} aria-label={result.labels[label]}>
        <h3>{result.labels[label]}</h3>
        <ul>
          {result.requirements.filter((requirement) => requirement.label === label).map((requirement) => (
            <li key={requirement.id}>{requirement.original}</li>
          ))}
          {result.requirements.every((requirement) => requirement.label !== label) ? <li>None</li> : null}
        </ul>
      </section>
    ))}
  </section>
);
