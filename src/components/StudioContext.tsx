import { SAFE_EXTERNAL_REL, SOURCE_URL, STUDIO_URL } from "../presentation/publicDestinations";

export const StudioContext = () => (
  <section className="studio-context" aria-labelledby="studio-thesis">
    <p className="studio-context-label">BRENYCH STUDIO / AGENT INTERFACE</p>
    <h1 id="studio-thesis">A portfolio that can prove fit, not only present work.</h1>
    <p className="studio-context-copy">
      The agent-facing evidence layer of Brenych Studio.<br />
      People and AI agents can evaluate real requirements, inspect the proof behind a match and prepare a collaboration brief in the same live interface.
    </p>
    <nav className="studio-links" aria-label="Brenych Studio destinations">
      <a href={STUDIO_URL} target="_blank" rel={SAFE_EXTERNAL_REL}>VISIT BRENYCH STUDIO ↗</a>
      <a href={SOURCE_URL} target="_blank" rel={SAFE_EXTERNAL_REL}>VIEW SOURCE ↗</a>
    </nav>
  </section>
);
