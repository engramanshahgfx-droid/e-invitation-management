'use client';

import Link from 'next/link';

interface ErrorComponentProps {
  title?: string;
  message?: string;
  description?: string;
  icon?: 'warning' | 'error' | 'info';
  actions?: Array<{
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: 'primary' | 'secondary';
  }>;
  showDetails?: boolean;
  errorDetails?: string;
}

export function ErrorComponent({
  title = 'Something went wrong',
  message = 'An unexpected error occurred',
  description,
  icon = 'error',
  actions,
  showDetails = process.env.NODE_ENV === 'development',
  errorDetails,
}: ErrorComponentProps) {
  const iconColors = {
    warning: {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
    },
    error: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      iconBg: 'bg-red-100',
    },
    info: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      iconBg: 'bg-blue-100',
    },
  };

  const colors = iconColors[icon];

  const iconPaths = {
    warning: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4v2m0 0v2m0-6v-2"
      />
    ),
    error: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    info: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  };

  return (
    <div className={`min-h-screen ${colors.bg} flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-md w-full">
        <div className="text-center">
          {/* Icon */}
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${colors.iconBg} mb-6`}>
            <svg
              className={`h-8 w-8 ${colors.icon}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {iconPaths[icon]}
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            {title}
          </h1>

          {/* Message */}
          <p className="text-lg text-gray-700 mb-2">
            {message}
          </p>

          {/* Description */}
          {description && (
            <p className="text-gray-600 mb-8">
              {description}
            </p>
          )}

          {/* Error Details */}
          {showDetails && errorDetails && (
            <div className="mb-8 bg-white rounded-lg p-4 text-left border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-2">Error Details:</p>
              <p className="text-sm font-mono text-gray-700 break-all">
                {errorDetails}
              </p>
            </div>
          )}

          {/* Actions */}
          {actions && actions.length > 0 && (
            <div className="space-y-3">
              {actions.map((action, index) => {
                const buttonClass = `w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  action.variant === 'secondary'
                    ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    : icon === 'warning'
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : icon === 'error'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`;

                if (action.href) {
                  return (
                    <Link
                      key={index}
                      href={action.href}
                      className={buttonClass}
                    >
                      {action.label}
                    </Link>
                  );
                }

                return (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={buttonClass}
                  >
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Default Actions if none provided */}
          {(!actions || actions.length === 0) && (
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  icon === 'warning'
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : icon === 'error'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Try Again
              </button>
              <Link
                href="/"
                className="block w-full bg-gray-200 text-gray-900 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center"
              >
                Go Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Specific Error Components
export function NotFoundError() {
  return (
    <ErrorComponent
      title="Page Not Found"
      message="404 - This page doesn't exist"
      icon="warning"
      actions={[
        { label: 'Go Home', href: '/', variant: 'primary' },
      ]}
    />
  );
}

export function UnauthorizedError() {
  return (
    <ErrorComponent
      title="Access Denied"
      message="You don't have permission to access this page"
      icon="error"
      actions={[
        { label: 'Login', href: '/auth/login', variant: 'primary' },
        { label: 'Go Home', href: '/', variant: 'secondary' },
      ]}
    />
  );
}

export function ServerError() {
  return (
    <ErrorComponent
      title="Server Error"
      message="500 - Something went wrong on our end"
      description="Our team has been notified. Please try again later."
      icon="error"
      actions={[
        { label: 'Refresh', onClick: () => window.location.reload(), variant: 'primary' },
        { label: 'Go Home', href: '/', variant: 'secondary' },
      ]}
    />
  );
}

export function MaintenanceError() {
  return (
    <ErrorComponent
      title="Under Maintenance"
      message="We're temporarily down for maintenance"
      description="We'll be back online soon. Thank you for your patience!"
      icon="info"
      actions={[
        { label: 'Go Home', href: '/', variant: 'primary' },
      ]}
    />
  );
}
