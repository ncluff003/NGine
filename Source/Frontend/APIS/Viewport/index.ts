import { browserDetector, throttled } from '../../../Utils';
import Keyboard from '../../Classes/Keyboard';
import { keyboardState, touchState } from '../../Classes/Keyboard/interfaces';
import { shapedData } from './interfaces';
import '../../../Utils/arrayMethods';

export class Viewport {
  // READ ONLY PROPERTIES
  readonly browser: string = browserDetector();
  // PRIVATE PROPERTIES
  private isSSR: boolean = typeof window === 'undefined';
  private html: HTMLElement | undefined = !this.isSSR ? document.querySelector('html')! : undefined;

  private updating: boolean = false;

  private position: {
    changed: boolean;
    x: number;
    y: number;
  } = {
    changed: false,
    x: window.screenX || window.screenLeft || 0,
    y: window.screenY || window.screenTop || 0,
  };

  private velocity: {
    changed: boolean;
    x: number;
    y: number;
    bufferX: number[];
    bufferY: number[];
  } = {
    changed: false,
    x: 0,
    y: 0,
    bufferX: [],
    bufferY: [],
  };

  private devicePixelRatio: {
    changed: boolean;
    value: number;
  } = {
    changed: false,
    value: Math.max(window.devicePixelRatio || 1.0, 1.0),
  };

  private dimensions: {
    changed: boolean;
    height: number;
    width: number;
    previousHeight: number;
    previousWidth: number;
  } = {
    changed: false,
    height: this.browser === 'chrome' && this.html ? this.html?.clientHeight : window.innerHeight,
    width: this.browser === 'chrome' && this.html ? this.html?.clientWidth : window.innerWidth,
    previousHeight: this.browser === 'chrome' && this.html ? this.html?.clientHeight : window.innerHeight,
    previousWidth: this.browser === 'chrome' && this.html ? this.html?.clientWidth : window.innerWidth,
  };

  private document: {
    changed: boolean;
    height: number;
    width: number;
  } = {
    changed: false,
    height: window.document.body.scrollHeight,
    width: window.document.body.scrollWidth,
  };

  private status: {
    zoomLevel: number;

    orientation: {
      [key: string]: boolean | number | null;
      changed: boolean;
      initialAlpha: number | null;
      initialBeta: number | null;
      initialGamma: number | null;
      previousAlpha: number | null;
      previousBeta: number | null;
      previousGamma: number | null;
      alpha: number | null;
      beta: number | null;
      gamma: number | null;
    };

    scroll: {
      changed: boolean;
      previousX: number;
      previousY: number;
      x: number;
      y: number;
      velocity: {
        x: number;
        y: number;
      };
    };
  } = {
    zoomLevel: Math.round((this.devicePixelRatio.value || 1) * 100),

    orientation: {
      changed: false,
      initialAlpha: 0,
      initialBeta: 0,
      initialGamma: 0,
      previousAlpha: 0,
      previousBeta: 0,
      previousGamma: 0,
      alpha: 0,
      beta: 0,
      gamma: 0,
    },

    scroll: {
      changed: false,
      previousX: window.scrollX,
      previousY: window.scrollY,
      x: window.scrollX,
      y: window.scrollY,
      velocity: {
        x: 0,
        y: 0,
      },
    },
  };

  // Instantiate the Keyboard class to manage keyboard input.
  private keyboard: Keyboard = new Keyboard();

  private input: {
    // The Keyboard API should return the current state of the keyboard.
    keyboard: keyboardState;
    mouse: {
      [key: string]: string | number | boolean | undefined | object;
      changed: boolean;
      direction: string | undefined;
      duration: {
        pressStart: number | undefined;
        pressEnd: number | undefined;
        pressed: number;
        units: string;
      };
      lastX: number;
      lastY: number;
      x: number;
      y: number;
      velocity: {
        lastX: number;
        lastY: number;
        x: number;
        y: number;
        bufferX: number[];
        bufferY: number[];
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
        timestamp: Date | undefined;
      };
      end: {
        x: number;
        y: number;
        withinViewport: boolean;
      };
      previousLine: { x: number; y: number; withinViewport: boolean }[];
      line: { x: number; y: number; withinViewport: boolean }[];
    };
    touch: touchState;
  } = {
    keyboard: this.keyboard.getCurrentState(),
    mouse: {
      changed: false,
      direction: undefined,
      duration: {
        pressStart: undefined,
        pressEnd: undefined,
        pressed: 0,
        units: 'seconds',
      },
      lastX: 0,
      lastY: 0,
      x: 0,
      y: 0,
      velocity: {
        lastX: 0,
        lastY: 0,
        x: 0,
        y: 0,
        bufferX: [],
        bufferY: [],
      },
      start: {
        x: 0,
        y: 0,
        withinViewport: false,
      },
      current: {
        x: 0,
        y: 0,
        withinViewport: false,
        timestamp: undefined,
      },
      end: {
        x: 0,
        y: 0,
        withinViewport: false,
      },
      previousLine: [],
      line: [],
    },
    touch: {
      cancelled: false,
      changed: false,
      direction: undefined,
      duration: {
        pressStart: undefined,
        pressEnd: undefined,
        pressed: 0,
        units: 'seconds',
      },
      start: {
        x: 0,
        y: 0,
        withinViewport: false,
      },
      current: {
        x: 0,
        y: 0,
        withinViewport: false,
      },
      end: {
        x: 0,
        y: 0,
        withinViewport: false,
      },
      previousLine: [],
      line: [],
    },
  };

  // CALLBACK QUEUE
  private callbacks: Array<(state: shapedData) => unknown> = [];

