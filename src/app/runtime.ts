import { createAgentInterface } from "../application/AgentInterface";
import { createStoreStatePort } from "../state/storeStatePort";
import { useAppStore } from "../state/appStore";
import { BrowserWebMcpPort } from "../webmcp/browserWebMcpPort";
import { ToolLifecycle } from "../webmcp/toolLifecycle";
import { createToolDefinitions } from "../webmcp/toolDefinitions";

const statePort = createStoreStatePort(useAppStore);

export const agentInterface = createAgentInterface(statePort);
export const toolLifecycle = new ToolLifecycle(
  new BrowserWebMcpPort(),
  agentInterface,
  () => createToolDefinitions(agentInterface),
);

export const resetRuntimeForTesting = (): void => {
  agentInterface.reset("manual");
};
