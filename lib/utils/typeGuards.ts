/**
 * Shared runtime type guards for the ClauseGuard application.
 *
 * Centralizing type-narrowing predicates prevents duplication and keeps
 * catch-block error handling clean and consistent across all modules.
 */

/**
 * Type guard that narrows an unknown error to a Firebase-compatible
 * error shape `{ code: string; message: string }`.
 *
 * Firebase Auth errors always include both `code` and `message` properties,
 * but since the TypeScript catch clause receives `unknown`, we must validate
 * at runtime before accessing these fields.
 *
 * @example
 * ```ts
 * } catch (err: unknown) {
 *   if (isFirebaseError(err)) {
 *     console.error(err.code, err.message);
 *   }
 * }
 * ```
 */
export function isFirebaseError(
  err: unknown
): err is { code: string; message: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    "message" in err &&
    typeof (err as Record<string, unknown>).code === "string" &&
    typeof (err as Record<string, unknown>).message === "string"
  );
}

/**
 * Extracts a human-readable message from an unknown thrown value.
 * Falls back to the provided `fallback` string if the value is not an Error.
 */
export function getErrorMessage(err: unknown, fallback = "An unexpected error occurred."): string {
  if (err instanceof Error) return err.message;
  if (isFirebaseError(err)) return err.message;
  return fallback;
}