  constructor() {
    if (this.isSSR) return;
    // BINDING 'THIS' TO EASE METHODS
    this.setDimensions = this.setDimensions.bind(this);
    this.setDocumentDimensions = this.setDocumentDimensions.bind(this);
    this.setZoomLevel = this.setZoomLevel.bind(this);
    this.setPosition = this.setPosition.bind(this);
    this.manageWindowMove = this.manageWindowMove.bind(this);
    this.manageResize = this.manageResize.bind(this);
    this.manageOrientation = this.manageOrientation.bind(this);
    this.manageScroll = this.manageScroll.bind(this);
    this.manageMouseDown = this.manageMouseDown.bind(this);
    this.manageMouseMove = this.manageMouseMove.bind(this);
    this.manageMouseUp = this.manageMouseUp.bind(this);
    this.manageTouchStart = this.manageTouchStart.bind(this);
    this.manageTouchMove = this.manageTouchMove.bind(this);
    this.manageTouchEnd = this.manageTouchEnd.bind(this);
    this.manageTouchCancel = this.manageTouchCancel.bind(this);

    // BINDING THE PUBLIC API METHODS
    this.watch = this.watch.bind(this);
    this.unwatch = this.unwatch.bind(this);
    this.getState = this.getState.bind(this);
    this.recalibrateOrientation = this.recalibrateOrientation.bind(this);

    // VIEWPORT THROTTLED METHODS
    this.manageResize = throttled(this.manageResize, 110);
    this.manageScroll = throttled(this.manageScroll, 100);
    this.manageMouseDown = throttled(this.manageMouseDown, 75);
    this.manageMouseMove = throttled(this.manageMouseMove, 75);
    this.manageMouseUp = throttled(this.manageMouseUp, 75);
    this.manageTouchStart = throttled(this.manageTouchStart, 100);
    this.manageTouchMove = throttled(this.manageTouchMove, 100);
    this.manageTouchEnd = throttled(this.manageTouchEnd, 100);
    this.manageTouchCancel = throttled(this.manageTouchCancel, 100);

    // VIEWPORT API EVENT LISTENERS
    window.addEventListener('resize', this.manageResize);
    window.addEventListener('deviceorientation', this.manageOrientation);
    window.addEventListener('scroll', this.manageScroll);
    window.addEventListener('mousedown', this.manageMouseDown);
    window.addEventListener('mousemove', this.manageMouseMove);
    window.addEventListener('mouseup', this.manageMouseUp);
    window.addEventListener('touchstart', this.manageTouchStart);
    window.addEventListener('touchmove', this.manageTouchMove);
    window.addEventListener('touchend', this.manageTouchEnd);
    window.addEventListener('touchcancel', this.manageTouchCancel);

    // RESET & LOOP THE UPDATE
    this.updating = false;
    requestAnimationFrame(this.update);
  }

  // PRIVATE METHODS
  /**
   * Updates the viewport data and triggers the watched callbacks.
   *
   * @memberof Viewport
   * @description The `update` method is responsible for checking for changes in viewport data,
   * resetting the changed flags, and triggering the watched callbacks with the updated data.
   * @returns {void}
   */
  private update = (): void => {
    // Destructuring key values from the 'this' keyword to ease the code.
    const { callbacks, devicePixelRatio, dimensions, input, position, status, velocity } = this;

    // Further destructuring the values to ease the code.
    const { value } = devicePixelRatio;
    const { orientation, scroll } = status;
    const { mouse, touch } = input;

    // If the viewport is updating, return.
    if (this.updating) return;

    // RESETTING ESSENTIAL FLAGS TO UPDATE USING DEFERRED METHOD
    // position.changed = devicePixelRatio.changed = false;

    // Creating the viewport velocity buffers.
    if (velocity.bufferX.length > 5) {
      velocity.bufferX.shift();
    }

    velocity.bufferX.push(window.screenLeft - position.x);

    if (velocity.bufferY.length > 5) {
      velocity.bufferY.shift();
    }

    velocity.bufferY.push(window.screenTop - position.y);

    // Validate if average velocities have changed.
    if (velocity.bufferX.average() !== velocity.x) {
      velocity.changed = true;
      velocity.x = velocity.bufferX.average();
    }

    if (velocity.bufferY.average() !== velocity.y) {
      velocity.changed = true;
      velocity.y = velocity.bufferY.average();
    }

    // Verifying viewport position changes.
    if (window.screenLeft !== position.x) {
      position.changed = true;
      position.x = window.screenLeft;
    }

    if (window.screenTop !== position.y) {
      position.changed = true;
      position.y = window.screenTop;
    }

    // Verifying device pixel ratio changes.
    if (Math.max(window.devicePixelRatio || 1.0, 1.0) !== value) {
      devicePixelRatio.changed = true;
      devicePixelRatio.value = Math.max(window.devicePixelRatio || 1.0, 1.0);
    }

    if (!scroll.changed) {
      // If the window scroll does not equal the current scroll value, reset the scroll velocities to 0.
      if ((window.scrollX === scroll.x && scroll.velocity.x !== 0) || (window.pageXOffset === scroll.x && scroll.velocity.x !== 0)) {
        // Reset the scroll velocity.
        scroll.velocity.x = 0;
      }
      if ((window.scrollY === scroll.y && scroll.velocity.y !== 0) || (window.pageYOffset === scroll.y && scroll.velocity.y !== 0)) {
        // Reset the scroll velocity.
        scroll.velocity.y = 0;
      }
    }

    // Run viewport data through each callback if something has changed.
    if (
      position.changed ||
      devicePixelRatio.changed ||
      dimensions.changed ||
      this.document.changed ||
      orientation.changed ||
      scroll.changed ||
      this.keyboard.changed ||
      mouse.changed ||
      touch.changed
    ) {
      callbacks.forEach((callback) => {
        callback(this.getState());
      });
    }

    // RESET ALL FLAGS AFTER UPDATING
    position.changed =
      velocity.changed =
      devicePixelRatio.changed =
      dimensions.changed =
      this.document.changed =
      orientation.changed =
      scroll.changed =
      this.keyboard.changed =
      mouse.changed =
      touch.changed =
        false;

    // RESET and LOOP THE UPDATE
    this.updating = false;
    requestAnimationFrame(this.update);
  };

  /**
   * First, sets that the dimensions have changed. Next, it sets the previous dimensions of the Viewport. Finally, it sets teh current dimensions of the Viewport.
   * @param {Number} height The current height of the Viewport.
   * @param {Number} width The current width of the Viewport.
   * @returns {void}
   */
  private setDimensions(height: number, width: number): void {
    // Change the changed flag to true.
    this.dimensions.changed = true;

    // Set the previous dimensions.
    this.dimensions.previousHeight = this.dimensions.height;
    this.dimensions.previousWidth = this.dimensions.width;

    // Set the new dimensions.
    this.dimensions.height = this.browser === 'chrome' ? this.html!.clientHeight : height;
    this.dimensions.width = this.browser === 'chrome' ? this.html!.clientWidth : width;
  }

