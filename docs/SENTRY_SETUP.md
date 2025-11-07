# Sentry Setup Guide

This guide will help you set up Sentry for error tracking and performance monitoring in your application.

## Table of Contents
- [What is Sentry?](#what-is-sentry)
- [Creating a Sentry Account](#creating-a-sentry-account)
- [Getting Your DSN](#getting-your-dsn)
- [Configuring Environment Variables](#configuring-environment-variables)
- [Testing Error Reporting](#testing-error-reporting)
- [Viewing Errors in Sentry](#viewing-errors-in-sentry)
- [Privacy Settings](#privacy-settings)
- [Advanced Configuration](#advanced-configuration)

## What is Sentry?

Sentry is an error tracking and performance monitoring platform that helps you:
- Track and diagnose errors in real-time
- Monitor application performance
- Replay user sessions to understand what went wrong
- Get actionable insights to fix issues faster

Our application is pre-configured with:
- **Error tracking** - Automatic error capture with stack traces
- **Performance monitoring** - Track slow API calls and operations
- **Session replay** - See what users experienced (with privacy protections)
- **Privacy filters** - Automatically remove sensitive data (passwords, tokens, emails)

## Creating a Sentry Account

1. Go to [sentry.io](https://sentry.io)
2. Click "Get Started" or "Sign Up"
3. Create your account (free tier available)
4. Choose "React" as your platform
5. Create a new project for your application

## Getting Your DSN

The DSN (Data Source Name) is the only required configuration to enable Sentry.

1. Log in to your Sentry account
2. Navigate to **Settings** > **Projects**
3. Select your project
4. Go to **Settings** > **Client Keys (DSN)**
5. Copy the DSN value (it looks like: `https://examplePublicKey@o0.ingest.sentry.io/0`)

## Configuring Environment Variables

### Required: DSN (for error tracking)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Sentry DSN to `.env`:
   ```env
   VITE_SENTRY_DSN="https://your-actual-dsn@sentry.io/project-id"
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

That's it! Sentry is now active and will start capturing errors.

### Optional: Source Maps (for production builds)

Source maps help you see the original code in error stack traces instead of minified code.

1. Create a Sentry Auth Token:
   - Go to **Settings** > **Account** > **API** > **Auth Tokens**
   - Click "Create New Token"
   - Give it a name (e.g., "Production Build")
   - Select scopes: `project:releases` and `project:write`
   - Copy the token

2. Get your Organization and Project slugs:
   - **Organization slug**: Found in Settings > General Settings
   - **Project slug**: Found in Settings > Projects > [Your Project] > General Settings

3. Add to `.env`:
   ```env
   SENTRY_AUTH_TOKEN="your-auth-token"
   SENTRY_ORG="your-org-slug"
   SENTRY_PROJECT="your-project-slug"
   ```

4. Build your app:
   ```bash
   npm run build
   ```

   Source maps will be automatically uploaded to Sentry and removed from the build.

## Testing Error Reporting

### Method 1: Trigger a Test Error (Development)

Add a test button to your code temporarily:

```tsx
import { captureException, captureMessage } from '@/lib/sentry';

// In your component:
<button onClick={() => {
  captureMessage('Test message from development', 'info');
}}>
  Test Sentry
</button>

<button onClick={() => {
  throw new Error('Test error for Sentry');
}}>
  Trigger Error
</button>
```

### Method 2: Use the Error Boundary

Create a component that throws an error:

```tsx
const BuggyComponent = () => {
  throw new Error('Intentional error for testing');
  return null;
};
```

### Method 3: Test API Tracking

Use the built-in helpers:

```tsx
import { trackApiCall, addBreadcrumb } from '@/lib/sentry';

// Track API performance
const data = await trackApiCall('test-api', async () => {
  const response = await fetch('/api/test');
  return response.json();
});

// Add breadcrumbs
addBreadcrumb('User clicked button', 'user-action', 'info', {
  buttonId: 'test-button'
});
```

## Viewing Errors in Sentry

1. Log in to [sentry.io](https://sentry.io)
2. Select your project
3. Navigate to **Issues** to see all errors
4. Click on any issue to see:
   - Stack trace
   - Breadcrumbs (user actions leading to the error)
   - Device/browser information
   - Session replay (if available)
   - User feedback (if provided)

### Dashboard Sections

- **Issues**: All errors and exceptions
- **Performance**: Transaction traces and slow operations
- **Replays**: Session recordings (only when errors occur)
- **Releases**: Track errors by version
- **Alerts**: Set up notifications for critical errors

## Privacy Settings

Our Sentry configuration includes strong privacy protections:

### Automatic Data Filtering

The following data is automatically removed before sending to Sentry:

- **Passwords**: Any field containing "password"
- **Tokens**: Authentication tokens and API keys
- **Emails**: User email addresses
- **Cookies**: All cookie data
- **Authorization headers**: Bearer tokens, etc.

### Session Replay Privacy

Session replay is configured with maximum privacy:
- **Text masking**: All text is masked by default
- **Input masking**: All form inputs are masked
- **Media blocking**: Images and videos are blocked
- **Low sample rate**: Only 10% of normal sessions, 100% of error sessions

### Customizing Privacy Settings

Edit `/home/user/snap-know-ai/src/main.tsx` to adjust privacy settings:

```typescript
Sentry.replayIntegration({
  maskAllText: true,        // Mask all text
  maskAllInputs: true,      // Mask all inputs
  blockAllMedia: true,      // Block images/videos
})
```

## Advanced Configuration

### Setting User Context

Track which user experienced an error:

```typescript
import { setSentryUser, clearSentryUser } from '@/lib/sentry';

// On login
setSentryUser({
  id: user.id,
  username: user.username,
  // Email is excluded for privacy
});

// On logout
clearSentryUser();
```

### Custom Tags and Context

Add custom data to error reports:

```typescript
import { setTag, setTags, setContext } from '@/lib/sentry';

// Single tag
setTag('feature', 'meal-logging');

// Multiple tags
setTags({
  subscription: 'premium',
  theme: 'dark',
});

// Custom context
setContext('meal', {
  mealId: '123',
  mealType: 'lunch',
});
```

### Performance Monitoring

Track custom operations:

```typescript
import { trackSpan, trackApiCall, trackAIOperation } from '@/lib/sentry';

// Track a span
await trackSpan('load-user-data', async () => {
  return await loadUserData();
});

// Track API calls
const meals = await trackApiCall('fetch-meals', async () => {
  return await supabase.from('meals').select('*');
});

// Track AI operations
const analysis = await trackAIOperation(
  'analyze-meal',
  async () => await analyzeMealWithAI(mealData),
  { mealId: '123' }
);
```

### Breadcrumbs

Add breadcrumbs to track user actions:

```typescript
import { addBreadcrumb } from '@/lib/sentry';

addBreadcrumb(
  'User submitted meal form',
  'user-action',
  'info',
  { mealType: 'lunch', items: 3 }
);
```

## Troubleshooting

### Errors Not Appearing in Sentry

1. **Check DSN is set**: Verify `VITE_SENTRY_DSN` in your `.env` file
2. **Restart dev server**: Changes to `.env` require a restart
3. **Check browser console**: Look for Sentry initialization messages
4. **Verify environment**: Sentry only sends data if DSN is configured

### Source Maps Not Working

1. **Check auth token**: Verify `SENTRY_AUTH_TOKEN` has correct scopes
2. **Check org/project slugs**: Verify `SENTRY_ORG` and `SENTRY_PROJECT`
3. **Build in production mode**: `npm run build` (not `npm run dev`)
4. **Check Sentry dashboard**: Settings > Source Maps

### Performance Impact

Sentry is configured to minimize performance impact:
- **Sample rate**: 10% of transactions in production
- **Lazy loading**: Sentry loads asynchronously
- **Efficient bundling**: ~50KB gzipped

To reduce further:
- Lower `tracesSampleRate` in `main.tsx`
- Lower `replaysSessionSampleRate`
- Disable replay integration entirely

## Support

- **Sentry Docs**: [docs.sentry.io](https://docs.sentry.io)
- **Sentry React Docs**: [docs.sentry.io/platforms/javascript/guides/react/](https://docs.sentry.io/platforms/javascript/guides/react/)
- **Sentry Support**: Available in your Sentry dashboard

## Summary

Sentry provides powerful error tracking and performance monitoring with:
- Easy setup (just add DSN)
- Strong privacy protections
- Detailed error context
- Performance insights
- User feedback collection

Your application is production-ready with Sentry configured!
