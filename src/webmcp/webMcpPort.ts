export type WebMcpToolDefinition = WebMCP.ModelContextTool;

export interface WebMcpPort {
  isAvailable(): boolean;
  registerTool(definition: WebMcpToolDefinition, options: { signal: AbortSignal }): Promise<void>;
}