  /**
   * Sets that the document's dimensions have changed. Then, it updates the dimensions of the document, including the overflow.
   * @param {Number} height The new height of the document, including the overflow.
   * @param {Number} width The new width of the document, including hte overflow.
   * @returns {void}
   */
  private setDocumentDimensions(height: number, width: number): void {
    // Change the changed flag to true.
    this.document.changed = true;

    // Set the new document dimensions.
    this.document.height = height;
    this.document.width = width;
  }

  /**
   * Calculates and sets the current Viewport's zoom level.
   * @param {Number} zoomLevel The current device pixel ratio used to determine the zoom level.
   * @returns {void}
   */
  private setZoomLevel(zoomLevel: number): void {
    // Set the new zoom level.
    this.status.zoomLevel = Math.round(zoomLevel * 100);
  }

  /**
   * Sets the current position of the window after stating that the window position has changed.
   * @param {Number} x The x coordinate of the window position.
   * @param {Number} y The y coordinate of the window position.
   * @returns {void}
   */
  private setPosition(x: number, y: number): void {
    // Set the new position.
    this.position.x = x;
    this.position.y = y;
  }

  /**
   * Manages the window's position.
   * @param {Number} x The x coordinate of the position of the window.
   * @param {Number} y The y coordinate of the position of the window.
   * @returns {void}
   */
  private manageWindowMove(x: number, y: number): void {
    // Set the new position.
    this.setPosition(x, y);
  }

  /**
   * Updates the size of the viewport, client document, zoom level, and the window's position upon the resize event being fired.
   * @param {Object} event The resize event object.
   * @returns {void}
   */
  private manageResize = (event: Event): void => {
    if (event.type === 'resize') {
      // Managing the viewport's dimensions.
      this.setDimensions(window.innerHeight, window.innerWidth);
      // Managing the document's dimensions.
      this.setDocumentDimensions(window.document.body.scrollHeight, window.document.body.scrollWidth);
      // Managing the viewport's zoom level.
      this.setZoomLevel(this.devicePixelRatio.value);
      // Managing the window's movement.
      this.manageWindowMove(window.screenLeft || window.screenX, window.screenTop || window.screenY);
    }
  };

  /**
   * This is for managing the initial orientation of the device.
   * @param {number} alpha This is the Z-Axis orientation of the device.
   * @param {number} beta This is the X-Axis orientation of the device.
   * @param {number} gamma This is the Y-Axis orientation of the device.
   * @returns {void}
   */
  private manageInitialOrientation(alpha: number, beta: number, gamma: number): void {
    // If the initial orientation values are not present, set them.
    // Initial Alpha
    if (this.status.orientation.initialAlpha === 0) {
      this.status.orientation.initialAlpha = alpha;
    }
    // Initial Beta
    if (this.status.orientation.initialBeta === 0) {
      this.status.orientation.initialBeta = beta;
    }
    // Initial Gamma
    if (this.status.orientation.initialGamma === 0) {
      this.status.orientation.initialGamma = gamma;
    }
  }

  /**
   * This function sets the alpha, beta, and gamma orientation values.
   * @param {number} alpha This is the Z-Axis orientation of the device.
   * @param {number} beta This is the X-Axis orientation of the device.
   * @param {number} gamma This is the Y-Axis orientation of the device.
   * @returns {void}
   */
  private setOrientation = (alpha: number, beta: number, gamma: number): void => {
    // Set the orientation changed flag to true.
    this.status.orientation.changed = true;

    // Set the previous orientation values.
    this.status.orientation.previousAlpha = this.status.orientation.alpha;
    this.status.orientation.previousBeta = this.status.orientation.beta;
    this.status.orientation.previousGamma = this.status.orientation.gamma;

    // Set the new orientation values.
    this.status.orientation.alpha = alpha;
    this.status.orientation.beta = beta;
    this.status.orientation.gamma = gamma;
  };

  /**
   * This function manages the changes in orientation for the device.
   * @param {Object} event The event object, from which the orientation data is extracted.
   * @returns {void}
   * @memberof Viewport
   */
  private manageOrientation = (event: DeviceOrientationEvent): void => {
    // Manage initial orientation values.
    this.manageInitialOrientation(event.alpha ?? 0, event.beta ?? 0, event.gamma ?? 0);

    // Set the orientation values.
    this.setOrientation(event.alpha ?? 0, event.beta ?? 0, event.gamma ?? 0);
  };

  /**
   * Resets the scroll velocity for both the x and y coordinates.
   * @returns {void}
   */
  private resetScrollVelocities = (x: number, y: number): void => {
    // If the window scroll does not equal the current scroll value, reset the scroll velocities to 0.
    if (x !== this.status.scroll.x && this.status.scroll.velocity.x !== 0) {
      // Reset the scroll velocity.
      this.status.scroll.velocity.x = 0;
    }
    if (y !== this.status.scroll.y && this.status.scroll.velocity.y !== 0) {
      // Reset the scroll velocity.
      this.status.scroll.velocity.y = 0;
    }
  };

  /**
   * Sets the previous scroll position.
   * @param {Number} x The x coordinate of the previous scroll position.
   * @param {Number} y The y coordinate of the previous scroll position.
   * @returns {void}
   */
  private setPreviousScrollPositions(x: number, y: number): void {
    // Set the previous scroll positions.
    this.status.scroll.previousX = x;
    this.status.scroll.previousY = y;
  }

  /**
   * Sets the current scroll velocity.
   * @param {Number} x The x coordinate of previous scroll position.
   * @param {Number} y The y coordinate of previous scroll position.
   * @returns {void}
   */
  private setScrollVelocities(x: number, y: number): void {
    // Set the scroll velocities.
    this.status.scroll.velocity.x = Math.floor(x - this.status.scroll.x);
    this.status.scroll.velocity.y = Math.floor(y - this.status.scroll.y);
  }

  /**
   * Sets the current scroll position. Then uses both the current and previous scroll positions to calculate the new scroll velocity.
   * @param {Number} x The x coordinate of the current scroll position.
   * @param {Number} y The y coordinate of the current scroll position.
   * @returns {void}
   */
  private setScrollPositions(x: number, y: number): void {
    // Set the scroll velocities.
    this.setScrollVelocities(x, y);

    // Set the new scroll positions.
    this.status.scroll.x = x;
    this.status.scroll.y = y;
  }

