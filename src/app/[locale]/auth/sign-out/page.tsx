'use client'

import { signOutUser } from '@/lib/auth'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SignOutPage() {
  const router = useRouter()
  const locale = useLocale()

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await signOutUser()
        // Redirect to login after successful sign out
        router.push(`/${locale}/auth/login`)
      } catch (error) {
        console.error('Sign out error:', error)
        router.push(`/${locale}`)
      }
    }

    handleSignOut()
  }, [router, locale])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-gray-600">Signing out...</div>
    </div>
  )
}
