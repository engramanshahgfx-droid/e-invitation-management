# Error Handling Guide

## Overview

Your application has comprehensive error handling with:
- **Global error boundary** for client-side errors
- **API error responses** with consistent format
- **500 page** for server errors  
- **404 page** for missing routes
- **Error component** for reusable UI
- **Error handler utility** for API routes

---

## Error Pages & Components

### 1. Global Error Boundary (`src/app/error.tsx`)

Catches **client-side errors** in your app. Shows:
- User-friendly error message
- Error details in development mode
- Try Again button
- Home button
- Automatic error logging

**Location:** Root level error boundary
**Usage:** Automatically handles all unhandled client errors

### 2. 404 Not Found (`src/app/not-found.tsx`)

Shows when a route doesn't exist. Features:
- 404 error code display
- Helpful suggestions
- Go Home button
- Go Back button
- Support contact link

**Location:** Automatically used for undefined routes
**Usage:** No action needed - automatic

### 3. 500 Server Error (`src/app/500.tsx`)

Shows when **server-side errors** occur. Features:
- 500 error code
- Status indicator
- Refresh button
- Home button
- Support info

**Location:** Server error fallback
**Usage:** Shown on uncaught server errors

### 4. Error Component (`src/components/ErrorComponent.tsx`)

**Reusable error UI component** for custom error pages.

**Props:**
```typescript
interface ErrorComponentProps {
  title?: string;           // Error title
  message?: string;         // Main message
  description?: string;     // Additional description
  icon?: 'warning' | 'error' | 'info';  // Icon type
  actions?: Array<{         // Custom buttons
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: 'primary' | 'secondary';
  }>;
  showDetails?: boolean;    // Show error details (dev only)
  errorDetails?: string;    // Error message to display
}
```

**Pre-built Components:**
```typescript
import {
  NotFoundError,
  UnauthorizedError,
  ServerError,
  MaintenanceError,
} from '@/components/ErrorComponent';
```

**Usage Example:**
```tsx
import { ErrorComponent } from '@/components/ErrorComponent';

export default function CustomError() {
  return (
    <ErrorComponent
      title="Payment Failed"
      message="Your payment could not be processed"
      icon="error"
      actions={[
        { label: 'Retry Payment', href: '/pricing' },
        { label: 'Contact Support', onClick: () => {} },
      ]}
    />
  );
}
```

---

## API Error Handling

### Error Handler Utility (`src/lib/errorHandler.ts`)

Use in your API routes for consistent error responses.

**Usage:**
```typescript
import { ErrorResponses, handleAPIError } from '@/lib/errorHandler';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, amount } = await request.json();

    // Validate
    if (!userId || !amount) {
      return ErrorResponses.missingFields(['userId', 'amount']);
    }

    if (amount <= 0) {
      return ErrorResponses.invalidRequest('Amount must be greater than 0');
    }

    // Check subscription
    if (!hasActiveSubscription(userId)) {
      return ErrorResponses.subscriptionRequired();
    }

    // Check limits
    if (messageSent >= limit) {
      return ErrorResponses.limitExceeded('WhatsApp messages', messageSent, limit);
    }

    // Your logic here...
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAPIError(error);
  }
}
```

### Available Error Responses

**400 - Bad Request**
```typescript
ErrorResponses.badRequest('Custom message')
ErrorResponses.missingFields(['field1', 'field2'])
ErrorResponses.invalidRequest('Custom reason')
```

**401 - Unauthorized**
```typescript
ErrorResponses.unauthorized('Custom message')
ErrorResponses.invalidCredentials()
```

**403 - Forbidden**
```typescript
ErrorResponses.forbidden('Custom message')
ErrorResponses.subscriptionRequired()
```

**429 - Rate Limit/Limit Exceeded**
```typescript
ErrorResponses.limitExceeded('WhatsApp messages', 1003, 1000)
// Returns: { used: 1003, max: 1000, remaining: -3 }
```

**404 - Not Found**
```typescript
ErrorResponses.notFound('Event')
ErrorResponses.userNotFound()
```

**409 - Conflict**
```typescript
ErrorResponses.conflict('Email already registered')
```

**422 - Unprocessable Entity**
```typescript
ErrorResponses.unprocessable('Invalid payment method')
```

**500 - Server Error**
```typescript
ErrorResponses.internalError('Custom error message')
```

---

## Error Response Format

All API errors follow this format:

```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  // Additional fields depending on error type
}
```

**Example - Missing Fields:**
```json
{
  "error": true,
  "message": "Missing required fields: userId, amount",
  "code": "MISSING_FIELDS",
  "fields": ["userId", "amount"]
}
```

