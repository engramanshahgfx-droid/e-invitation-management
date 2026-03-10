'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { signOutUser } from '@/lib/auth';

export default function SignOutPage() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await signOutUser();
        // Redirect to login after successful sign out
        router.push(`/${locale}/auth/login`);
      } catch (error) {
        console.error('Sign out error:', error);
        router.push(`/${locale}`);
      }
    };

    handleSignOut();
  }, [router, locale]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-gray-600">Signing out...</div>
    </div>
  );
}
