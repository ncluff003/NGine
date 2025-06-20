export const mockSSRStatus = false;

export const mockRecalibration = {
  previous: {
    alpha: 0,
    beta: 0,
    gamma: 0,
  },
  current: {
    alpha: 0,
    beta: 0,
    gamma: 0,
  },
};

export const mockShapedData = {
  position: {
    changed: false,
    top: 0,
    right: 1920,
    bottom: 1080,
    left: 0,
  },
  velocity: {
    changed: false,
    x: 0,
    y: 0,
  },
  devicePixelRatio: {
    changed: false,
    value: 1.0,
  },
  dimensions: {
    changed: false,
    height: 1080,
    width: 1920,
  },
  document: {
    changed: false,
    height: 1080,
    width: 1920,
  },
  status: {
    zoomLevel: 1,
    orientation: {
      changed: false,
      alpha: 0,
      beta: 0,
      gamma: 0,
    },
    scroll: {
      changed: false,
      left: 0,
      right: 1920,
      top: 0,
      bottom: 1080,
      velocity: {
        horizontalScrollVelocity: 0,
        verticalScrollVelocity: 0,
      },
    },
  },
  input: {
    keyboard: {
      changed: false,
      previousKey: {
        code: 0,
        name: '',
        characterCode: 0,
        info: '',
        duration: {
          value: 0,
          units: 'seconds',
        },
      },
      currentKey: {
        code: 0,
        name: '',
        characterCode: 0,
        info: '',
        duration: {
          value: 0,
          units: 'seconds',
        },
      },
      releasedKey: {
        code: 0,
        name: '',
        characterCode: 0,
        info: '',
        duration: {
          value: 0,
          units: 'seconds',
        },
      },
      pressedKeys: [],
    },
    mouse: {
      changed: false,
      direction: '',
      x: 0,
      y: 0,
      duration: {
        value: 0,
        units: 'seconds',
      },
      velocity: {
        x: 0,
        y: 0,
      },
      previousLine: [],
      line: [],
      start: {
        x: 0,
        y: 0,
        withinViewport: false,
      },
      end: {
        x: 0,
        y: 0,
        withinViewport: false,
      },
    },
    touch: {
      changed: false,
      direction: '',
      duration: {
        value: 0,
        units: 'seconds',
      },
      previousLine: [],
      line: [],
      start: {
        x: 0,
        y: 0,
        withinViewport: false,
      },
      end: {
        x: 0,
        y: 0,
        withinViewport: false,
      },
    },
  },
};

export const mockMousePosition = {
  x: 0,
  y: 0,
  withinViewport: true,
};
