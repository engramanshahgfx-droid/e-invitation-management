'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { supabase } from '@/lib/supabase';
import UpgradeModal from '@/components/common/UpgradeModal';

interface SubscriptionGuardProps {
  userId: string;
  requiredFeatures?: string[];
  onUnauthorized?: () => void;
  children: React.ReactNode;
}

const FREE_RESTRICTED_FEATURES = ['whatsapp_sending', 'excel_export', 'advanced_reports', 'remove_branding', 'bulk_whatsapp'];

export function SubscriptionGuard({
  userId,
  requiredFeatures = [],
  onUnauthorized,
  children,
}: SubscriptionGuardProps) {
  const router = useRouter();
  const locale = useLocale();
  const [authorized, setAuthorized] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [blockedFeature, setBlockedFeature] = useState('');
  const [userPlan, setUserPlan] = useState<string>('basic');

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('users')
          .select('subscription_status, plan_type, subscription_expiry, account_type, demo_expiry')
          .eq('id', userId)
          .single();

        if (error) throw error;

        const accountType = (data as any).account_type || 'free';
        const isFree = accountType === 'free';
        const subscriptionStatus = (data as any).subscription_status;

        setUserPlan((data as any).plan_type);

        // Free user with restricted feature
        if (isFree) {
          const restricted = requiredFeatures.find(f => FREE_RESTRICTED_FEATURES.includes(f));
          if (restricted) {
            setBlockedFeature(restricted.replace(/_/g, ' '));
            setShowUpgradeModal(true);
            setAuthorized(false);
            return;
          }
          // Free user accessing allowed features
          setAuthorized(true);
          return;
        }

        // Paid user check
        const isActive =
          subscriptionStatus === 'active' &&
          (!(data as any).subscription_expiry || new Date((data as any).subscription_expiry) > new Date());

        if (!isActive) {
          setAuthorized(false);
          setShowUpgradeModal(true);
          setBlockedFeature('dashboard access');
          onUnauthorized?.();
        }
      } catch (error) {
        console.error('Error checking authorization:', error);
        setAuthorized(false);
      }
    };

    checkAuthorization();
  }, [userId, requiredFeatures, onUnauthorized]);

  if (showUpgradeModal) {
    return (
      <UpgradeModal
        feature={blockedFeature || 'This feature'}
        onClose={() => {
          setShowUpgradeModal(false);
          router.push(`/${locale}/event-management-dashboard`);
        }}
      />
    );
  }

  if (!authorized) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Required</h2>
          <p className="text-gray-600 mb-6">
            Your subscription has expired or is inactive. Please upgrade your subscription to access this feature.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/${locale}/pricing`)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Upgrade Subscription
            </button>
            <button
              onClick={() => router.push(`/${locale}/event-management-dashboard`)}
              className="w-full bg-gray-200 text-gray-900 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

interface LimitExceededProps {
  limit: string;
  current: number;
  max: number;
  feature: string;
  onUpgrade: () => void;
}

export function LimitExceededModal({
  limit,
  current,
  max,
  feature,
  onUpgrade,
}: LimitExceededProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Limit Reached</h2>
        <p className="text-gray-600 mb-4">
          You've reached your {feature} limit ({current}/{max}). Upgrade your plan to continue.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Current Limit:</strong> {max} {limit}
          </p>
        </div>
        <button
          onClick={onUpgrade}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Upgrade Plan
        </button>
      </div>
    </div>
  );
}