  /**
   * First starts by resetting the scroll velocity. Then, sets the current scroll position as the previous scroll position. Finally, it finishes with setting the current scroll velocity and position.
   * @returns {void}
   */
  private manageScroll = (event: Event): void => {
    if (event.type === 'scroll') {
      // Set the scroll changed flag to true.
      this.status.scroll.changed = true;

      // Reset scroll velocities.
      this.resetScrollVelocities(window.scrollX || window.pageXOffset, window.scrollY || window.pageYOffset);

      // Set the previous scroll positions.
      this.setPreviousScrollPositions(this.status.scroll.x, this.status.scroll.y);

      // Set the new scroll positions.
      this.setScrollPositions(window.scrollX || window.pageXOffset, window.scrollY || window.pageYOffset);
    }
  };

  /**
   * Validates whether or not the point given is within the Viewport.
   * @param {Number} x The x coordinate of the current touch position.
   * @param {Number} y The y coordinate of the current touch position.
   * @returns {Boolean} Boolean value indicating if the point in question is in the Viewport or not.
   */
  private validateWithinViewport(x: number, y: number): boolean {
    const top = Math.floor(this.position.y);
    const right = Math.floor(this.position.x + this.dimensions.width);
    const bottom = Math.floor(this.position.y + this.dimensions.height);
    const left = Math.floor(this.position.x);
    return x >= left && x <= right && y >= top && y <= bottom;
  }

  /**
   * Sets the starting mouse position along with whether or not it is in the Viewport.
   * @param {Number} x The x coordinate of the mouse position.
   * @param {Number} y The y coordinate of the mouse position.
   * @returns {void}
   */
  private setMouseStart(x: number, y: number, inViewport: boolean) {
    // Set the mouse start positions.
    this.input.mouse.start.x = x;
    this.input.mouse.start.y = y;
    this.input.mouse.start.withinViewport = inViewport;
  }

  /**
   * Sets the starting mouse time for the current mouse.
   * @param {Date} start The starting mouse time for the current mouse in the Date format.
   */
  private setMouseStartTime(start: Date): void {
    // Set the mouse start time.
    this.input.mouse.duration.pressStart = start.getTime();
  }

  /**
   * Sets the current mouse position point.
   * @param {Number} x The x coordinate of the current mouse position.
   * @param {Number} y The y coordinate of the current mouse position.
   * @param {Boolean} inViewport Whether or not the position is within the viewport.
   * @returns {void}
   */
  private setMouseCurrent(x: number, y: number, inViewport: boolean): void {
    // Set the mouse current positions.
    this.input.mouse.current.x = x;
    this.input.mouse.current.y = y;
    this.input.mouse.current.withinViewport = inViewport;
  }

  /**
   * Composes the next line coordinate object, including whether or not it is in the Viewport.
   * @param {Number} x The x coordinate of the current mouse position.
   * @param {Number} y The y coordinate of the current mouse position.
   * @param {Boolean} inViewport Boolean value indicating whether or not the point is in the Viewport.
   * @returns {void}
   */
  private addToMouseLine(x: number, y: number, withinViewport: boolean): void {
    // Add to the mouse's position current line
    this.input.mouse.line.push({ x, y, withinViewport });
  }

  /**
   * Manages what happens when the mouse is clicked.
   * 1. First the starting mouse position is set.
   * 2. Next the starting mouse position's timestamp is set.
   * 3. Next the current mouse position is set.
   * 4. Finally, the current mouse position is added to the mouse's current line.
   * @param event The mousedown event object.
   */
  private manageMouseDown = (event: MouseEvent): void => {
    if (event.type === 'mousedown') {
      // Set the mouse changed flag to true.
      this.input.mouse.changed = true;

      // Set the mouse start positions.
      this.setMouseStart(event.clientX, event.clientY, this.validateWithinViewport(event.screenX, event.screenY));

      // Set the mouse click start timestamp.
      this.setMouseStartTime(new Date());

      // Set the mouse current position.
      this.setMouseCurrent(event.clientX, event.clientY, this.validateWithinViewport(event.screenX, event.screenY));

      // Add to the mouse's position current line
      this.addToMouseLine(event.clientX, event.clientY, this.validateWithinViewport(event.screenX, event.screenY));
    }
  };

  /**
   * Sets the previous mouse positions.
   * @param {Number} x The previous x coordinate of the mouse position.
   * @param {Number} y The previous y coordinate of the mouse position.
   */
  private setPreviousMousePositions(x: number, y: number): void {
    // Set the previous mouse positions.
    this.input.mouse.lastX = x;
    this.input.mouse.lastY = y;
  }

  /**
   * Sets the touch direction the user is currently moving in.
   * @param {object} previousMove The coordinate object representing the previous point of movement.
   * @param {object} currentMove The coordinate object representing the current point of movement.
   * @returns {Void}
   */
  private setMouseDirection(previousMove: { x: number; y: number; withinViewport: boolean }, currentMove: { x: number; y: number; withinViewport: boolean }) {
    // Initialize the mouse direction values.
    const left: string = 'West';
    const right: string = 'East';
    const up: string = 'North';
    const down: string = 'South';
    const stationary = 'Stationary';

    // Initialize the direction string.
    let direction: string | undefined;

    // Set the comparison coordinates.
    const x: number = previousMove.x;
    const y: number = previousMove.y;

    // Calculate the mouse's y and x directions.
    const yDirection: number = currentMove.y - y;
    const xDirection: number = currentMove.x - x;

    // Set the mouse's direction.
    if (yDirection === 0) {
      if (xDirection === 0) direction = stationary;
      if (xDirection > 0) direction = right;
      if (xDirection < 0) direction = left;
    } else if (yDirection > 0) {
      // If The Mouse Goes Down
      if (xDirection === 0) direction = down;
      if (xDirection > 0) direction = `${down}${right.toLowerCase()}`;
      if (xDirection < 0) direction = `${down}${left.toLowerCase()}`;
    } else {
      // If The Mouse Goes Up
      if (xDirection === 0) direction = up;
      if (xDirection > 0) direction = `${up}${right.toLowerCase()}`;
      if (xDirection < 0) direction = `${up}${left.toLowerCase()}`;
    }

    // Set the mouse's direction.
    this.input.mouse.direction = direction;
  }

  /**
   * Sets the current mouse position's timestamp for the usage of when the mouse button is released.
   * @param {Date} timestamp The timestamp of the final moments the mouse button was down.
   */
  private setCurrentMouseTimestamp(timestamp: Date): void {
    this.input.mouse.current.timestamp = timestamp;
  }

