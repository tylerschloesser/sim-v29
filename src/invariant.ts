/**
 * Custom invariant function that triggers the debugger before throwing.
 * Provides type narrowing like tiny-invariant but pauses execution for debugging.
 *
 * @param condition - The condition to check
 * @param message - Optional error message (string or function that returns string)
 * @throws Error if condition is falsy
 */
export function invariant(
  condition: unknown,
  message?: string | (() => string),
): asserts condition {
  if (!condition) {
    // Trigger debugger before throwing
    // eslint-disable-next-line no-debugger
    debugger;

    // Format error message
    const prefix = "Invariant failed";
    const errorMessage =
      typeof message === "function"
        ? `${prefix}: ${message()}`
        : message
          ? `${prefix}: ${message}`
          : prefix;

    // Show alert with error message
    window.alert(errorMessage);

    throw new Error(errorMessage);
  }
}
