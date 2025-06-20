/**
 * Clears the array by setting the length to zero.
 * @returns {Array} The empty array.
 */
Array.prototype.clear = function (): Array<unknown> {
  this.length = 0;
  return this;
};

/**
 * Calculates the average of an array of numbers.
 * @returns {number} The average of the array of numbers.
 */
Array.prototype.average = function (this: Array<number>): number {
  return Math.floor(this.reduce((accumulator: number, current: number) => accumulator + current, 0) / this.length);
};

export {};
