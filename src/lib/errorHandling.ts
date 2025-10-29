/**
 * Centralized error handling utilities
 * Provides consistent error logging and user feedback
 */

import { toast } from "sonner";

/**
 * Determines if the app is running in development mode
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV;
};

/**
 * Log error to console in development mode only
 * In production, this should be replaced with a proper error tracking service
 */
export const logError = (context: string, error: unknown, additionalData?: any): void => {
  if (isDevelopment()) {
    console.error(`[${context}]`, error);
    if (additionalData) {
      console.error(`[${context}] Additional data:`, additionalData);
    }
  } else {
    // In production, you could send this to an error tracking service
    // Example: Sentry.captureException(error, { tags: { context }, extra: additionalData });
    console.error(`[${context}]`, error);
  }
};

/**
 * Handle errors with user feedback and logging
 */
export const handleError = (
  context: string,
  error: unknown,
  userMessage?: string,
  showToast: boolean = true
): void => {
  // Log the error
  logError(context, error);

  // Show user-friendly message
  if (showToast) {
    const message = userMessage || getDefaultErrorMessage(error);
    toast.error(message);
  }
};

/**
 * Get a user-friendly error message from an error object
 */
export const getDefaultErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.includes("network") || error.message.includes("fetch")) {
      return "Erro de conexão. Verifica a tua internet.";
    }
    if (error.message.includes("auth") || error.message.includes("unauthorized")) {
      return "Erro de autenticação. Por favor, faz login novamente.";
    }
    if (error.message.includes("permission") || error.message.includes("forbidden")) {
      return "Não tens permissão para esta ação.";
    }

    // Return the error message in development, generic message in production
    return isDevelopment() ? error.message : "Ocorreu um erro. Por favor, tenta novamente.";
  }

  return "Ocorreu um erro inesperado. Por favor, tenta novamente.";
};

/**
 * Handle async operations with built-in error handling
 * Useful for wrapping API calls
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: string,
  userMessage?: string
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    handleError(context, error, userMessage);
    return null;
  }
};

/**
 * Validation error handler
 * Specifically for form validation errors
 */
export const handleValidationError = (
  fieldErrors: Record<string, string>,
  generalMessage: string = "Por favor, corrige os erros no formulário"
): void => {
  const errorCount = Object.keys(fieldErrors).length;

  if (errorCount > 0) {
    toast.error(`${generalMessage} (${errorCount} erro${errorCount > 1 ? 's' : ''})`);

    if (isDevelopment()) {
      console.error("Validation errors:", fieldErrors);
    }
  }
};

/**
 * Network error handler
 * Specifically for API/network-related errors
 */
export const handleNetworkError = (
  error: unknown,
  context: string = "Network request"
): void => {
  logError(context, error);

  if (error instanceof TypeError && error.message === "Failed to fetch") {
    toast.error("Sem conexão à internet. Verifica a tua rede.");
  } else {
    toast.error("Erro ao comunicar com o servidor. Tenta novamente.");
  }
};

/**
 * Success message helper
 * For consistency in success messages
 */
export const showSuccess = (message: string): void => {
  toast.success(message);
};

/**
 * Info message helper
 * For informational messages
 */
export const showInfo = (message: string): void => {
  toast.info(message);
};

/**
 * Warning message helper
 * For warning messages
 */
export const showWarning = (message: string): void => {
  toast.warning(message);
};

/**
 * Rate limit error handler
 * For API rate limiting errors
 */
export const handleRateLimitError = (retryAfter?: number): void => {
  const message = retryAfter
    ? `Demasiados pedidos. Aguarda ${retryAfter} segundos.`
    : "Demasiados pedidos. Por favor, aguarda um momento.";

  toast.error(message);
};

/**
 * Parse error from various formats
 * Handles different error object structures
 */
export const parseError = (error: unknown): { message: string; code?: string } => {
  if (error instanceof Error) {
    return { message: error.message, code: (error as any).code };
  }

  if (typeof error === "string") {
    return { message: error };
  }

  if (error && typeof error === "object") {
    const err = error as any;
    return {
      message: err.message || err.error || err.details || "Unknown error",
      code: err.code || err.status,
    };
  }

  return { message: "Unknown error occurred" };
};
