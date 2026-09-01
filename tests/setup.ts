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

// jsdom has no layout and no IntersectionObserver, so viewport-entry animations would never
// resolve. Reporting every observed element as fully in view settles them on their final state,
// which is what the browser shows once the reveal has played.
if (typeof globalThis.IntersectionObserver === "undefined") {
  class TestIntersectionObserver {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: readonly number[] = [0];
    private readonly callback: IntersectionObserverCallback;

    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
    }

    observe(target: Element): void {
      this.callback(
        [{ target, isIntersecting: true, intersectionRatio: 1 } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
    }

    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] { return []; }
  }

  Object.defineProperty(globalThis, "IntersectionObserver", {
    configurable: true,
    value: TestIntersectionObserver,
  });
}
