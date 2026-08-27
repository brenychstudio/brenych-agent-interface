import { useEffect, useState } from "react";

import type { AgentInterface } from "../application/AgentInterface";

const examples = ["Electron", "MCP", "AI automation", "Supabase"] as const;

export const RequirementComposer = ({
  agent,
  requirements,
  resetGeneration,
}: {
  readonly agent: AgentInterface;
  readonly requirements: readonly string[];
  readonly resetGeneration: number;
}) => {
  const [draft, setDraft] = useState<readonly string[]>(requirements);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setDraft(requirements), [requirements]);
  useEffect(() => {
    setInput("");
    setError(null);
  }, [resetGeneration]);

  const addRequirement = (candidate: string): void => {
    const value = candidate.trim();
    if (!value) return setError("Enter a requirement before adding it.");
    if (value.length > 80) return setError("Requirements must be 80 characters or fewer.");
    if (draft.some((requirement) => requirement.toLocaleLowerCase() === value.toLocaleLowerCase())) {
      return setError("That requirement is already included.");
    }
    if (draft.length >= 12) return setError("You can add at most 12 requirements.");
    setDraft([...draft, value]);
    setInput("");
    setError(null);
  };

  const evaluate = (): void => {
    if (draft.length === 0) return setError("Add at least one requirement to evaluate evidence.");
    try {
      agent.matchRequirements({ requirements: draft }, "manual");
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Requirements could not be evaluated.");
    }
  };

  return (
    <section className="requirement-composer" aria-labelledby="requirement-heading">
      <p className="eyebrow">MANUAL REQUIREMENTS</p>
      <h1 id="requirement-heading">WHAT ARE YOU BUILDING?</h1>
      <div className="example-chips" aria-label="Requirement examples">
        {examples.map((example) => (
          <button key={example} type="button" className="chip" aria-label={`Add ${example}`} onClick={() => addRequirement(example)}>
            {example}
          </button>
        ))}
      </div>
      <form className="requirement-input-row" onSubmit={(event) => { event.preventDefault(); addRequirement(input); }}>
        <label className="sr-only" htmlFor="requirement-input">Add a requirement</label>
        <input id="requirement-input" value={input} maxLength={80} onChange={(event) => setInput(event.target.value)} placeholder="Add a requirement" />
        <button type="submit">Add requirement</button>
      </form>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <ul className="requirement-list" aria-label="Current requirements">
        {draft.map((requirement) => (
          <li key={requirement}>
            <span>{requirement}</span>
            <button type="button" onClick={() => { setDraft(draft.filter((item) => item !== requirement)); setError(null); }} aria-label={`Remove ${requirement}`}>Remove</button>
          </li>
        ))}
      </ul>
      <div className="composer-actions">
        <button type="button" className="primary-action" onClick={evaluate}>EVALUATE EVIDENCE</button>
        <button type="button" onClick={() => { agent.clearMatch("manual"); setDraft([]); setInput(""); setError(null); }}>Clear match</button>
      </div>
    </section>
  );
};
