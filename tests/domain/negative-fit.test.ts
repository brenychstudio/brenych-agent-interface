import { describe, expect, it } from "vitest";

import { buildMatchResult } from "../../src/domain/matchRequirements";

describe("negative fit", () => {
  it("reports unsupported native requirements as missing without fallback score inflation", () => {
    // This catches unsupported native claims being inferred from adjacent desktop, web, or spatial evidence.
    const result = buildMatchResult(["Swift", "Metal", "native iOS"]);

    expect(result.evidenceCoverage).toBe(0);
    expect(result.requirements.map((requirement) => requirement.label)).toEqual([
      "missing",
      "missing",
      "missing",
    ]);
    expect(result.rankedProjects.every((project) => project.score === 0)).toBe(true);
  });
});
