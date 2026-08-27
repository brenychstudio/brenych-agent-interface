import type { WebMcpPort, WebMcpToolDefinition } from "./webMcpPort";

export class BrowserWebMcpPort implements WebMcpPort {
  isAvailable(): boolean {
    return typeof document !== "undefined" && document.modelContext !== undefined;
  }

  async registerTool(definition: WebMcpToolDefinition, options: { signal: AbortSignal }): Promise<void> {
    const modelContext = document.modelContext;
    if (!modelContext) throw new Error("WebMCP is unavailable");
    await modelContext.registerTool(definition, { signal: options.signal });
  }
}
