export interface ToolError {
  readonly code: "CANCELLED" | "INVALID_INPUT" | "INTERNAL_ERROR";
  readonly message: string;
}

export type ToolResult =
  | { readonly ok: true; readonly data: Record<string, unknown> }
  | { readonly ok: false; readonly error: ToolError };

export const toolSuccess = (data: Record<string, unknown>): ToolResult => ({ ok: true, data });

export const toolFailure = (error: ToolError): ToolResult => ({ ok: false, error });

export const cancelledResult = (): ToolResult =>
  toolFailure({ code: "CANCELLED", message: "Tool execution was cancelled" });

export const invalidInputResult = (): ToolResult =>
  toolFailure({ code: "INVALID_INPUT", message: "input is invalid" });

export const toToolFailure = (error: unknown): ToolResult => {
  if (error instanceof TypeError || error instanceof RangeError) return invalidInputResult();
  return toolFailure({ code: "INTERNAL_ERROR", message: "Tool request could not be completed" });
};
