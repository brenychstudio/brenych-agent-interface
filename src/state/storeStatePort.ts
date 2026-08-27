import type { AppEvent, AppSemanticState, StatePort } from "../application/StatePort";
import type { StoreApi } from "zustand/vanilla";

import { type AppStore, useAppStore } from "./appStore";

export interface StoreStatePort extends StatePort {
  getEvents(): readonly AppEvent[];
}

const cloneImmutable = <Value>(value: Value): Value => {
  if (Array.isArray(value)) return Object.freeze(value.map((item) => cloneImmutable(item))) as Value;
  if (value !== null && typeof value === "object") {
    const clone = Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [key, cloneImmutable(nested)]),
    );
    return Object.freeze(clone) as Value;
  }
  return value;
};

export const createStoreStatePort = (store: StoreApi<AppStore> = useAppStore): StoreStatePort => {
  const events: AppEvent[] = [];
  return {
    snapshot: (): AppSemanticState => {
      const { apply: _apply, ...snapshot } = store.getState();
      void _apply;
      return cloneImmutable(snapshot);
    },
    apply: (event) => {
      const immutableEvent = cloneImmutable(event);
      store.getState().apply(immutableEvent);
      events.push(immutableEvent);
    },
    getEvents: () => Object.freeze([...events]),
  };
};
