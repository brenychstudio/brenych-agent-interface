import { afterEach, describe, expect, it } from "vitest";

import { BrowserWebMcpPort } from "../../src/webmcp/browserWebMcpPort";
import type { WebMcpToolDefinition } from "../../src/webmcp/webMcpPort";

const originalModelContext = Object.getOwnPropertyDescriptor(document, "modelContext");

const restoreModelContext = (): void => {
  if (originalModelContext) Object.defineProperty(document, "modelContext", originalModelContext);
  else Reflect.deleteProperty(document, "modelContext");
};

afterEach(restoreModelContext);

const definition: WebMcpToolDefinition = {
  name: "get_profile",
  title: "Get profile",
  description: "Read the public profile.",
  inputSchema: { type: "object", additionalProperties: false },
  execute: () => ({ ok: true }),
};

describe("BrowserWebMcpPort", () => {
  it("detects the document modelContext capability", () => {
    // This catches capability detection reading a non-standard global instead of the browser's document API.
    Object.defineProperty(document, "modelContext", { configurable: true, value: {} });

    expect(new BrowserWebMcpPort().isAvailable()).toBe(true);
  });

  it("registers through document.modelContext with exactly the lifecycle abort signal", async () => {
    // This catches registration losing cancellation ownership or widening access through exposedTo options.
    const signal = new AbortController().signal;
    let receivedDefinition: WebMcpToolDefinition | undefined;
    let receivedOptions: WebMCP.ModelContextRegisterToolOptions | undefined;
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {
        registerTool: async (nextDefinition: WebMcpToolDefinition, options: WebMCP.ModelContextRegisterToolOptions) => {
          receivedDefinition = nextDefinition;
          receivedOptions = options;
        },
      },
    });

    await new BrowserWebMcpPort().registerTool(definition, { signal });

    expect(receivedDefinition).toBe(definition);
    expect(receivedOptions).toEqual({ signal });
    expect(receivedOptions).not.toHaveProperty("exposedTo");
  });
});
