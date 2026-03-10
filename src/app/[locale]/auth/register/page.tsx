'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { getCurrentUser, sendOTP, verifyOTPAndRegister } from '@/lib/auth';

type Step = 'form' | 'otp';

export default function RegisterPage() {
  const router = useRouter();
  const locale = useLocale();
  const [step, setStep] = useState<Step>('form');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const redirectIfAuthenticated = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          router.replace(`/${locale}/event-management-dashboard`);
        }
      } catch {
        // ignore unauthenticated state
      }
    };

    redirectIfAuthenticated();
  }, [locale, router]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendOTP(email);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyOTPAndRegister(email, otp, fullName, phone || undefined);
      router.replace(`/${locale}/event-management-dashboard`);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);
    try {
      await sendOTP(email);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IF</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">InviteFlow</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href={`/${locale}/auth/login`}
                className="text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 px-2 sm:px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                href={`/${locale}/auth/register`}
                className="text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-2 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pt-24">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
            {step === 'form' ? 'Create your free account' : 'Verify your email'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 'form'
              ? 'Start creating invitations instantly — no credit card required'
              : `We sent a 6-digit code to ${email}`}
          </p>
        </div>

        {step === 'form' ? (
          <form className="mt-8 space-y-6" onSubmit={handleSendOTP}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="+966551234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Sending code...' : 'Send Verification Code'}
            </button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link href={`/${locale}/auth/login`} className="text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs text-blue-700 text-center">
                🎉 Free account includes: 1 Event · 50 Guests · QR Codes · RSVP Tracking
              </p>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
                {error.includes('already exists') && (
                  <div className="mt-2">
                    <Link href={`/${locale}/auth/login`} className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm">
                      Sign in here →
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Change email
              </button>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-blue-600 hover:text-blue-500 disabled:opacity-50"
              >
                Resend code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
    </>
  );
}
