'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!sessionId) {
          setLoading(false);
          return;
        }

        // Verify payment with backend
        const response = await fetch('/api/stripe/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        if (response.ok) {
          setVerified(true);
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Verifying your payment...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-gray-900">Payment Successful!</h2>
          <p className="mt-2 text-gray-600">
            Thank you for your purchase. Your subscription is now active.
          </p>
          {verified && (
            <p className="mt-4 text-sm text-green-600 font-medium">
              ✓ Payment verified and subscribed
            </p>
          )}
          <div className="mt-8 space-y-3">
            <button
              onClick={() => router.push(`/${locale}/event-management-dashboard`)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
            <Link
              href={`/${locale}`}
              className="block text-center text-gray-600 hover:text-gray-900"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
