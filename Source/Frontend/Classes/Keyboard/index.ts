import { keyboardKey, keyboardState } from './interfaces';
import '../../../Utils/arrayMethods';

/*
  TODO:

    [ ] Make sure that whenever a keypress is made, it is updated with whatever it using the keyboard.

*/

class Keyboard {
  // PRIVATE PROPERTIES
  private updating: boolean = false;
  public changed: boolean = false;
  private previousKey: keyboardKey = {
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
  private currentKey: keyboardKey = {
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
  private releasedKey: keyboardKey = {
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
  private pressedKeys: keyboardKey[] = [];

  // CALLBACK QUEUE
  private callbacks: Array<(state: keyboardState) => unknown> = [];

  // CONSTRUCTOR
  constructor() {
    // BINDING 'THIS' TO EASE METHODS
    this.verifyProperty = this.verifyProperty.bind(this);
    this.manageKeyDown = this.manageKeyDown.bind(this);
    this.manageKeyUp = this.manageKeyUp.bind(this);
    this.getPreviousKey = this.getPreviousKey.bind(this);
    this.getCurrentKey = this.getCurrentKey.bind(this);
    this.getReleasedKey = this.getReleasedKey.bind(this);
    this.getPressedKeys = this.getPressedKeys.bind(this);
    this.getCurrentState = this.getCurrentState.bind(this);

    // KEYBOARD EVENT LISTENERS
    window.addEventListener('keydown', this.manageKeyDown);
    window.addEventListener('keyup', this.manageKeyUp);

    // RESET & LOOP THE UPDATE
    this.updating = false;
    requestAnimationFrame(this.update);
  }

  // PRIVATE METHODS
  private update = (): void => {
    if (this.changed) {
      this.callbacks.forEach((callback) => {
        callback(this.getState());
      });
    }

    // Reset Changed Flag
    // this.changed = false;

    //////////////////////////////
    // Reset & Loop The Method
    this.updating = false;
    requestAnimationFrame(this.update);
  };

  /**
   * Verifies if the property exists in the parent object.
   * @param parentObject The object you wish to check if the property exists in.
   * @param property The property in question.
   * @returns {boolean} True if the property exists, false otherwise.
   */
  private verifyProperty(parentObject: { [key: string]: unknown }, property: string): boolean {
    return property in parentObject;
  }

  private validateValueTruthiness(parentObject: { [key: string]: unknown }, property: string): boolean | undefined {
    if (this.verifyProperty(parentObject, property)) return !!parentObject[property];
  }

  /**
   * Handles the setting of the initial and subsequent key information.
   * @param keyCode {number} The key code of the pressed key.
   * @param keyName {string} The name of the pressed key.
   * @param characterCode {number} The character code of the pressed key.
   * @param keyInfo {string} The information of the pressed key.
   * @returns {void}
   */
  private handleKeyInformation = (keyCode: number, keyName: string, characterCode: number, keyInfo: string): void => {
    // Validate Previous Key Information
    // Initialize Previous Key Validation Array
    const keyNames: string[] = Object.keys(this.previousKey).filter((key) => key !== 'duration');

    // Initialize Previous Key Validation Object
    const previousKeyValidationObject: { [index: string]: boolean | undefined } = {};

    // Loop & Validate Previous Key Information Properties
    // - What I intended here was to both verify that the property exists and whether it is a truthy or falsy value.
    // - Whether or not the value is truthy or falsy should be what is returned.
    keyNames.forEach((key: string) => {
      previousKeyValidationObject[key] = this.validateValueTruthiness(this.previousKey, key);
    });

    // Loop Previous Key Validation Object & Set Previous Key Information Accordingly
    for (const key in previousKeyValidationObject) {
      switch (key) {
        case 'code':
          this.previousKey[key] = previousKeyValidationObject[key] === true ? this.currentKey[key] : keyCode;
          break;
        case 'name':
          this.previousKey[key] = previousKeyValidationObject[key] === true ? this.currentKey[key] : keyName;
          break;
        case 'characterCode':
          this.previousKey[key] = previousKeyValidationObject[key] === true ? this.currentKey[key] : characterCode;
          break;
        case 'info':
          this.previousKey[key] = previousKeyValidationObject[key] === true ? this.currentKey[key] : keyInfo;
          break;
      }
    }

    // Loop Key Names & SetThe Current Key Information
    keyNames.forEach((key: string) => {
      switch (key) {
        case 'code':
          this.currentKey[key] = keyCode;
          break;
        case 'name':
          this.currentKey[key] = keyName;
          break;
        case 'characterCode':
          this.currentKey[key] = characterCode;
          break;
        case 'info':
          this.currentKey[key] = keyInfo;
          break;
      }
    });
  };

  /**
   * Sets the timestamp for the duration of the key press.
   * @param durationObject {keyboardKey} The key object to set the duration for.
   * @param timing {string} The timing to set (pressStart, pressEnd).
   * @param timeStamp {Date | number} The timestamp to set.
   */
  private setDurationTimeStamp = (durationObject: { [index: string]: Date | number | string | undefined }, timing: string, timeStamp: Date | number): void => {
    durationObject[timing] = timeStamp;
  };

  /**
   * Manages adding a key to the pressed keys array.
   * @param key {keyboardKey} The key being added to the pressed keys array.
   * @returns {void}
   */
  private addPressedKey = (key: keyboardKey): void => {
    this.pressedKeys.push(key);
  };

  /**
   * Manages what happens when a key is pressed.
   * 1. First, it checks if the event is a keydown event and if it is not a repeat event.
   *    - If it is a keydown event and not a repeat event, it updates the changed flag to true.
   *    - It then handles the setting of the previous and current key information.
   *         - The following information is set:
   *            - keyCode (number) | The event.keyCode
   *            - keyName (string) | The event.key
   *            - characterCode (number) | The event.charCode
   *            - keyInfo (string) | The event.code
   *    - It sets the current key's press start timestamp.
   *    - If the pressed keys array is empty, it adds the current key to the pressed keys array.
   *    - If the pressed keys array is NOT empty, it throws an error.
   * 2. If it is a keydown event and it is a repeat event, it updates the changed flag to true.
   *    - It then checks if the pressed keys array contains the new key.
   *    - If it does, it does nothing.
   *    - If it does not, it handles the setting of the previous and current key information.
   *         - The following information is set:
   *            - keyCode (number) | The event.keyCode
   *            - keyName (string) | The event.key
   *            - characterCode (number) | The event.charCode
   *            - keyInfo (string) | The event.code
   *    - It sets the current key's press start timestamp.
   *    - It then adds the current key to the pressed keys array.
   * @param event {KeyboardEvent} The keyboard event.
   * @returns {void}
   */
  private manageKeyDown = (event: KeyboardEvent) => {
    const repeat: boolean = event.repeat;
    if (event.type === 'keydown') {
      // If it is a key being held down, return.
      if (repeat) return;
      // Retrieve the keyboard key from the pressedKeys array if there.
      const keyExists: boolean = this.pressedKeys.some((key) => key.name === event.key);
      // Simply return if it is in the array already.
      if (keyExists) return;
      // Update Changed Flag To True If The Key Is Not In The Array.
      this.changed = true;
      // Handle Key Information
      // This does not move the current key's duration to the previous key's duration.
      this.handleKeyInformation(event.keyCode, event.key, event.charCode, event.code);
      // Set Current Key's Press Start Timestamp
      this.setDurationTimeStamp(this.currentKey.duration, 'pressStart', new Date());
      // Add Current Key To Pressed Keys Array
      this.addPressedKey({ ...this.currentKey });
    } else return;
  };

  /**
   * Sets the key press end timestamp for the released key.
   * @param key {keyboardKey} The key to set the press end timestamp for.
   * @param end {Date} The end time of the key press.
   * @returns {void}
   */
  private handleKeyPressEnd = (key: typeof this.releasedKey, end: Date): void => {
    // Set the key's press end timestamp.
    this.setDurationTimeStamp(key.duration, 'pressEnd', end);
  };

  /**
   * Converts the duration of the key press to a float value with one decimal place.
   * @param end {number} The end time of the key press.
   * @param start {number} The start time of the key press.
   * @returns {number} The duration of the key press in seconds with one decimal place.
   */
  private calculateKeyPressDuration = (end: number, start: number): number => {
    return (end - start) / 100;
  };

  /**
   * Sets the key press duration for the key given.
   * @param key {keyboardKey} The key to set the duration for.
   * @param duration {number} The duration of the key press to be set.
   * @returns {void}
   */
  private setKeyPressDuration = (key: keyboardKey, duration: number): void => {
    // Set the key's pressed duration.
    this.setDurationTimeStamp(key.duration, 'pressed', duration);
  };

  /**
   * Clears the pressed keys array.
   * @returns {void}
   */
  private clearPressedKeys = (): void => {
    this.pressedKeys.clear();
  };

  /**
   * Removes the pressed key from the pressed keys array.
   * @param key {keyboardKey} The key to be removed.
   * @param keyArray {keyboardKey[]} The array of pressed keys.
   * @returns {keyboardKey[]} The updated array of pressed keys.
   * @throws {Error} If the pressed keys array is empty.
   */
  private removePressedKey(key: keyboardKey, keyArray: keyboardKey[]) {
    // Removing Key From Key Array Through Filter Method.
    if (keyArray.length === 0) {
      throw new Error('The Pressed Keys Array Is Empty!');
    } else {
      return keyArray.filter((keyItem) => keyItem.name !== key.name);
    }
  }

  /**
   * Manages what happens when a key is released.
   * 1. First, it checks if the event is a keyup event.
   * 2. If it is a keyup event, it updates the changed flag to true.
   * 3. It then gets the key that was released.
   * 4. It stores the released key.
   * 5. If the pressed keys array only has one key, it handles the key press end.
   *    - Then it calculates the duration of the key press of the released key.
   *    - Next, it sets the duration of the key press of the released key.
   *    - Finally, it clears the pressed keys array.
   * 6. If the pressed keys array has more than one key, it handles the key press end.
   *    - Then it calculates the duration of the key press of the released key.
   *    - Next, it sets the duration of the key press of the released key.
   *    - Finally, it filters the released key from the pressed keys array.
   * @param event {KeyboardEvent} The keyboard event.
   * @returns {void}
   */
  private manageKeyUp = (event: KeyboardEvent) => {
    if (event.type === 'keyup') {
      this.changed = true;

      // Get The Key That Was Released
      const keyUp: keyboardKey = this.pressedKeys.find((key) => {
        return key.info === event.code;
      })!;

      // Store Released Key
      this.releasedKey = keyUp;

      // Clear The Array If The Pressed Keys Array Only Has One Key.
      if (this.pressedKeys.length === 1) {
        // Handle the key press end.
        this.handleKeyPressEnd(this.releasedKey, new Date());

        // Calculate the duration of the key press.
        const duration: number = this.calculateKeyPressDuration(
          this.releasedKey.duration.pressEnd?.getTime() ?? 0,
          this.releasedKey.duration.pressStart?.getTime() ?? 0,
        );

        // Set the duration of the key press.
        this.setKeyPressDuration(this.releasedKey, duration);

        this.clearPressedKeys();
      } else if (this.pressedKeys.length > 1) {
        // Manage the key press end.
        this.handleKeyPressEnd(this.releasedKey, new Date());

        // Calculate the duration of the key press.
        const duration: number = this.calculateKeyPressDuration(
          this.releasedKey.duration.pressEnd?.getTime() ?? 0,
          this.releasedKey.duration.pressStart?.getTime() ?? 0,
        );

        // Set the duration of the key press.
        this.setKeyPressDuration(this.releasedKey, duration);

        // If the previous key is the same as this newly released key, set the previous key's duration as well.
        if (this.previousKey.info === this.releasedKey.info) {
          this.setKeyPressDuration(this.previousKey, duration);
        }

        // Filter Released Key From Pressed Keys
        this.pressedKeys = [...this.removePressedKey(this.releasedKey, this.pressedKeys)];
      }
    } else return;
  };

  /**
   * Private method to get the current state of the keyboard.
   * @returns {keyboardState} The current state of the keyboard.
   */
  private getState(): keyboardState {
    return {
      changed: this.changed,
      previousKey: this.getPreviousKey(),
      currentKey: this.getCurrentKey(),
      releasedKey: this.getReleasedKey(),
      pressedKeys: this.getPressedKeys(),
    };
  }

  // PUBLIC METHODS
  public listen(): void {
    window.addEventListener('keydown', this.manageKeyDown);
    window.addEventListener('keyup', this.manageKeyUp);
  }

  public stopListening(): void {
    window.removeEventListener('keydown', this.manageKeyDown);
    window.removeEventListener('keyup', this.manageKeyUp);
  }

  /**
   * Returns the previous keyboard key.
   * @returns {keyboardKey} The previous keyboard key.
   */
  public getPreviousKey(): keyboardKey {
    return this.previousKey;
  }

  /**
   * Returns the current keyboard key.
   * @returns {keyboardKey} The current keyboard key.
   */
  public getCurrentKey(): keyboardKey {
    return this.currentKey;
  }

  /**
   * Returns the released keyboard key.
   * @returns {keyboardKey} The released keyboard key.
   */
  public getReleasedKey(): keyboardKey {
    return this.releasedKey;
  }

  /**
   * Returns the pressed keys array.
   * @returns {keyboardKey[]} The pressed keys array.
   */
  public getPressedKeys(): keyboardKey[] {
    return this.pressedKeys;
  }

  /**
   * Returns the current state of the keyboard.
   * @returns {keyboardState} The current state of the keyboard.
   */
  public getCurrentState(): keyboardState {
    return this.getState();
  }
}

// Export the keyboard as a default and a single instance of it.
export const keyboard: Keyboard = new Keyboard();
export default Keyboard;
