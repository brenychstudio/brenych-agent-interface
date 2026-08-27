import type { AgentInterface } from "../application/AgentInterface";
import { registerAgentTools } from "./registerAgentTools";
import type { WebMcpPort, WebMcpToolDefinition } from "./webMcpPort";

export class ToolLifecycle {
  private controller: AbortController | undefined;
  private activePromise: Promise<void> | undefined;
  private stopPromise: Promise<void> | undefined;
  private restartPromise: Promise<void> | undefined;
  private restartEpoch: number | undefined;
  private generation = 0;
  private stopEpoch = 0;

  constructor(
    private readonly port: WebMcpPort,
    private readonly agent: AgentInterface,
    private readonly definitions: () => readonly WebMcpToolDefinition[],
  ) {}

  start(): Promise<void> {
    if (this.restartPromise && this.restartEpoch === this.stopEpoch) return this.restartPromise;
    if (this.stopPromise) {
      const restartEpoch = this.stopEpoch;
      const restart = this.stopPromise.then(() => {
        if (this.stopEpoch !== restartEpoch) return;
        if (this.restartPromise === restart) {
          this.restartPromise = undefined;
          this.restartEpoch = undefined;
        }
        return this.start();
      });
      this.restartPromise = restart;
      this.restartEpoch = restartEpoch;
      return restart;
    }
    if (this.activePromise) return this.activePromise;
    if (!this.port.isAvailable()) {
      this.agent.setRegistrationState({ webMcpAvailable: false, registrationState: "unavailable" }, "webmcp");
      return Promise.resolve();
    }

    const controller = new AbortController();
    const generation = ++this.generation;
    this.controller = controller;
    this.agent.setRegistrationState({ webMcpAvailable: true, registrationState: "registering" }, "webmcp");
    const registration = this.register(controller, generation);
    this.activePromise = registration;
    return registration;
  }

  stop(): Promise<void> {
    this.stopEpoch += 1;
    if (this.stopPromise) return this.stopPromise;
    const controller = this.controller;
    const generation = this.generation;
    const registration = this.activePromise;
    if (!controller || !registration) return Promise.resolve();

    controller.abort();
    const stopping = registration.finally(() => {
      if (this.controller === controller && this.generation === generation) {
        this.controller = undefined;
        this.activePromise = undefined;
      }
    });
    const stopPromise = stopping.then(() => {
      if (this.stopPromise === stopPromise) this.stopPromise = undefined;
    });
    this.stopPromise = stopPromise;
    return stopPromise;
  }

  private async register(controller: AbortController, generation: number): Promise<void> {
    try {
      await registerAgentTools(this.port, this.definitions(), controller.signal);
      if (!controller.signal.aborted && this.isCurrent(controller, generation)) {
        this.agent.setRegistrationState({ webMcpAvailable: true, registrationState: "ready" }, "webmcp");
      }
    } catch {
      const wasAborted = controller.signal.aborted;
      controller.abort();
      if (!wasAborted && this.isCurrent(controller, generation)) {
        this.agent.setRegistrationState({ webMcpAvailable: true, registrationState: "error" }, "webmcp");
        this.controller = undefined;
        this.activePromise = undefined;
      }
    }
  }

  private isCurrent(controller: AbortController, generation: number): boolean {
    return this.controller === controller && this.generation === generation;
  }
}
