import { jest } from '@jest/globals';
import Keyboard from '..';
import { mockPreviousKey, mockCurrentKey, mockCurrentState, mockPressedKeys, mockReleasedKey } from '../MOCKS/keyboard.mock.values';
import '../../../../Utils/arrayMethods';

let keyboard: Keyboard;

beforeEach(() => {
  keyboard = new Keyboard();
});

///////////////////////////////////
// - KEYBOARD API UNIT TESTS //
//////////////////////////////////

// TESTING KEYBOARD CLASS INSTANTIATION
describe('Keyboard Class Instantiation', () => {
  test('The keyboard should exist and be an instance of the Keyboard Class.', () => {
    expect(keyboard).toBeDefined();
    expect(keyboard instanceof Keyboard).toBe(true);
  });
});

describe('Keyboard Public API Is Defined', () => {
  // GET PREVIOUS KEY
  test('getPreviousKey is both defined, and a method.', () => {
    // ARRANGE - Setup essential preconditions for the test
    // ACT - Call the method or behavior to be tested.
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(keyboard.getPreviousKey.bind(this)).toBeDefined();
    expect(typeof keyboard.getPreviousKey).toBe('function');
  });

  test('Keyboard.getPreviousKey returns the correct object', () => {
    // ARRANGE - Setup essential preconditions for the test
    const getPreviousKeySpy = jest.spyOn(keyboard, 'getPreviousKey');
    // ACT - Call the method or behavior to be tested.
    const previousKey = keyboard.getPreviousKey();
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(getPreviousKeySpy).toHaveBeenCalledTimes(1);
    expect(previousKey).toEqual(mockPreviousKey);
  });

  // GET CURRENT KEY
  test('getCurrentKey is both defined, and a method.', () => {
    // ARRANGE - Setup essential preconditions for the test
    // ACT - Call the method or behavior to be tested.
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(keyboard.getCurrentKey.bind(this)).toBeDefined();
    expect(typeof keyboard.getCurrentKey).toBe('function');
  });

  test('Keyboard.getCurrentKey returns the correct object', () => {
    // ARRANGE - Setup essential preconditions for the test
    const getCurrentKeySpy = jest.spyOn(keyboard, 'getCurrentKey');
    // ACT - Call the method or behavior to be tested.
    const currentKey = keyboard.getCurrentKey();
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(getCurrentKeySpy).toHaveBeenCalledTimes(1);
    expect(currentKey).toEqual(mockCurrentKey);
  });

  // GET RELEASED KEY
  test('getReleasedKey is both defined, and a method.', () => {
    // ARRANGE - Setup essential preconditions for the test
    // ACT - Call the method or behavior to be tested.
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(keyboard.getReleasedKey.bind(this)).toBeDefined();
    expect(typeof keyboard.getReleasedKey).toBe('function');
  });

  test('Keyboard.getReleasedKey returns the correct object', () => {
    // ARRANGE - Setup essential preconditions for the test
    const getReleasedKeySpy = jest.spyOn(keyboard, 'getReleasedKey');
    // ACT - Call the method or behavior to be tested.
    const releasedKey = keyboard.getReleasedKey();
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(getReleasedKeySpy).toHaveBeenCalledTimes(1);
    expect(releasedKey).toEqual(mockReleasedKey);
  });

  // GET PRESSED KEYS
  test('getPressedKeys is both defined, and a method.', () => {
    // ARRANGE - Setup essential preconditions for the test
    // ACT - Call the method or behavior to be tested.
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(keyboard.getPressedKeys.bind(this)).toBeDefined();
    expect(typeof keyboard.getPressedKeys).toBe('function');
  });

  test('Keyboard.getPressedKeys returns the correct array of objects', () => {
    // ARRANGE - Setup essential preconditions for the test
    const getPressedKeysSpy = jest.spyOn(keyboard, 'getPressedKeys');
    // ACT - Call the method or behavior to be tested.
    const pressedKeys = keyboard.getPressedKeys();
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(getPressedKeysSpy).toHaveBeenCalledTimes(1);
    expect(pressedKeys).toEqual(mockPressedKeys);
  });

  // GET CURRENT STATE
  test('getCurrentState is both defined, and a method.', () => {
    // ARRANGE - Setup essential preconditions for the test
    // ACT - Call the method or behavior to be tested.
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(keyboard.getCurrentState.bind(this)).toBeDefined();
    expect(typeof keyboard.getCurrentState).toBe('function');
  });

  test('Keyboard.getCurrentState returns the correct objects', () => {
    // ARRANGE - Setup essential preconditions for the test
    const getCurrentStateSpy = jest.spyOn(keyboard, 'getCurrentState');
    // ACT - Call the method or behavior to be tested.
    const currentState = keyboard.getCurrentState();
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(getCurrentStateSpy).toHaveBeenCalledTimes(1);
    expect(currentState).toEqual(mockCurrentState);
  });
});

