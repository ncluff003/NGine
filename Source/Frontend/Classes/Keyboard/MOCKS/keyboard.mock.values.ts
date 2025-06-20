export const mockPreviousKey = {
  code: undefined,
  name: '',
  characterCode: undefined,
  info: '',
  duration: {
    pressStart: undefined,
    pressEnd: undefined,
    pressed: 0,
    units: 'seconds',
  },
};

export const mockCurrentKey = {
  code: undefined,
  name: '',
  characterCode: undefined,
  info: '',
  duration: {
    pressStart: undefined,
    pressEnd: undefined,
    pressed: 0,
    units: 'seconds',
  },
};

export const mockReleasedKey = {
  code: undefined,
  name: '',
  characterCode: undefined,
  info: '',
  duration: {
    pressStart: undefined,
    pressEnd: undefined,
    pressed: 0,
    units: 'seconds',
  },
};

export const mockPressedKeys = [];

export const mockCurrentState = {
  changed: false,
  previousKey: mockPreviousKey,
  currentKey: mockCurrentKey,
  releasedKey: mockReleasedKey,
  pressedKeys: mockPressedKeys,
};