  /**
   * Sets that the mouse position has changed before setting the current mouse positions.
   * @param {Number} x The current x coordinate of the mouse position.
   * @param {Number} y The current y coordinate of the mouse position.
   * @param {Boolean} clicked Whether or not the left mouse button is clicked.
   * @returns {void}
   */
  private setMouseMovements(x: number, y: number, clicked: boolean, withinViewport: boolean): void {
    // Set the mouse movements.
    this.input.mouse.x = x;
    this.input.mouse.y = y;

    // If the mouse is clicked, add the mouse's position to the line. Update the direction it's going and the current position's timestamp.
    if (clicked) {
      this.setMouseCurrent(x, y, withinViewport);
      this.addToMouseLine(x, y, withinViewport);
      this.setMouseDirection(
        this.input.mouse.line[this.input.mouse.line.length - 2]
          ? this.input.mouse.line[this.input.mouse.line.length - 2]
          : this.input.mouse.line[this.input.mouse.line.length - 1],
        this.input.mouse.current,
      );
      this.setCurrentMouseTimestamp(new Date());
    }
  }

  /**
   * Keeps an array to the length of five elements, if it is necessary. Then, adds the next velocity element to the array.
   * @param {Array} array The velocity array.
   * @param {String} property The property to access the correct data so the correct velocity data is calculated.
   * @returns {void}
   */
  private manageMouseVelocities(array: number[], property: keyof typeof this.input.mouse) {
    // Shift an item if the array is longer than five items.
    if (array.length > 5) array.shift();

    // Calculate the most recent velocity.
    const velocity: number = Number(this.input.mouse[property]) - Number(this.input.mouse[`last${property.toString().toUpperCase()}`]);

    // Add the most recent velocity to the array.
    array.push(velocity);
  }

  /**
   * Manages what happens when the mouse is moved.
   * 1. First, stores whether or not the primary mouse button was clicked.
   * 2. Next, it sets the previous mouse positions.
   * 3. Next, the current mouse movement is recorded.
   * 4. Next, the velocity of the mouse movement is recorded.
   * 5. Finally, the velocity of the mouse is averaged and set.
   * @param event The mousemove event object.
   */
  private manageMouseMove = (event: MouseEvent): void => {
    if (event.type === 'mousemove') {
      // Set the mouse changed flag to true.
      this.input.mouse.changed = true;

      // Store the mouse's clicked state.
      const clicked: boolean = event.buttons === 1;

      // Set the previous mouse positions.
      this.setPreviousMousePositions(this.input.mouse.x, this.input.mouse.y);

      // Manage the mouse's movements.
      this.setMouseMovements(event.clientX, event.clientY, clicked, this.validateWithinViewport(event.screenX, event.screenY));

      // Managing the mouse velocity arrays.
      // Horizontal Array
      this.manageMouseVelocities(this.input.mouse.velocity.bufferX, 'x');
      // Vertical Array
      this.manageMouseVelocities(this.input.mouse.velocity.bufferY, 'y');

      // Get average velocities for the mouse.
      // Horizontal velocity.
      if (this.input.mouse.velocity.bufferX.average() !== this.input.mouse.velocity.x) {
        this.input.mouse.velocity.x = this.input.mouse.velocity.bufferX.average();
      }

      // Vertical velocity.
      if (this.input.mouse.velocity.bufferY.average() !== this.input.mouse.velocity.y) {
        this.input.mouse.velocity.y = this.input.mouse.velocity.bufferY.average();
      }
    }
  };

  /**
   * Sets the click and hold end for the current click and hold before validating whether or not it is in the Viewport.
   * @param {Number} x The x coordinate of the mouse's final position.
   * @param {Number} y The y coordinate of the mouse's final position.
   */
  private setMouseEnd(x: number, y: number, withinViewport: boolean) {
    this.input.mouse.end.x = x;
    this.input.mouse.end.y = y;
    this.input.mouse.end.withinViewport = withinViewport;
  }

  /**
   * Sets the ending click and hold time for the mouse.
   * @param {Date} end The ending click and hold time for the current click and hold in the Date format.
   */
  private setMouseEndTime(end: Date) {
    this.input.mouse.duration.pressEnd = end.getTime();
  }

  /**
   * Clears the current mouse line after setting it to the previous mouse line.
   * @returns {void}
   */
  private clearMouseLine(): void {
    // Set the previous mouse line.
    this.input.mouse.previousLine = [...this.input.mouse.line];

    // Clear the mouse line.
    this.input.mouse.line.clear();
  }

  /**
   * Sets the click duration after other click values have been recorded.
   * @param {Number} duration The click duration represented as a number.
   * @returns {void}
   */
  private setMouseClickDuration(duration: number): void {
    this.input.mouse.duration.pressed = duration;
  }

  /**
   * Manages what happens when the primary mouse button is released.
   * 1. First, the final position of the mouse is set.
   * 2. Second, the current mouse position is set.
   * 3. Third, the ending position is added to the current mouse line.
   * 4. Fourth, the mouse's direction is recorded.
   * 5. Fifth, the timestamp of the last position is recorded.
   * 6. Sixth, the clearing of the current line is done after the current line is stored as the previous line.
   * 7. Finally, the duration of the mouse's click is calculated and recorded.
   * @param event The mouseup event object.
   */
  private manageMouseUp = (event: MouseEvent): void => {
    if (event.type === 'mouseup') {
      // Set the mouse changed flag to true.
      this.input.mouse.changed = true;

      // Set the mouse end position.
      this.setMouseEnd(event.clientX, event.clientY, this.validateWithinViewport(event.screenX, event.screenY));

      // Set the current mouse position.
      this.setMouseCurrent(event.clientX, event.clientY, this.validateWithinViewport(event.screenX, event.screenY));

      // Add the end position to the mouse's line.
      this.addToMouseLine(event.clientX, event.clientY, this.validateWithinViewport(event.screenX, event.screenY));

      // Set the mouse's direction.
      this.setMouseDirection(this.input.mouse.line[this.input.mouse.line.length - 2], this.input.mouse.current);

      // Set the mouse's click end time.
      this.setMouseEndTime(new Date());

      // Clear the mouse's line.
      this.clearMouseLine();

      // Calculate and set the mouse's click duration.
      const duration = (this.input.mouse.duration.pressEnd! - this.input.mouse.duration.pressStart!) / 100;
      this.setMouseClickDuration(duration);
    }
  };

