import { shapedKeyboardState } from '../../Classes/Keyboard/interfaces';

export interface shapedViewportState {
  position: {
    changed: boolean;
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  devicePixelRatio: {
    changed: boolean;
    value: number;
  };
  velocity: {
    changed: boolean;
    x: number;
    y: number;
  };
  dimensions: {
    changed: boolean;
    height: number;
    width: number;
  };
  document: {
    changed: boolean;
    height: number;
    width: number;
  };
  status: {
    zoomLevel: number;
    orientation: {
      changed: boolean;
      alpha: number;
      beta: number;
      gamma: number;
    };
    scroll: {
      changed: boolean;
      top: number;
      right: number;
      bottom: number;
      left: number;
      velocity: {
        horizontalScrollVelocity: number;
        verticalScrollVelocity: number;
      };
    };
  };
  input: {
    keyboard: shapedKeyboardState;
    mouse: {
      changed: boolean;
      direction: string | undefined;
      x: number;
      y: number;
      duration: {
        value: number;
        units: string;
      };
      velocity: {
        x: number;
        y: number;
      };
      previousLine: { x: number; y: number; withinViewport: boolean }[];
      line: { x: number; y: number; withinViewport: boolean }[];
      start: { x: number; y: number; withinViewport: boolean };
      end: { x: number; y: number; withinViewport: boolean };
    };
    touch: {
      changed: boolean;
      direction: string | undefined;
      duration: {
        value: number;
        units: string;
      };
      previousLine: { x: number; y: number; withinViewport: boolean }[];
      line: { x: number; y: number; withinViewport: boolean }[];
      start: { x: number; y: number; withinViewport: boolean };
      end: { x: number; y: number; withinViewport: boolean };
    };
  };
}
