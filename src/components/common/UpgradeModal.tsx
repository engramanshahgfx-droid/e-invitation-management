'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

interface UpgradeModalProps {
  feature: string;
  onClose: () => void;
}

export default function UpgradeModal({ feature, onClose }: UpgradeModalProps) {
  const router = useRouter();
  const locale = useLocale();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Upgrade Your Plan
          </h2>
          <p className="text-gray-600 mb-6">
            <strong>{feature}</strong> is not available in Demo Mode. Upgrade your plan to unlock this feature and more.
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => router.push(`/${locale}/pricing`)}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View Plans & Upgrade
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
