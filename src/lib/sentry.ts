/**
 * Sentry Utilities
 * Helper functions for error tracking, performance monitoring, and user feedback
 */

import * as Sentry from "@sentry/react";

/**
 * Set user context for Sentry error tracking
 * This helps identify which user experienced an error
 * Note: Email is excluded for privacy (as configured in beforeSend)
 */
export const setSentryUser = (user: {
  id: string;
  username?: string;
}) => {
  Sentry.setUser({
    id: user.id,
    username: user.username,
  });
};

/**
 * Clear user context when logging out
 */
export const clearSentryUser = () => {
  Sentry.setUser(null);
};

/**
 * Add a breadcrumb for user actions
 * Breadcrumbs help understand the sequence of events leading to an error
 */
export const addBreadcrumb = (
  message: string,
  category: string,
  level: "info" | "warning" | "error" | "debug" = "info",
  data?: Record<string, any>
) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
};

/**
 * Track a custom transaction for performance monitoring
 * Use this for critical operations like meal logging, AI analysis, etc.
 *
 * Example:
 * const transaction = startTransaction('meal-logging', 'meal.create');
 * try {
 *   // ... your code
 *   transaction.setStatus('ok');
 * } catch (error) {
 *   transaction.setStatus('internal_error');
 *   throw error;
 * } finally {
 *   transaction.finish();
 * }
 */
export const startTransaction = (name: string, op: string) => {
  return Sentry.startTransaction({
    name,
    op,
  });
};

/**
 * Track a span within a transaction
 * Use for tracking individual operations within a larger transaction
 *
 * Example:
 * await trackSpan('fetch-user-data', async () => {
 *   return await fetchUserData();
 * });
 */
export const trackSpan = async <T>(
  operation: string,
  callback: () => Promise<T>
): Promise<T> => {
  return await Sentry.startSpan(
    {
      op: operation,
      name: operation,
    },
    callback
  );
};

/**
 * Capture a custom exception
 * Use this for caught errors that you want to track in Sentry
 */
export const captureException = (
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    level?: Sentry.SeverityLevel;
  }
) => {
  Sentry.captureException(error, {
    level: context?.level || "error",
    tags: context?.tags,
    extra: context?.extra,
  });
};

/**
 * Capture a custom message
 * Use this for logging important events or warnings
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
  }
) => {
  Sentry.captureMessage(message, {
    level,
    tags: context?.tags,
    extra: context?.extra,
  });
};

/**
 * Set a tag for all subsequent error reports
 * Useful for tracking features, versions, or user segments
 */
export const setTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

/**
 * Set multiple tags at once
 */
export const setTags = (tags: Record<string, string>) => {
  Sentry.setTags(tags);
};

/**
 * Set context data for all subsequent error reports
 * Useful for adding custom data that helps with debugging
 */
export const setContext = (name: string, context: Record<string, any>) => {
  Sentry.setContext(name, context);
};

/**
 * Performance monitoring helper for API calls
 * Automatically tracks API performance and errors
 *
 * Example:
 * const data = await trackApiCall('fetch-meals', async () => {
 *   return await supabase.from('meals').select('*');
 * });
 */
export const trackApiCall = async <T>(
  apiName: string,
  apiCall: () => Promise<T>
): Promise<T> => {
  const span = Sentry.startInactiveSpan({
    op: "http.client",
    name: `API: ${apiName}`,
  });

  addBreadcrumb(`API call started: ${apiName}`, "api", "info");

  try {
    const result = await apiCall();
    span?.setStatus({ code: 1 }); // OK
    addBreadcrumb(`API call succeeded: ${apiName}`, "api", "info");
    return result;
  } catch (error) {
    span?.setStatus({ code: 2 }); // Error
    addBreadcrumb(`API call failed: ${apiName}`, "api", "error", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    span?.end();
  }
};

/**
 * Performance monitoring helper for AI operations
 * Tracks AI analysis performance and errors
 */
export const trackAIOperation = async <T>(
  operationName: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> => {
  const span = Sentry.startInactiveSpan({
    op: "ai.operation",
    name: `AI: ${operationName}`,
  });

  addBreadcrumb(`AI operation started: ${operationName}`, "ai", "info", metadata);

  try {
    const result = await operation();
    span?.setStatus({ code: 1 }); // OK
    addBreadcrumb(`AI operation succeeded: ${operationName}`, "ai", "info");
    return result;
  } catch (error) {
    span?.setStatus({ code: 2 }); // Error
    addBreadcrumb(`AI operation failed: ${operationName}`, "ai", "error", {
      error: error instanceof Error ? error.message : String(error),
      ...metadata,
    });

    // Capture the error with context
    captureException(error as Error, {
      tags: {
        operation: "ai",
        operationName,
      },
      extra: metadata,
    });

    throw error;
  } finally {
    span?.end();
  }
};

/**
 * Show Sentry's user feedback dialog
 * Allows users to provide additional context when they encounter an error
 */
export const showFeedbackDialog = () => {
  const eventId = Sentry.lastEventId();
  if (eventId) {
    Sentry.showReportDialog({
      eventId,
      lang: "pt",
      title: "Parece que estamos com problemas.",
      subtitle: "A nossa equipa foi notificada.",
      subtitle2: "Se quiseres ajudar, conta-nos o que aconteceu.",
      labelName: "Nome",
      labelEmail: "Email",
      labelComments: "O que aconteceu?",
      labelClose: "Fechar",
      labelSubmit: "Enviar",
      errorGeneric: "Ocorreu um erro ao enviar o teu feedback. Por favor tenta novamente.",
      errorFormEntry: "Alguns campos são inválidos. Por favor corrige os erros e tenta novamente.",
      successMessage: "O teu feedback foi enviado. Obrigado!",
    });
  }
};
