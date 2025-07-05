import { Viewport } from '..';
import Keyboard from '../../../Classes/Keyboard';
import { mockMousePosition, mockRecalibration, mockShapedData, mockSSRStatus } from '../MOCKS/viewport.mock.values';
import '../../../../Utils/arrayMethods';

// - Integration tests MUST be realistic in how the actions would affect another aspect of the library. The same thing applies to End-To-End tests.

let keyboard: Keyboard;
let viewport: Viewport;

beforeEach(() => {
  viewport = new Viewport();
  keyboard = new Keyboard();
});

///////////////////////////////////
// - VIEWPORT API UNIT TESTS //
//////////////////////////////////
describe('Checking the test environment', () => {
  test('Does the window exist?', () => {
    expect(typeof window).toBe('object'); // This will fail if the environment is not jsdom.
  });
});

describe('Viewport API instantiation', () => {
  test('The viewport should exist and be an instance of the Viewport API.', () => {
    expect(viewport).toBeDefined();
    expect(viewport instanceof Viewport).toBe(true);
  });
});

describe("The Viewport's public API are defined and return the correct values.", () => {
  // GET SSR Status
  test('getSSRStatus is both defined, and a method.', () => {
    // ARRANGE - Setup essential preconditions for the test
    // ACT - Call the method or behavior to be tested.
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(viewport.getSSRStatus.bind(this)).toBeDefined();
    expect(typeof viewport.getSSRStatus).toBe('function');
  });

  test('getSSRStatus returns the correct value.', () => {
    // ARRANGE - Setup essential preconditions for the test
    const mockedSSRStatus = jest.spyOn(viewport, 'getSSRStatus').mockReturnValue(mockSSRStatus);
    // ACT - Call the method or behavior to be tested.
    const ssrStatus = viewport.getSSRStatus();
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(mockedSSRStatus).toHaveBeenCalledTimes(1);
    expect(ssrStatus).toEqual(mockSSRStatus);
  });

  // Watch
  test('Watch is both defined, and a method.', () => {
    // ARRANGE - Setup essential preconditions for the test
    // ACT - Call the method or behavior to be tested.
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(viewport.watch.bind(this)).toBeDefined();
    expect(typeof viewport.watch).toBe('function');
  });

  // Watch
  test('Watch runs as expected with each callback function.', () => {
    // ARRANGE - Setup essential preconditions for the test
    const mockedWatch = jest.spyOn(viewport, 'watch');
    // ACT - Call the method or behavior to be tested.
    const watch = viewport.watch((mockShapedData) => {
      console.log(mockShapedData.devicePixelRatio.value);
    });
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(mockedWatch).toHaveBeenCalledTimes(1);
    expect(watch).toBeUndefined();
  });

  // Unwatch
  test('Unwatch is both defined, and a method.', () => {
    // ARRANGE - Setup essential preconditions for the test
    // ACT - Call the method or behavior to be tested.
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(viewport.unwatch.bind(this)).toBeDefined();
    expect(typeof viewport.unwatch).toBe('function');
  });

  // Unwatch
  test('Unwatch runs as expected with each callback function.', () => {
    // ARRANGE - Setup essential preconditions for the test
    const mockedUnwatch = jest.spyOn(viewport, 'unwatch');
    // ACT - Call the method or behavior to be tested.
    const unwatch = viewport.unwatch((mockShapedData) => {
      console.log(mockShapedData);
    });
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(mockedUnwatch).toHaveBeenCalledTimes(1);
    expect(unwatch).toBeUndefined();
  });

  // Get State
  test('getState is both defined, and a method.', () => {
    // ARRANGE - Setup essential preconditions for the test
    // ACT - Call the method or behavior to be tested.
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(viewport.getState.bind(this)).toBeDefined();
    expect(typeof viewport.getState).toBe('function');
  });

  test('getState returns the correct value.', () => {
    // ARRANGE - Setup essential preconditions for the test
    const mockedShapedData = jest.spyOn(viewport, 'getState').mockReturnValue(mockShapedData);
    // ACT - Call the method or behavior to be tested.
    const recalibration = viewport.getState();
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(mockedShapedData).toHaveBeenCalledTimes(1);
    expect(recalibration).toEqual(mockShapedData);
  });

  // Recalibrate Orientations
  test('recalibrateOrientations is both defined, and a method.', () => {
    // ARRANGE - Setup essential preconditions for the test
    // ACT - Call the method or behavior to be tested.
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(viewport.recalibrateOrientation.bind(this)).toBeDefined();
    expect(typeof viewport.recalibrateOrientation).toBe('function');
  });

  test('recalibrateOrientation returns the correct value.', () => {
    // ARRANGE - Setup essential preconditions for the test
    const mockedRecalibration = jest.spyOn(viewport, 'recalibrateOrientation').mockReturnValue(mockRecalibration);
    // ACT - Call the method or behavior to be tested.
    const recalibration = viewport.recalibrateOrientation();
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(mockedRecalibration).toHaveBeenCalledTimes(1);
    expect(recalibration).toEqual(mockRecalibration);
  });
});

