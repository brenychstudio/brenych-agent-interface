import type { WebMcpPort, WebMcpToolDefinition } from "../../src/webmcp/webMcpPort";

export class FakeWebMcpPort implements WebMcpPort {
  readonly registrations: Array<{ definition: WebMcpToolDefinition; signal: AbortSignal }> = [];
  available = true;
  failAt: number | undefined;
  deferNextRegistration = false;
  private readonly deferred: Array<() => void> = [];

  isAvailable(): boolean {
    return this.available;
  }

  async registerTool(definition: WebMcpToolDefinition, options: { signal: AbortSignal }): Promise<void> {
    this.registrations.push({ definition, signal: options.signal });
    if (this.failAt === this.registrations.length) throw new Error("registration failed");
    if (this.deferNextRegistration) {
      this.deferNextRegistration = false;
      await new Promise<void>((resolve) => this.deferred.push(resolve));
    }
  }

  releaseNextRegistration(): void {
    this.deferred.shift()?.();
  }
}
