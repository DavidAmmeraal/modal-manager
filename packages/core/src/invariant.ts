/**
 * Little helper function to ensure conditions are met, or otherwise throws an error.
 *
 * @param condition
 * @param message
 * @returns
 */
export function invariant(
  condition: unknown,
  message?: string,
): asserts condition {
  if (condition) return;
  throw new Error(message);
}
