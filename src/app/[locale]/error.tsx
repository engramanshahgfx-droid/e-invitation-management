'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service (e.g., Sentry)
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Oops!
          </h1>
          <p className="text-xl text-gray-700 mb-2">
            Something went wrong
          </p>
          <p className="text-gray-600 mb-8">
            We're sorry for the inconvenience. Please try again or contact support if the problem persists.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-8 bg-white rounded-lg p-4 text-left border border-red-200">
              <p className="text-sm font-mono text-red-600 break-all">
                {error.message || 'An unknown error occurred'}
              </p>
              {error.digest && (
                <p className="text-xs text-gray-500 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => reset()}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="block w-full bg-gray-200 text-gray-900 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center"
            >
              Go to Home
            </Link>
          </div>

          {/* Support Link */}
          <p className="mt-8 text-sm text-gray-600">
            Need help?{' '}
            <a
              href="mailto:support@example.com"
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
