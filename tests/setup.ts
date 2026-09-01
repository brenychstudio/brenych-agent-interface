import "@testing-library/jest-dom/vitest";

Object.defineProperty(window, "scrollTo", {
  configurable: true,
  writable: true,
  value: () => undefined,
});

if (typeof globalThis.PointerEvent === "undefined") {
  class TestPointerEvent extends MouseEvent {
    readonly pointerId: number;
    readonly pointerType: string;

    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 0;
      this.pointerType = init.pointerType ?? "";
    }
  }

  Object.defineProperty(globalThis, "PointerEvent", { configurable: true, value: TestPointerEvent });
}
