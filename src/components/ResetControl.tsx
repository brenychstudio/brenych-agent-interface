import type { AgentInterface } from "../application/AgentInterface";

export const ResetControl = ({ agent }: { readonly agent: AgentInterface }) => (
  <button type="button" className="reset-control" onClick={() => agent.reset("manual")}>Reset workspace</button>
);
