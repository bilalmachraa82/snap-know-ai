import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";

// Initialize Sentry for error tracking and performance monitoring
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,

  // Enable Sentry only if DSN is configured (production environments)
  enabled: !!import.meta.env.VITE_SENTRY_DSN,

  // Set environment based on mode
  environment: import.meta.env.MODE,

  // Integrations for enhanced monitoring
  integrations: [
    // Browser tracing for performance monitoring
    Sentry.browserTracingIntegration({
      // Track route changes in React Router
      enableInp: true,
    }),

    // Session replay for debugging user sessions
    Sentry.replayIntegration({
      // Mask all text and user input for privacy
      maskAllText: true,
      maskAllInputs: true,
      // Block all media (images, videos) for privacy and performance
      blockAllMedia: true,
    }),

    // React-specific error boundary integration
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect: React.useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
  ],

  // Performance monitoring
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in prod, 100% in dev

  // Session replay sampling
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Privacy: Filter sensitive data before sending to Sentry
  beforeSend(event, hint) {
    // Filter out sensitive data from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
        // Mask sensitive data in breadcrumb messages
        if (breadcrumb.message) {
          breadcrumb.message = breadcrumb.message
            .replace(/password[=:]\s*\S+/gi, 'password=***')
            .replace(/token[=:]\s*\S+/gi, 'token=***')
            .replace(/auth[=:]\s*\S+/gi, 'auth=***')
            .replace(/key[=:]\s*\S+/gi, 'key=***')
            .replace(/email[=:]\s*\S+/gi, 'email=***');
        }

        // Mask sensitive data in breadcrumb data
        if (breadcrumb.data) {
          const sensitiveKeys = ['password', 'token', 'auth', 'key', 'email', 'apiKey', 'secret'];
          sensitiveKeys.forEach((key) => {
            if (breadcrumb.data && key in breadcrumb.data) {
              breadcrumb.data[key] = '***';
            }
          });
        }

        return breadcrumb;
      });
    }

    // Filter sensitive data from event contexts
    if (event.contexts) {
      // Remove any sensitive user data
      if (event.contexts.user) {
        const { email, username, ...safeUserData } = event.contexts.user as any;
        event.contexts.user = safeUserData;
      }
    }

    // Filter sensitive data from extra data
    if (event.extra) {
      const sensitiveKeys = ['password', 'token', 'auth', 'key', 'apiKey', 'secret', 'email'];
      sensitiveKeys.forEach((key) => {
        if (event.extra && key in event.extra) {
          event.extra[key] = '***';
        }
      });
    }

    // Filter sensitive data from request data
    if (event.request) {
      // Remove cookies and authentication headers
      if (event.request.cookies) {
        event.request.cookies = '***';
      }
      if (event.request.headers) {
        const headers = event.request.headers as Record<string, string>;
        if (headers.Authorization || headers.authorization) {
          headers.Authorization = '***';
          headers.authorization = '***';
        }
        if (headers.Cookie || headers.cookie) {
          headers.Cookie = '***';
          headers.cookie = '***';
        }
      }
    }

    return event;
  },

  // Ignore common errors that aren't actionable
  ignoreErrors: [
    // Browser extension errors
    'top.GLOBALS',
    'chrome-extension://',
    'moz-extension://',
    // Network errors
    'NetworkError',
    'Network request failed',
    // ResizeObserver errors (common and non-critical)
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
  ],

  // Deny URLs to ignore errors from third-party scripts
  denyUrls: [
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
  ],
});

// Import React Router hooks after Sentry init for integration
import React from "react";
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from "react-router-dom";

// Initialize PWA capabilities
import { initializePWA, promptPWAInstall } from "./registerSW";

// Wrap App with Sentry profiler for performance tracking
const AppWithProfiler = Sentry.withProfiler(App);

createRoot(document.getElementById("root")!).render(<AppWithProfiler />);

// Initialize PWA service worker and install prompt
if ('serviceWorker' in navigator) {
  initializePWA();
  promptPWAInstall();
}