  /**
   * Sets the starting touch position along with whether or not it is in the Viewport.
   * @param {Number} x The x coordinate of the touch position.
   * @param {Number} y The y coordinate of the touch position.
   * @returns {void}
   */
  private setTouchStart(x: number, y: number): void {
    this.input.touch.start.x = x;
    this.input.touch.start.y = y;
    this.input.touch.start.withinViewport = this.validateWithinViewport(x, y);
  }

  /**
   * Sets the starting touch time for the current touch.
   * @param {Date} start The starting touch time for the current touch in the Date format.
   */
  private setTouchStartTime(start: Date): void {
    this.input.touch.duration.pressStart = start.getTime();
  }

  /**
   * Sets the current touch position point.
   * @param {Number} x The x coordinate of the current touch position.
   * @param {Number} y The y coordinate of the current touch position.
   * @returns {void}
   */
  private setTouchCurrent(x: number, y: number): void {
    this.input.touch.current.x = x;
    this.input.touch.current.y = y;
    this.input.touch.current.withinViewport = this.validateWithinViewport(x, y);
  }

  /**
   * Composes the next line coordinate object, including whether or not it is in the Viewport.
   * @param {Number} x The x coordinate of the current touch position.
   * @param {Number} y The y coordinate of the current touch position.
   * @param {Boolean} withinViewport Boolean value indicating whether or not the point is in the Viewport.
   * @returns {void}
   */
  private addToTouchLine(x: number, y: number, withinViewport: boolean): void {
    this.input.touch.line.push({ x, y, withinViewport });
  }

  /**
   * Sets the starting touch position and duration start time. Then it sets the current touch with the starting position and finally, adds that starting position to the current line.
   * @param {Object} event The touch event object.
   * @returns {void}
   */
  private manageTouchStart = (event: TouchEvent): void => {
    if (event.type === 'touchstart') {
      // Set touch changed flag to true.
      this.input.touch.changed = true;

      // Store the touches for future use.
      const touches = event.changedTouches || event.touches;

      // Set the starting touch point.
      this.setTouchStart(touches[0].clientX, touches[0].clientY);

      // Set the touch start timestamp.
      this.setTouchStartTime(new Date());

      // Set the current touch point.
      this.setTouchCurrent(touches[0].clientX, touches[0].clientY);

      // Add current touch to the touch line.
      this.addToTouchLine(touches[0].clientX, touches[0].clientY, this.input.touch.current.withinViewport);
    }
  };

  /**
   * Sets the touch direction the user is currently moving in.
   * @param {object} previousMove The coordinate object representing the previous point of movement.
   * @param {object} currentMove The coordinate object representing the current point of movement.
   * @returns {Void}
   */
  private setTouchDirection = (
    previousMove: { x: number; y: number; withinViewport: boolean },
    currentMove: { x: number; y: number; withinViewport: boolean },
  ) => {
    // Initialize Touch Direction Values
    const left: string = 'West';
    const right: string = 'East';
    const up: string = 'North';
    const down: string = 'South';
    const stationary: string = 'Stationary';

    // Initialize Touch Direction String
    let direction: string = '';

    // Set Comparison Coordinates
    const x: number = previousMove.x;
    const y: number = previousMove.y;

    // Calculate Touch Y Position
    const yDirection: number = currentMove.y - y;

    // Calculate Touch X Position
    const xDirection: number = currentMove.x - x;

    // Set Touch Direction
    if (yDirection === 0) {
      // If The Touch Doesn't Go Up or Down
      if (xDirection === 0) direction = stationary;
      if (xDirection > 0) direction = right;
      if (xDirection < 0) direction = left;
    } else if (yDirection > 0) {
      // If The Touch Goes Down
      if (xDirection === 0) direction = down;
      if (xDirection > 0) direction = `${down}${right.toLowerCase()}`;
      if (xDirection < 0) direction = `${down}${left.toLowerCase()}`;
    } else {
      // If The Touch Goes Up
      if (xDirection === 0) direction = up;
      if (xDirection > 0) direction = `${up}${right.toLowerCase()}`;
      if (xDirection < 0) direction = `${up}${left.toLowerCase()}`;
    }

    // Sets The Direction
    this.input.touch.direction = direction;
  };

  /**
   * Sets the current touch, then adds it to the current line before updating the current direction.
   * @param {Object} event The touch event object.
   * @returns {void}
   */
  private manageTouchMove = (event: TouchEvent): void => {
    if (event.type === 'touchmove') {
      // Set the touch changed flag to true.
      this.input.touch.changed = true;

      // Store the touches for future use.
      const touches = event.changedTouches || event.touches;

      // Set the current touch point.
      this.setTouchCurrent(touches[0].clientX, touches[0].clientY);

      // Add current touch point to the touch line.
      this.addToTouchLine(touches[0].clientX, touches[0].clientY, this.input.touch.current.withinViewport);

      // Setting the direction of the current touch.
      this.setTouchDirection(this.input.touch.line[this.input.touch.line.length - 2], this.input.touch.current);
    }
  };

  /**
   * Sets the touch end for the current touch before validating whether or not it is in the Viewport.
   * @param {Number} x The x coordinate of the touch position.
   * @param {Number} y The y coordinate of the touch position.
   */
  private setTouchEnd(x: number, y: number): void {
    this.input.touch.end.x = x;
    this.input.touch.end.y = y;
    this.input.touch.end.withinViewport = this.validateWithinViewport(x, y);
  }

  /**
   * Sets the ending touch time for the current touch.
   * @param {Date} end The ending touch time for the current touch in the Date format.
   */
  private setTouchEndTime(end: Date): void {
    this.input.touch.duration.pressEnd = end.getTime();
  }

  /**
   * Clears the current touch line after setting it to the previous touch line.
   * @returns {void}
   */
  private clearTouchLine(): void {
    // Set the touch's previous line.
    this.input.touch.previousLine = [...this.input.touch.line];

    // Clear the touch line.
    this.input.touch.line.clear();
  }

  /**
   * Sets the touch duration after other touch values have been recorded.
   * @param {Number} duration The touch duration represented as a number.
   * @returns {void}
   */
  private setTouchDuration(duration: number): void {
    this.input.touch.duration.pressed = duration;
  }

