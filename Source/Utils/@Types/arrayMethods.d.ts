declare global {
  interface Array<T> {
    clear(): Array<T>;
    average(this: Array<number>): number;
  }
}

export {};