////////////////////////////////////////////
// - KEYBOARD API INTEGRATION TESTS //
///////////////////////////////////////////
describe('Integration: Custom Array Methods', () => {
  test('The clear method should clear the array using Array.prototype.clear.', () => {
    // ARRANGE - Setup essential preconditions for the test
    const pressedKeys = [mockPreviousKey, mockPreviousKey, mockCurrentKey];
    // ACT - Call the method or behavior to be tested.
    pressedKeys.clear();
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(pressedKeys).toHaveLength(0);
  });

  test('The average method should average out a number array using Array.prototype.average.', () => {
    // ARRANGE - Setup essential preconditions for the test
    const numbers = [10, 20, 30];
    // ACT - Call the method or behavior to be tested.
    const average = numbers.average();
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(average).toBe(20);
  });
});

describe('Integration: Keyboard Event Handling', () => {
  test('It should update the viewport position when keyboard arrow keys are pressed.', () => {
    // ARRANGE - Setup essential preconditions for the test
    const event = new KeyboardEvent('keydown', { key: 'ControlLeft', keyCode: 17, code: 'ControlLeft', repeat: false });
    // ACT - Call the method or behavior to be tested.
    window.dispatchEvent(event); // This is successful.
    const pressedKeys = keyboard.getPressedKeys();
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(pressedKeys).toHaveLength(1);
    expect(pressedKeys[0].name).toBe('ControlLeft');

    // KEYUP EVENT TO CLEAR PRESSED KEYS
    const keyUpEvent = new KeyboardEvent('keyup', { key: 'ControlLeft', keyCode: 39, code: 'ControlLeft', repeat: false });
    window.dispatchEvent(keyUpEvent);
  });

  test('It should update the viewport position when keyboard arrow keys are pressed and released.', () => {
    // ARRANGE - Setup essential preconditions for the test
    const eventOne = new KeyboardEvent('keydown', { key: 'ArrowRight', keyCode: 39, code: 'ArrowRight', repeat: false });
    // ACT - Call the method or behavior to be tested.
    window.dispatchEvent(eventOne); // This is successful.
    const pressedKeys = keyboard.getPressedKeys();
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(pressedKeys).toHaveLength(1);
    expect(keyboard.getPressedKeys()[0].name).toBe('ArrowRight');

    // ARRANGE - Setup essential preconditions for the test
    const eventTwo = new KeyboardEvent('keyup', { key: 'ArrowRight', keyCode: 39, code: 'ArrowRight', repeat: true });

    // ACT - Call the method or behavior to be tested.
    window.dispatchEvent(eventTwo); // This is successful.
    const releasedKey = keyboard.getReleasedKey();
    const unPressedKeys = keyboard.getPressedKeys();

    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(releasedKey.name).toBe('ArrowRight');
    expect(unPressedKeys).toHaveLength(0);
  });

  test('It should correctly return before duplicating keys.', () => {
    // ARRANGE - Setup essential preconditions for the test
    const event = new KeyboardEvent('keydown', { key: 'ControlLeft', keyCode: 17, code: 'ControlLeft', repeat: false });
    const event2 = new KeyboardEvent('keydown', { key: 'ControlLeft', keyCode: 17, code: 'ControlLeft', repeat: false });
    // ACT - Call the method or behavior to be tested.
    window.dispatchEvent(event);
    window.dispatchEvent(event2);
    const pressedKeys = keyboard.getPressedKeys();
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(pressedKeys).toHaveLength(1);
    expect(pressedKeys[0].name).toEqual('ControlLeft');
  });

  test('It should correctly return the pressed key array with multiple unique keys.', () => {
    // ARRANGE - Setup essential preconditions for the test
    const event = new KeyboardEvent('keydown', { key: 'ControlLeft', keyCode: 17, code: 'ControlLeft', repeat: false });
    const event2 = new KeyboardEvent('keydown', { key: 'AltLeft', keyCode: 18, code: 'AltLeft', repeat: false });
    const event3 = new KeyboardEvent('keydown', { key: 'Delete', keyCode: 46, code: 'Delete', repeat: false });
    // ACT - Call the method or behavior to be tested.
    window.dispatchEvent(event);
    window.dispatchEvent(event2);
    window.dispatchEvent(event3);
    const pressedKeys = keyboard.getPressedKeys();
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(pressedKeys).toHaveLength(3);
    expect(pressedKeys[0].name).toEqual('ControlLeft');
    expect(pressedKeys[1].name).toEqual('AltLeft');
    expect(pressedKeys[2].name).toEqual('Delete');
  });
});