  /**
   * Sets the final touch. Then it adds it to the current touch and the touch line. Next, the direction is set and finally, the timestamp of the final touch is set before the current line is cleared.
   * @param {Object} event The TouchEvent object.
   * @returns {void}
   */
  private manageTouchEnd = (event: TouchEvent): void => {
    if (event.type === 'touchend') {
      // Set the touch changed flag to true.
      this.input.touch.changed = true;

      // Store the touches for future use.
      const touches = event.changedTouches || event.touches;

      // Set the ending touch point.
      this.setTouchEnd(touches[0].clientX, touches[0].clientY);

      // Setting the final current touch point.
      this.setTouchCurrent(touches[0].clientX, touches[0].clientY);

      // Adding final current touch point to the touch line.
      this.addToTouchLine(touches[0].clientX, touches[0].clientY, this.input.touch.end.withinViewport);

      // Add the direction of the touch for the final time.
      this.setTouchDirection(this.input.touch.line[this.input.touch.line.length - 2], this.input.touch.end);

      // Set the touch's ending timestamp.
      this.setTouchEndTime(new Date());

      // Clear the touch line after setting it to the previous touch line.
      this.clearTouchLine();

      // Calculate touch duration and set it.
      const duration: number = (this.input.touch.duration.pressEnd! - this.input.touch.duration.pressStart!) / 100;
      this.setTouchDuration(duration);
    }
  };

  private resetTouchState(): touchState {
    return {
      cancelled: this.input.touch.cancelled,
      changed: this.input.touch.changed,
      direction: undefined,
      duration: {
        pressStart: undefined,
        pressEnd: undefined,
        pressed: 0,
        units: 'seconds',
      },
      start: {
        x: 0,
        y: 0,
        withinViewport: false,
      },
      current: {
        x: 0,
        y: 0,
        withinViewport: false,
      },
      end: {
        x: 0,
        y: 0,
        withinViewport: false,
      },
      previousLine: [],
      line: [],
    };
  }

  /**
   * This manages the times when a touch is cancelled.
   * @param {Object} event The touch event object.
   * @returns {void}
   */
  // FEATURE THIS METHOD WILL COME IN THE FUTURE.
  private manageTouchCancel = (event: TouchEvent) => {
    if (event.type === 'touchcancel') {
      // This will need to be handled a different time after cleaning up the rest of the class.
      // It appears these happen when a touch event is simply canceled, so in this case, the touch state should be reset.
      // Set the touch changed flag to true.
      this.input.touch.changed = true;
      // Set the touch cancelled flag to true.
      this.input.touch.cancelled = true;
      this.input.touch = this.resetTouchState();
    }
  };

  /**
   * This function initializes the calibration object.
   * @param {number} alpha This is the Z-Axis orientation of the device.
   * @param {number} beta This is the X-Axis orientation of the device.
   * @param {number} gamma This is the Y-Axis orientation of the device.
   * @returns {object} The previous the initial orientation values are initialized in this object.
   */
  private setCalibration(
    alpha: number,
    beta: number,
    gamma: number,
  ): {
    previous: { alpha: number; beta: number; gamma: number };
    current: { alpha: number | undefined; beta: number | undefined; gamma: number | undefined };
  } {
    return {
      previous: {
        alpha,
        beta,
        gamma,
      },
      current: {
        alpha: undefined,
        beta: undefined,
        gamma: undefined,
      },
    };
  }

  /**
   * This function modifies the calibration to add the latest values.
   * @param {object} calibration The calibration object.
   * @param {string} property The new property being added.
   * @param {object} object The object that the property key represents in the calibration object.
   * @returns {object} The modified calibration object.
   */
  private modifyCalibration(
    calibration: {
      [key: string]: { [key: string]: number | undefined };
      previous: { alpha: number; beta: number; gamma: number };
      current: { alpha: number | undefined; beta: number | undefined; gamma: number | undefined };
    },
    property: string,
    object: { alpha: number; beta: number; gamma: number },
  ) {
    calibration[property] = object;
    return calibration;
  }

  /**
   * Formats the data for easier use by the developer.
   * @returns {Object} The formatted, or shaped data.
   */
  private shapeData(): shapedData {
    // Go Get The Current Keyboard State
    const updatedKeyboardState: keyboardState = this.keyboard.getCurrentState();

    return {
      position: {
        changed: this.position.changed,
        top: Math.floor(this.position.y),
        right: Math.floor(this.position.x + this.dimensions.width),
        bottom: Math.floor(this.position.y + this.dimensions.height),
        left: Math.floor(this.position.x),
      },
      velocity: {
        changed: this.velocity.changed,
        x: Math.floor(this.velocity.x) || 0,
        y: Math.floor(this.velocity.y) || 0,
      },
      devicePixelRatio: {
        changed: this.devicePixelRatio.changed,
        value: Math.max(window.devicePixelRatio || 1.0, 1.0),
      },
      dimensions: {
        changed: this.dimensions.changed,
        height: Math.floor(this.dimensions.height),
        width: Math.floor(this.dimensions.width),
      },
      document: {
        changed: this.document.changed,
        height: Math.floor(document.body.scrollHeight),
        width: Math.floor(document.body.scrollWidth),
      },
      status: {
        zoomLevel: this.status.zoomLevel,
        orientation: {
          changed: this.status.orientation.changed,
          alpha: Math.floor(this.status.orientation.alpha!),
          beta: Math.floor(this.status.orientation.beta!),
          gamma: Math.floor(this.status.orientation.gamma!),
        },
        scroll: {
          changed: this.status.scroll.changed,
          left: Math.floor(this.status.scroll.x),
          right: Math.floor(this.status.scroll.x + this.dimensions.width),
          top: Math.floor(this.status.scroll.y),
          bottom: Math.floor(this.status.scroll.y + this.dimensions.height),
          velocity: {
            horizontalScrollVelocity: Math.floor(this.status.scroll.velocity.x) || 0,
            verticalScrollVelocity: Math.floor(this.status.scroll.velocity.y) || 0,
          },
        },
      },
      input: {
        keyboard: {
          changed: updatedKeyboardState.changed,
          previousKey: {
            code: updatedKeyboardState.previousKey.code,
            name: updatedKeyboardState.previousKey.name,
            characterCode: updatedKeyboardState.previousKey.characterCode,
            info: updatedKeyboardState.previousKey.info,
            duration: {
              value: Math.round(updatedKeyboardState.previousKey.duration.pressed) / 10,
              units: updatedKeyboardState.previousKey.duration.units,
            },
          },
          currentKey: {
            code: updatedKeyboardState.currentKey.code,
            name: updatedKeyboardState.currentKey.name,
            characterCode: updatedKeyboardState.currentKey.characterCode,
            info: updatedKeyboardState.currentKey.info,
            duration: {
              value: Math.round(updatedKeyboardState.currentKey.duration.pressed) / 10,
              units: updatedKeyboardState.currentKey.duration.units,
            },
          },
          releasedKey: {
            code: updatedKeyboardState.releasedKey.code,
            name: updatedKeyboardState.releasedKey.name,
            characterCode: updatedKeyboardState.releasedKey.characterCode,
            info: updatedKeyboardState.releasedKey.info,
            duration: {
              value: Math.round(updatedKeyboardState.releasedKey.duration.pressed) / 10,
              units: updatedKeyboardState.releasedKey.duration.units,
            },
          },
          pressedKeys: updatedKeyboardState.pressedKeys.map((key) => {
            return {
              code: key.code,
              name: key.name,
              characterCode: key.characterCode,
              info: key.info,
              duration: {
                value: Math.round(key.duration.pressed) / 10,
                units: key.duration.units,
              },
            };
          }),
        },
        mouse: {
          changed: this.input.mouse.changed,
          direction: this.input.mouse.direction,
          x: Math.floor(this.input.mouse.x),
          y: Math.floor(this.input.mouse.y),
          duration: {
            value: Math.round(this.input.mouse.duration.pressed) / 10,
            units: this.input.mouse.duration.units,
          },
          velocity: {
            x: Math.floor(this.input.mouse.velocity.x) || 0,
            y: Math.floor(this.input.mouse.velocity.y) || 0,
          },
          previousLine: this.input.mouse.previousLine,
          line: this.input.mouse.line,
          start: {
            x: Math.floor(this.input.mouse.start.x),
            y: Math.floor(this.input.mouse.start.y),
            withinViewport: this.input.mouse.start.withinViewport,
          },
          end: {
            x: Math.floor(this.input.mouse.end.x),
            y: Math.floor(this.input.mouse.end.y),
            withinViewport: this.input.mouse.end.withinViewport,
          },
        },
        touch: {
          changed: this.input.touch.changed,
          direction: this.input.touch.direction,
          duration: {
            value: Math.round(this.input.touch.duration.pressed) / 10,
            units: this.input.touch.duration.units,
          },
          previousLine: this.input.touch.previousLine,
          line: this.input.touch.line,
          start: {
            x: Math.floor(this.input.touch.start.x),
            y: Math.floor(this.input.touch.start.y),
            withinViewport: this.input.touch.start.withinViewport,
          },
          end: {
            x: Math.floor(this.input.touch.end.x),
            y: Math.floor(this.input.touch.end.y),
            withinViewport: this.input.touch.end.withinViewport,
          },
        },
      },
    };
  }

