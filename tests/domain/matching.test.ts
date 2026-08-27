import { describe, expect, it } from "vitest";

import { matchCapability, resolveCapabilityAlias } from "../../src/domain/matchCapability";

describe("explicit capability resolution", () => {
  it("distinguishes canonical capability terms from configured aliases", () => {
    // This catches treating a readable expansion as a canonical term instead of the explicitly weaker alias.
    expect(resolveCapabilityAlias("mcp")).toMatchObject({
      capabilityId: "mcp",
      strength: 1,
      method: "exact",
    });
    expect(resolveCapabilityAlias("Model Context Protocol")).toMatchObject({
      capabilityId: "mcp",
      strength: 0.9,
      method: "alias",
    });
    expect(resolveCapabilityAlias("XR")).toMatchObject({
      capabilityId: "webxr",
      strength: 0.9,
      method: "alias",
    });
    expect(resolveCapabilityAlias("Manifest, revision, and validation")).toMatchObject({
      capabilityId: "manifest-revision-validation",
      strength: 1,
      method: "exact",
    });
  });

  it("matches only one configured directed related-capability edge", () => {
    // This catches recursive, reverse, or transitive relation matching.
    expect(matchCapability("mcp", "ai-automation")).toMatchObject({
      strength: 0.45,
      method: "related",
    });
    expect(matchCapability("ai automation", "mcp")).toMatchObject({
      strength: 0,
      method: "missing",
    });
    expect(matchCapability("mcp", "operator-workflow")).toMatchObject({
      strength: 0,
      method: "missing",
    });
  });

  it("leaves unrelated phrases missing without guessing", () => {
    // This catches substring or fuzzy fallback behavior for unsupported requirements.
    expect(matchCapability("native iOS", "electron")).toMatchObject({
      strength: 0,
      method: "missing",
    });
  });

  it("does not claim Distribution Desk integration evidence from MCP", () => {
    // This catches an unsupported MCP-to-integration relation creating a partial claim for Distribution Desk.
    expect(matchCapability("MCP", "integration-workflow")).toMatchObject({
      strength: 0,
      method: "missing",
    });
  });
});
