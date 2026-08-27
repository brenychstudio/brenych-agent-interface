import { describe, expect, it } from "vitest";

import { createAgentInterface } from "../../src/application/AgentInterface";
import { createAppStore } from "../../src/state/appStore";
import { createStoreStatePort } from "../../src/state/storeStatePort";
import { ToolLifecycle } from "../../src/webmcp/toolLifecycle";
import { createToolDefinitions } from "../../src/webmcp/toolDefinitions";
import { FakeWebMcpPort } from "./fakeWebMcpPort";

const createLifecycle = (port: FakeWebMcpPort) => {
  const state = createStoreStatePort(createAppStore());
  const app = createAgentInterface(state);
  return { state, lifecycle: new ToolLifecycle(port, app, () => createToolDefinitions(app)) };
};

describe("WebMCP registration lifecycle", () => {
  it("reports an unavailable browser without attempting a registration", async () => {
    // This catches an unsupported browser surfacing an unhandled registration error.
    const port = new FakeWebMcpPort();
    port.available = false;
    const { lifecycle, state } = createLifecycle(port);

    await lifecycle.start();

    expect(port.registrations).toEqual([]);
    expect(state.snapshot()).toMatchObject({ webMcpAvailable: false, registrationState: "unavailable" });
  });

  it("registers exactly seven definitions and reports ready", async () => {
    // This catches a lifecycle that omits or duplicates a public tool during startup.
    const port = new FakeWebMcpPort();
    const { lifecycle, state } = createLifecycle(port);

    await lifecycle.start();

    expect(port.registrations).toHaveLength(7);
    expect(state.snapshot()).toMatchObject({ webMcpAvailable: true, registrationState: "ready" });
  });

  it("shares the in-flight start attempt with concurrent callers", async () => {
    // This catches duplicate registrations caused by two lifecycle owners starting together.
    const port = new FakeWebMcpPort();
    const { lifecycle } = createLifecycle(port);

    const first = lifecycle.start();
    const second = lifecycle.start();
    expect(second).toBe(first);
    await first;
    expect(port.registrations).toHaveLength(7);
  });

  it("supports StrictMode-style start stop start without overlapping ownership", async () => {
    // This catches a stopped generation preventing the next mounted owner from registering.
    const port = new FakeWebMcpPort();
    const { lifecycle } = createLifecycle(port);

    await lifecycle.start();
    await lifecycle.stop();
    await lifecycle.start();

    expect(port.registrations).toHaveLength(14);
    expect(new Set(port.registrations.slice(0, 7).map((entry) => entry.signal)).size).toBe(1);
    expect(port.registrations[0]?.signal.aborted).toBe(true);
  });

  it("supports a rapid StrictMode start stop start once the stopped registration settles", async () => {
    // This catches a remount starting against a controller that cleanup still owns.
    const port = new FakeWebMcpPort();
    port.deferNextRegistration = true;
    const { lifecycle, state } = createLifecycle(port);

    const firstStart = lifecycle.start();
    const firstStop = lifecycle.stop();
    const secondStart = lifecycle.start();
    port.releaseNextRegistration();
    await Promise.all([firstStart, firstStop, secondStart]);

    expect(port.registrations).toHaveLength(8);
    expect(port.registrations[0]?.signal.aborted).toBe(true);
    expect(port.registrations[1]?.signal.aborted).toBe(false);
    expect(state.snapshot()).toMatchObject({ registrationState: "ready" });
  });

  it("aborts partial registration before reporting an error", async () => {
    // This catches partially registered tools remaining live after a later registration fails.
    const port = new FakeWebMcpPort();
    port.failAt = 3;
    const { lifecycle, state } = createLifecycle(port);

    await lifecycle.start();

    expect(port.registrations).toHaveLength(3);
    expect(port.registrations[0]?.signal.aborted).toBe(true);
    expect(state.snapshot()).toMatchObject({ webMcpAvailable: true, registrationState: "error" });
  });

  it("retries a failed partial registration with a fresh controller", async () => {
    // This catches an error generation retaining ownership and permanently preventing a later registration attempt.
    const port = new FakeWebMcpPort();
    port.failAt = 3;
    const { lifecycle, state } = createLifecycle(port);

    await lifecycle.start();
    const failedSignal = port.registrations[0]?.signal;
    port.failAt = undefined;
    await lifecycle.start();

    expect(port.registrations).toHaveLength(10);
    expect(failedSignal?.aborted).toBe(true);
    expect(port.registrations[3]?.signal).not.toBe(failedSignal);
    expect(port.registrations[3]?.signal.aborted).toBe(false);
    expect(state.snapshot()).toMatchObject({ webMcpAvailable: true, registrationState: "ready" });
  });

  it("suppresses a queued restart when a later stop invalidates it", async () => {
    // This catches a ghost remount registering tools after its later cleanup has already run.
    const port = new FakeWebMcpPort();
    port.deferNextRegistration = true;
    const { lifecycle } = createLifecycle(port);

    const firstStart = lifecycle.start();
    const firstStop = lifecycle.stop();
    const queuedStart = lifecycle.start();
    const finalStop = lifecycle.stop();
    port.releaseNextRegistration();
    await Promise.all([firstStart, firstStop, queuedStart, finalStop]);

    expect(port.registrations).toHaveLength(1);
    expect(port.registrations[0]?.signal.aborted).toBe(true);
  });

  it("makes stop idempotent", async () => {
    // This catches teardown re-aborting or corrupting a completed generation.
    const port = new FakeWebMcpPort();
    const { lifecycle } = createLifecycle(port);
    await lifecycle.start();

    await lifecycle.stop();
    await lifecycle.stop();

    expect(port.registrations[0]?.signal.aborted).toBe(true);
  });
});
