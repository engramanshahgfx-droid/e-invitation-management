import Link from 'next/link';

export const metadata = {
  title: 'Server Error',
  description: 'An internal server error occurred',
};

export default function ServerErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-6">
            <svg
              className="h-8 w-8 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 2h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Error Code & Message */}
          <h1 className="text-5xl font-extrabold text-orange-600 mb-2">
            500
          </h1>
          <p className="text-2xl font-bold text-gray-900 mb-2">
            Internal Server Error
          </p>
          <p className="text-gray-700 mb-8">
            Something went wrong on our end. Our team has been notified and is working to fix it.
          </p>

          {/* Status Indicator */}
          <div className="mb-8 bg-white rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" />
              <p className="text-sm text-gray-600">We're investigating this issue</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Refresh Page
            </button>
            <Link
              href="/"
              className="block w-full bg-gray-200 text-gray-900 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center"
            >
              Go to Home
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-8 space-y-2 text-sm text-gray-600">
            <p>If the problem persists, please:</p>
            <ul className="space-y-1">
              <li>• Clear your browser cache</li>
              <li>• Try again in a few minutes</li>
              <li>• Contact support@example.com</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