**Example - Limit Exceeded:**
```json
{
  "error": true,
  "message": "WhatsApp messages limit exceeded",
  "code": "LIMIT_EXCEEDED",
  "limit": "WhatsApp messages",
  "used": 1003,
  "max": 1000
}
```

---

## Error Handling Best Practices

### 1. Always Validate Input
```typescript
if (!userId || typeof userId !== 'string') {
  return ErrorResponses.missingFields(['userId']);
}
```

### 2. Check Subscription Status
```typescript
const subscription = await checkSubscription(userId);
if (!subscription.isActive) {
  return ErrorResponses.subscriptionRequired();
}
```

### 3. Check Plan Limits
```typescript
if (messageCount >= planLimit) {
  return ErrorResponses.limitExceeded(
    'WhatsApp messages',
    messageCount,
    planLimit
  );
}
```

### 4. Use Try-Catch for Database Operations
```typescript
try {
  const result = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!result.data) {
    return ErrorResponses.userNotFound();
  }
} catch (error) {
  return handleAPIError(error);
}
```

### 5. Log Errors for Debugging
```typescript
try {
  // Your code
} catch (error) {
  console.error('Operation failed:', error);
  return handleAPIError(error);
}
```

---

## Error Codes

| Code | HTTP | Purpose |
|------|------|---------|
| `BAD_REQUEST` | 400 | Invalid request format |
| `MISSING_FIELDS` | 400 | Required fields missing |
| `INVALID_REQUEST` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `INVALID_CREDENTIALS` | 401 | Wrong credentials |
| `FORBIDDEN` | 403 | Access denied |
| `SUBSCRIPTION_REQUIRED` | 403 | Subscription needed |
| `LIMIT_EXCEEDED` | 429 | Quota exceeded |
| `NOT_FOUND` | 404 | Resource not found |
| `USER_NOT_FOUND` | 404 | User doesn't exist |
| `CONFLICT` | 409 | Resource already exists |
| `UNPROCESSABLE_ENTITY` | 422 | Can't process request |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

---

## Client-Side Error Handling

### Handling API Errors
```typescript
try {
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    if (result.code === 'SUBSCRIPTION_REQUIRED') {
      // Redirect to pricing
      router.push('/pricing');
    } else if (result.code === 'LIMIT_EXCEEDED') {
      // Show upgrade modal
      setShowUpgradeModal(true);
    } else {
      // Show generic error
      setError(result.message);
    }
    return;
  }

  // Success
  setData(result);
} catch (error) {
  setError('Network error. Please try again.');
}
```

### Using SubscriptionGuard Component
```tsx
import { SubscriptionGuard } from '@/components/SubscriptionGuard';

export default function ProtectedFeature() {
  return (
    <SubscriptionGuard userId={userId}>
      <div>Your protected content here</div>
    </SubscriptionGuard>
  );
}
```

---

## Testing Errors

### Test Error Page
Visit: `http://localhost:3000/nonexistent-route`
Expected: 404 page

### Test Error Boundary
```typescript
// In a component
throw new Error('Test error');
```
Expected: Global error boundary shows

### Test API Error
```bash
curl -X POST http://localhost:3000/api/endpoint
# Should return 400 with missing fields error
```

---

## Monitoring & Logging

### Set Up Error Monitoring (Recommended)

**Sentry Integration:**
```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

**Console Logging:**
All errors are logged to console in development mode.

---

## Common Error Scenarios

### Authentication Errors
```typescript
// User not authenticated
return ErrorResponses.unauthorized('Please log in first');

// Invalid token
return ErrorResponses.unauthorized('Session expired. Please log in again');
```

### Subscription Errors
```typescript
// No active subscription
return ErrorResponses.subscriptionRequired();

// Plan limit exceeded
return ErrorResponses.limitExceeded('Events', eventCount, planLimit);
```

### Database Errors
```typescript
if (error?.code === '23505') {
  // Unique constraint violation
  return ErrorResponses.conflict('This email is already registered');
}
```

### Validation Errors
```typescript
if (!email.includes('@')) {
  return ErrorResponses.invalidRequest('Invalid email format');
}
```

---

## Files Created/Updated

✅ `src/app/error.tsx` - Global error boundary
✅ `src/app/500.tsx` - Server error page
✅ `src/app/not-found.tsx` - 404 page
✅ `src/components/ErrorComponent.tsx` - Reusable error UI
✅ `src/lib/errorHandler.ts` - API error utilities

---

## Summary

Your error handling system provides:
- ✅ Consistent error responses across API
- ✅ User-friendly error pages
- ✅ Development-mode error details
- ✅ Reusable error components
- ✅ Best practices built-in
- ✅ Easy integration

**All errors are handled gracefully and provide clear guidance to users!**
