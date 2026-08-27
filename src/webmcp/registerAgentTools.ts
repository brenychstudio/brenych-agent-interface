import type { WebMcpPort, WebMcpToolDefinition } from "./webMcpPort";

const throwIfAborted = (signal: AbortSignal): void => {
  if (signal.aborted) throw new DOMException("Registration cancelled", "AbortError");
};

export const registerAgentTools = async (
  port: WebMcpPort,
  definitions: readonly WebMcpToolDefinition[],
  signal: AbortSignal,
): Promise<void> => {
  for (const definition of definitions) {
    throwIfAborted(signal);
    await port.registerTool(definition, { signal });
    throwIfAborted(signal);
  }
};
