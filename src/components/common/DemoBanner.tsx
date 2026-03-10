'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

interface DemoBannerProps {
  eventLimit?: number;
  guestLimit?: number;
  className?: string;
}

export default function DemoBanner({ eventLimit = 1, guestLimit = 50, className = '' }: DemoBannerProps) {
  const router = useRouter();
  const locale = useLocale();

  return (
    <div className={`bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-lg">🟡</span>
            <p className="text-sm font-medium text-amber-900">
              You are on the <strong>Free Plan</strong> — {eventLimit} Event · {guestLimit} Guests · Upgrade to unlock all features
            </p>
          </div>
          <button
            onClick={() => router.push(`/${locale}/pricing`)}
            className="inline-flex items-center px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Upgrade Now →
          </button>
        </div>
      </div>
    </div>
  );
}
