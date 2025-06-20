// KEYBOARD INTERFACES
export interface duration {
  [key: string]: Date | number | undefined | string;
  pressStart: Date | undefined;
  pressEnd: Date | undefined;
  pressed: number;
  units: string;
}

export interface shapedDuration {
  [key: string]: number | undefined | string;
  value: number | undefined;
  units: string | undefined;
}

export interface keyboardKey {
  [key: string]: number | string | Date | duration | undefined;
  code: number | undefined;
  name: string;
  characterCode: number | undefined;
  info: string;
  duration: duration;
}

export interface shapedKeyboardKey {
  code: number | undefined;
  name: string | undefined;
  characterCode: number | undefined;
  info: string | undefined;
  duration: shapedDuration;
}

export interface keyboardState {
  changed: boolean;
  previousKey: keyboardKey;
  currentKey: keyboardKey;
  releasedKey: keyboardKey;
  pressedKeys: keyboardKey[];
}

export interface shapedKeyboardState {
  changed: boolean;
  previousKey: shapedKeyboardKey;
  currentKey: shapedKeyboardKey;
  releasedKey: shapedKeyboardKey;
  pressedKeys: shapedKeyboardKey[];
}

export interface touchState {
  cancelled: boolean;
  changed: boolean;
  direction: string | undefined;
  duration: {
    pressStart: number | undefined;
    pressEnd: number | undefined;
    pressed: number;
    units: string;
  };
  start: {
    x: number;
    y: number;
    withinViewport: boolean;
  };
  current: {
    x: number;
    y: number;
    withinViewport: boolean;
  };
  end: {
    x: number;
    y: number;
    withinViewport: boolean;
  };
  previousLine: { x: number; y: number; withinViewport: boolean }[];
  line: { x: number; y: number; withinViewport: boolean }[];
}
