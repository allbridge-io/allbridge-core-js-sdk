export function ensure<T>(argument: T | undefined | null): T {
  if (argument === undefined || argument === null) {
    throw new TypeError("This value was promised to be there.");
  }

  return argument;
}