////////////////////////////////////////////
// - VIEWPORT API INTEGRATION TESTS //
///////////////////////////////////////////
describe('Integration: Custom Array Methods', () => {
  test('The clear method should clear the array using Array.prototype.clear.', () => {
    // ARRANGE - Setup essential preconditions for the test
    const mouseLine = [mockMousePosition, mockMousePosition, mockMousePosition];
    // ACT - Call the method or behavior to be tested.
    mouseLine.clear();
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(mouseLine).toHaveLength(0);
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

describe('Integration: Keyboard and Viewport', () => {
  test('It should detect changes in the browser position (screenLeft and screenTop).', () => {
    // ARRANGE - Setup essential preconditions for the test
    Object.defineProperty(window, 'screenLeft', { value: 50 });
    Object.defineProperty(window, 'screenTop', { value: 100 });
    const resize = new Event('resize');
    // ACT - Call the method or behavior to be tested.
    window.dispatchEvent(resize);
    const state = viewport.getState();
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(state.position.left).toEqual(50);
    expect(state.position.top).toEqual(100);
  });

  test('It should detect and return the correct viewport dimensions.', () => {
    // Simulate viewport dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1024 });
    Object.defineProperty(window, 'innerHeight', { value: 768 });

    // Trigger the update
    const state = viewport.getState();
    expect(state.dimensions.width).toEqual(1024);
    expect(state.dimensions.height).toEqual(768);
  });
  test('It should detect and return the correct document dimensions.', () => {
    Object.defineProperty(document.body, 'scrollWidth', { value: 1200 });
    Object.defineProperty(document.body, 'scrollHeight', { value: 1500 });

    // Trigger the update
    const state = viewport.getState();
    expect(state.document.width).toEqual(1200);
    expect(state.document.height).toEqual(1500);
  });

  test('The Keyboard API should return the right state values when a key is pressed.', () => {
    // ARRANGE - Setup essential preconditions for the test
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', keyCode: 39, code: 'ArrowRight', repeat: false });
    // ACT - Call the method or behavior to be tested.
    window.dispatchEvent(event); // This is successful.
    const viewportState = viewport.getState();
    const pressedKeys = viewportState.input.keyboard.pressedKeys;
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(pressedKeys).toHaveLength(1);
    expect(keyboard.getPressedKeys()[0].name).toBe('ArrowRight');

    // KEYUP EVENT TO CLEAR PRESSED KEYS
    const keyUpEvent = new KeyboardEvent('keyup', { key: 'ArrowRight', keyCode: 39, code: 'ArrowRight', repeat: false });
    window.dispatchEvent(keyUpEvent);
  });

  test('It should update the viewport scroll position and velocity when keyboard arrow keys are pressed.', () => {
    // ARRANGE - Setup essential preconditions for the test
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', keyCode: 40, code: 'ArrowDown', repeat: false });
    // ACT - Call the method or behavior to be tested.
    window.dispatchEvent(event); // This is successful.
    let viewportState = viewport.getState();
    const pressedKeys = viewportState.input.keyboard.pressedKeys;
    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(pressedKeys).toHaveLength(1);
    expect(keyboard.getPressedKeys()[0].name).toBe('ArrowDown');

    // The viewport should have scrolled down.
    Object.defineProperty(window, 'scrollY', { value: 20 });
    // The scroll event will also be emitted.
    const scrollEvent = new Event('scroll');
    window.dispatchEvent(scrollEvent);
    viewportState = viewport.getState();

    // Assertions of how the scroll event should have been handled.
    expect(viewportState.status.scroll.top).toEqual(20);
    expect(viewportState.status.scroll.velocity.horizontalScrollVelocity).toEqual(0);
    expect(viewportState.status.scroll.velocity.verticalScrollVelocity).toEqual(20);
  });

  test('It should detect the current state of the mouse when it is moved.', () => {
    // ARRANGE - Setup essential preconditions for the test
    const mouseDown = new MouseEvent('mousedown', {
      clientX: 50,
      clientY: 175,
      buttons: 1,
    });
    const mouseMovement = new MouseEvent('mousemove', {
      clientX: 150,
      clientY: 300,
      buttons: 1,
    });
    const mouseUp = new MouseEvent('mouseup', {
      clientX: 25,
      clientY: 225,
    });

    // ACT - Call the method or behavior to be tested.
    window.dispatchEvent(mouseDown);
    window.dispatchEvent(mouseMovement);
    window.dispatchEvent(mouseUp);
    const state = viewport.getState();

    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(state.input.mouse.x).toEqual(150);
    expect(state.input.mouse.x).not.toEqual(300);
    expect(state.input.mouse.y).toEqual(300);
    expect(state.input.mouse.y).not.toEqual(150);
    expect(state.input.mouse.previousLine).toHaveLength(3);
    expect(state.input.mouse.line).toHaveLength(0);
    expect(state.input.mouse.direction).toEqual('Northwest');
  });

  test('It should detect the current state of the touch when it is moved.', () => {
    // ARRANGE - Setup essential preconditions for the test
    const touchStart = new TouchEvent('touchstart', {
      changedTouches: [{ clientX: 50, clientY: 175 }] as any,
    });
    const touchMove = new TouchEvent('touchmove', {
      changedTouches: [{ clientX: 150, clientY: 300 }] as any,
    });
    const touchEnd = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 25, clientY: 225 }] as any,
    });

    // ACT - Call the method or behavior to be tested.
    window.dispatchEvent(touchStart);
    window.dispatchEvent(touchMove);
    window.dispatchEvent(touchEnd);
    const state = viewport.getState();

    // ASSERT - Verify the expected outcome using Jest's matchers.
    expect(state.input.touch.start.x).toEqual(50);
    expect(state.input.touch.start.x).not.toEqual(300);
    expect(state.input.touch.start.y).toEqual(175);
    expect(state.input.touch.start.y).not.toEqual(150);
    expect(state.input.touch.previousLine).toHaveLength(3);
    expect(state.input.touch.line).toHaveLength(0);
    expect(state.input.touch.direction).toEqual('Northwest');
  });
});