  // PUBLIC METHODS
  /**
   * This is for getting the Server-Side Rendering status of the library.
   * @returns {void}
   */
  public getSSRStatus(): boolean {
    return this.isSSR;
  }

  /**
   * Subscribes a callback to be 'watched'. Watched callback functions will be called automatically EVERY update.
   * @param {Function} callback The function being called each update.
   * @param {Boolean} callOnWatch Call the function on subscription? Defaults to true.
   * @returns {void}
   */
  public watch = (callback: (state: shapedData) => unknown, callOnWatch: boolean = true): void => {
    // Validating if the class is being run server side.
    if (this.isSSR) return;

    // Execution of the first run if callOnWatch = True.
    if (callOnWatch) {
      // Getting a clone of the stored data.
      const initialRunData = this.getState();

      // Most watch functions have guard clauses that check for changes.
      // This is to circumvent that by simulating all changed values are true on the first run.
      initialRunData.position.changed = true;
      initialRunData.devicePixelRatio.changed = true;
      initialRunData.velocity.changed = true;
      initialRunData.dimensions.changed = true;
      initialRunData.document.changed = true;
      initialRunData.status.orientation.changed = true;
      initialRunData.status.scroll.changed = true;
      initialRunData.input.mouse.changed = true;
      initialRunData.input.touch.changed = true;

      // Execute the callback with the initial data.
      callback(initialRunData);
    }

    // Push the callback to the queue to ensure it runs on future updates.
    this.callbacks.push(callback);
  };

  /**
   * Unsubscribes the callback from being watched.
   * @param {Function} callback The function to be unsubscribed from being run on each update.
   * @returns {void}
   */
  public unwatch = (callback: (state: shapedData) => unknown): unknown => {
    // Validating if the class is being run server side.
    if (this.isSSR) return;

    // Filter out the callback from the queue.
    this.callbacks = this.callbacks.filter((cb) => cb !== callback);
  };

  /**
   * Calls for and retrieves the current state of the Viewport.
   * @returns {Object} The current, public state of the Viewport.
   */
  public getState = (): shapedData => {
    return this.shapeData();
  };

  /**
   * This resets the alpha, beta, and gamma orientation values.
   * @returns {Object} The Viewport calibration object.
   */
  public recalibrateOrientation = (): {
    previous: { alpha: number | undefined; beta: number | undefined; gamma: number | undefined };
    current: { alpha: number | undefined; beta: number | undefined; gamma: number | undefined };
  } => {
    // Setting the initial calibration of the device.
    let calibration: {
      previous: { alpha: number; beta: number; gamma: number };
      current: { alpha: number | undefined; beta: number | undefined; gamma: number | undefined };
    } = this.setCalibration(this.status.orientation.initialAlpha!, this.status.orientation.initialBeta!, this.status.orientation.initialGamma!);

    // Reset the orientation values to the latest recorded position.
    this.status.orientation.initialAlpha = this.status.orientation.previousAlpha;
    this.status.orientation.initialBeta = this.status.orientation.previousBeta;
    this.status.orientation.initialGamma = this.status.orientation.previousGamma;

    // Add the new values to the stored calibration object.
    calibration = this.modifyCalibration(calibration, 'current', {
      alpha: this.status.orientation.initialAlpha!,
      beta: this.status.orientation.initialBeta!,
      gamma: this.status.orientation.initialGamma!,
    });

    return calibration;
  };
}

// Export the viewport as a default and a single instance of it.
export const viewport: Viewport = new Viewport();

// Expose a limited set of methods globally for use within basic scripts (<script>).
if (!viewport.getSSRStatus()) {
  window.__VIEWPORT = {
    watch: viewport.watch,
    unwatch: viewport.unwatch,
    getState: viewport.getState,
    recalibrateOrientations: viewport.recalibrateOrientation,
  };
}
