import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-6">
            <svg
              className="h-8 w-8 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Error Code */}
          <h1 className="text-5xl font-extrabold text-purple-600 mb-2">
            404
          </h1>
          <p className="text-2xl font-bold text-gray-900 mb-2">
            Page Not Found
          </p>
          <p className="text-gray-700 mb-8">
            We couldn't find the page you're looking for. It might have been moved or deleted.
          </p>

          {/* Helpful Message */}
          <div className="mb-8 bg-white rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-gray-600">
              <strong>Did you mean to:</strong>
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li>• Check the URL spelling</li>
              <li>• Return to home page</li>
              <li>• Use the search feature</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors text-center"
            >
              Go to Home
            </Link>
            <Link
              href="/"
              className="w-full bg-gray-200 text-gray-900 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center block"
            >
              Go Back
            </Link>
          </div>

          {/* Additional Help */}
          <p className="mt-8 text-sm text-gray-600">
            Still need help?{' '}
            <a
              href="mailto:support@example.com"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}