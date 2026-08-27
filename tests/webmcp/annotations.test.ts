import { describe, expect, it } from "vitest";

import { createAgentInterface } from "../../src/application/AgentInterface";
import { createAppStore } from "../../src/state/appStore";
import { createStoreStatePort } from "../../src/state/storeStatePort";
import { createToolDefinitions } from "../../src/webmcp/toolDefinitions";

const definitions = () => Object.fromEntries(createToolDefinitions(createAgentInterface(createStoreStatePort(createAppStore()))).map((tool) => [tool.name, tool]));

describe("WebMCP tool annotations", () => {
  it("marks queries read-only and marks matching as a local untrusted-content write", () => {
    // This catches an agent being told that a state-changing match is a harmless read.
    const byName = definitions();

    for (const name of ["get_profile", "get_capabilities", "list_projects", "get_project"]) {
      expect(byName[name]?.annotations).toEqual({ readOnlyHint: true });
    }
    expect(byName.match_requirements?.annotations).toEqual({ readOnlyHint: false, untrustedContentHint: true });
    expect(byName.focus_project?.annotations).toEqual({ readOnlyHint: false });
    expect(byName.create_collaboration_brief?.annotations).toEqual({ readOnlyHint: false, untrustedContentHint: true });
  });
});
