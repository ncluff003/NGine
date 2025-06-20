/**
 * Throttles methods being able to be called by comparing the most recent call time to the very next call. If the time between calls is equal to or greater than the passed delay time, the method will be called. Otherwise, it will just return without calling the method.
 * @param callback {Function} The method to be throttled.
 * @param delay {Number} The delay between calls of the method.
 * @returns {Unknown} The result of the throttled method.
 */
export const throttled = <T extends unknown[]>(callback: (...args: T) => unknown, delay: number) => {
  let lastCall = 0;
  return function (...args: T) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return callback(...args);
  };
};
