// Declare global window interface for the ability to expose a limited set of methods globally.
declare global {
  interface Window {
    __VIEWPORT: {
      watch: typeof viewport.watch;
      unwatch: typeof viewport.unwatch;
      getState: typeof viewport.getState;
      recalibrateOrientations: typeof viewport.recalibrateOrientation;
    };
  }
}

export {};
