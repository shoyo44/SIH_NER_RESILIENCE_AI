/**
 * Generic runtime error reporter.
 * Logs errors to the console. Swap the implementation here to integrate
 * with Sentry, Datadog, or any other observability platform.
 */
export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);

  const stack = error instanceof Error ? error.stack : undefined;

  console.error("[ErrorReport]", message, { ...context, stack });
}
