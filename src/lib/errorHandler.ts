import { NextResponse } from 'next/server';

export class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: true,
        message: error.message,
        code: error.code,
      },
      { status: error.status }
    );
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json(
      {
        error: true,
        message: 'Invalid request format',
        code: 'INVALID_REQUEST',
      },
      { status: 400 }
    );
  }

  // Default error response
  return NextResponse.json(
    {
      error: true,
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    },
    { status: 500 }
  );
}

// Specific error responses
export const ErrorResponses = {
  // 400 errors
  badRequest: (message = 'Bad request') =>
    NextResponse.json(
      { error: true, message, code: 'BAD_REQUEST' },
      { status: 400 }
    ),

  missingFields: (fields: string[]) =>
    NextResponse.json(
      {
        error: true,
        message: `Missing required fields: ${fields.join(', ')}`,
        code: 'MISSING_FIELDS',
        fields,
      },
      { status: 400 }
    ),

  invalidRequest: (reason = 'Invalid request') =>
    NextResponse.json(
      { error: true, message: reason, code: 'INVALID_REQUEST' },
      { status: 400 }
    ),

  // 401 errors
  unauthorized: (message = 'Unauthorized') =>
    NextResponse.json(
      { error: true, message, code: 'UNAUTHORIZED' },
      { status: 401 }
    ),

  invalidCredentials: () =>
    NextResponse.json(
      { error: true, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
      { status: 401 }
    ),

  // 403 errors
  forbidden: (message = 'Forbidden') =>
    NextResponse.json(
      { error: true, message, code: 'FORBIDDEN' },
      { status: 403 }
    ),

  subscriptionRequired: () =>
    NextResponse.json(
      {
        error: true,
        message: 'Active subscription required',
        code: 'SUBSCRIPTION_REQUIRED',
      },
      { status: 403 }
    ),

  limitExceeded: (limit: string, used: number, max: number) =>
    NextResponse.json(
      {
        error: true,
        message: `${limit} limit exceeded`,
        code: 'LIMIT_EXCEEDED',
        limit,
        used,
        max,
      },
      { status: 429 }
    ),

  // 404 errors
  notFound: (resource = 'Resource') =>
    NextResponse.json(
      { error: true, message: `${resource} not found`, code: 'NOT_FOUND' },
      { status: 404 }
    ),

  userNotFound: () =>
    NextResponse.json(
      { error: true, message: 'User not found', code: 'USER_NOT_FOUND' },
      { status: 404 }
    ),

  // 409 errors
  conflict: (message = 'Resource already exists') =>
    NextResponse.json(
      { error: true, message, code: 'CONFLICT' },
      { status: 409 }
    ),

  // 422 errors
  unprocessable: (message = 'Cannot process request') =>
    NextResponse.json(
      { error: true, message, code: 'UNPROCESSABLE_ENTITY' },
      { status: 422 }
    ),

  // 500 errors
  internalError: (message = 'Internal server error') =>
    NextResponse.json(
      { error: true, message, code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    ),
};
