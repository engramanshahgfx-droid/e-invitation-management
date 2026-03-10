'use client'

import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useLocale } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

// helper for generating random reference codes and uuids in browser
function generateReferenceCode() {
  const arr = new Uint8Array(4)
  crypto.getRandomValues(arr)
  return (
    'BANK-' +
    Date.now() +
    '-' +
    Array.from(arr)
      .map((n) => n.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  )
}
function generateUUID() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}

export default function BankTransferPage() {
  const router = useRouter()
  const locale = useLocale()
  const searchParams = useSearchParams()
  const planId = searchParams.get('planId')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [plan, setPlan] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [uploading, setUploading] = useState(false)
  const [step, setStep] = useState<'info' | 'upload' | 'success'>('info')

  useEffect(() => {
    initializeCheckout()
  }, [planId])

  const initializeCheckout = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push(`/${locale}/auth/login`)
        return
      }

      setUser(currentUser)

      if (!planId) {
        router.push(`/${locale}/pricing`)
        return
      }

      // Fetch plan details
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single()

      if (planError) {
        setError(`Failed to load plan: ${planError.message}`)
        console.error('Plan error:', planError)
        return
      }

      if (!planData) {
        setError('Plan not found')
        return
      }

      setPlan(planData)

      // Create bank transfer request
      const response = await fetch('/api/payments/bank-transfer/create-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          userId: currentUser.id,
        }),
      })

      const data = await response.json()
      console.log('API Response:', data)

      if (!response.ok) {
        console.warn('Create-request API failed, falling back to client-side details', data)
        // still show the page with manual details but warn user
        const fallbackBank = {
          account_holder: process.env.NEXT_PUBLIC_BANK_HOLDER_NAME || process.env.BANK_HOLDER_NAME || 'Account Holder',
          bank_name: process.env.NEXT_PUBLIC_BANK_NAME || process.env.BANK_NAME || 'Bank Name',
          account_number: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || process.env.BANK_ACCOUNT_NUMBER || '',
          iban: process.env.NEXT_PUBLIC_BANK_IBAN || process.env.BANK_IBAN || '',
          branch_code: process.env.NEXT_PUBLIC_BANK_BRANCH_CODE || process.env.BANK_BRANCH_CODE || '',
          branch_name: process.env.NEXT_PUBLIC_BANK_BRANCH_NAME || process.env.BANK_BRANCH_NAME || '',
        }
        const fallback = {
          paymentId: generateUUID(),
          referenceCode: generateReferenceCode(),
          bankDetails: fallbackBank,
          amount: (planData as any).price_paypal,
          planName: (planData as any).name,
        }
        setPaymentData(fallback)
        setWarning('Could not reach server; use details below to send payment manually.')
        return
      }

      if (!data || !data.bankDetails) {
        setError('Invalid response from server - missing bank details')
        console.error('Invalid response:', data)
        return
      }

      setPaymentData(data)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      setError(`Error initializing checkout: ${errorMsg}`)
      console.error('Error initializing checkout:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!proofFile || !paymentData) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', proofFile)
      formData.append('paymentId', paymentData.paymentId)
      formData.append('planId', planId || '')
      formData.append('userId', user?.id || '')
      formData.append('referenceCode', paymentData.referenceCode || '')
      formData.append('amount', plan?.price_monthly?.toString() || '')
      if (phoneNumber) {
        formData.append('userPhone', phoneNumber)
      }

      const response = await fetch('/api/payments/bank-transfer/upload-proof', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (response.ok) {
        // Show success message
        setStep('success')
      } else {
        alert(data.error || 'Failed to upload proof')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload proof. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Loading bank transfer details...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-lg">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="mb-2 text-lg font-bold text-red-900">Error</h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => router.push(`/${locale}/pricing`)}
              className="mt-4 rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700"
            >
              Back to Pricing
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900">Bank Transfer Payment</h1>

        {warning && (
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-yellow-600">{warning}</p>
          </div>
        )}

        {plan && paymentData && (
          <div>
            {step === 'info' && (
              <div>
                <div className="mt-8 border-t border-gray-200 pt-8">
                  <h2 className="mb-4 text-xl font-bold text-gray-900">Order Summary</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{plan.name}</span>
                      <span className="font-bold text-gray-900">${plan.price_monthly}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-blue-600">${plan.price_monthly}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-gray-200 pt-8">
                  <h2 className="mb-4 text-xl font-bold text-gray-900">Bank Details</h2>
                  <div className="space-y-4 rounded-lg bg-blue-50 p-6">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Account Holder</p>
                      <p className="text-lg font-bold text-gray-900">
                        {paymentData.bankDetails?.account_holder || 'Loading...'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Bank Name</p>
                      <p className="text-lg font-bold text-gray-900">
                        {paymentData.bankDetails?.bank_name || 'Loading...'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Account Number</p>
                      <p className="font-mono text-lg font-bold text-gray-900">
                        {paymentData.bankDetails?.account_number || 'Loading...'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">IBAN</p>
                      <p className="font-mono text-lg font-bold text-gray-900">
                        {paymentData.bankDetails?.iban || 'Loading...'}
                      </p>
                    </div>
                    {paymentData.bankDetails?.branch_code && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Branch</p>
                        <p className="text-lg font-bold text-gray-900">
                          {paymentData.bankDetails.branch_name} ({paymentData.bankDetails.branch_code})
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-600">Reference Code</p>
                      <p className="font-mono text-lg font-bold text-green-600">{paymentData.referenceCode}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-lg bg-yellow-50 p-6">
                  <p className="text-sm text-gray-700">
                    📌 <strong>Important:</strong> Please include the{' '}
                    <strong className="text-green-600">{paymentData.referenceCode}</strong> as the reference/note when
                    making the transfer. This helps us match your payment to your account.
                  </p>
                </div>

                <button
                  onClick={() => setStep('upload')}
                  className="mt-8 w-full rounded-lg bg-blue-600 px-6 py-3 text-center font-bold text-white hover:bg-blue-700"
                >
                  I Have Already Sent the Payment
                </button>

                <button
                  onClick={() => router.back()}
                  className="mt-4 w-full rounded-lg border-2 border-gray-200 px-6 py-3 text-center font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            )}

            {step === 'upload' && (
              <div>
                <h2 className="mt-8 text-xl font-bold text-gray-900">Upload Payment Proof</h2>

                <form onSubmit={handleProofSubmit} className="mt-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">WhatsApp Number (for receipt)</label>
                    <input
                      type="tel"
                      placeholder="+966 55 1234 5678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      We will send payment receipt & approval updates to this WhatsApp
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Upload Bank Transfer Proof (Screenshot)
                    </label>
                    <div className="mt-3 block w-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-900"
                      />
                      {proofFile && <p className="mt-2 text-sm text-green-600">✓ {proofFile.name}</p>}
                    </div>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="text-sm text-gray-700">
                      📸 <strong>Please upload:</strong>
                      <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                        <li>Screenshot of successful bank transfer</li>
                        <li>Transaction receipt</li>
                        <li>Proof of payment (clear image)</li>
                      </ul>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={uploading || !proofFile}
                    className="w-full rounded-lg bg-green-600 px-6 py-3 text-center font-bold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Submit Payment Proof'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('info')}
                    className="w-full rounded-lg border-2 border-gray-200 px-6 py-3 text-center font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                </form>

                <div className="mt-6 rounded-lg bg-yellow-50 p-4">
                  <p className="text-sm text-gray-700">
                    ⏳ <strong>What happens next?</strong> Our admin team will review your payment proof within 24
                    hours. Your subscription will be activated immediately upon approval.
                  </p>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="mt-8 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 p-6">
                  <span className="text-4xl">✅</span>
                </div>

                <h2 className="mb-2 text-3xl font-bold text-gray-900">Payment Proof Submitted!</h2>

                <div className="mt-6 space-y-3 rounded-lg bg-blue-50 p-6 text-left">
                  <p className="text-lg font-semibold text-gray-900">Your payment confirmation is being processed</p>

                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-start gap-3">
                      <span className="mt-1 font-bold text-blue-600">1.</span>
                      <div>
                        <p className="font-medium">✓ Proof submitted successfully</p>
                        <p className="text-xs text-gray-600">Your bank transfer proof has been received</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="mt-1 font-bold text-yellow-600">2.</span>
                      <div>
                        <p className="font-medium">⏳ Awaiting admin verification</p>
                        <p className="text-xs text-gray-600">
                          Our team will review your payment (typically within 24 hours)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="mt-1 font-bold text-green-600">3.</span>
                      <div>
                        <p className="font-medium">🎉 Automatic account upgrade</p>
                        <p className="text-xs text-gray-600">Once approved, your plan will be instantly activated</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-lg bg-green-50 p-4 text-left">
                  <p className="text-sm text-green-700">
                    📱 <strong>WhatsApp Updates:</strong> We will send payment confirmation and approval updates to your
                    registered WhatsApp number
                  </p>
                </div>

                <button
                  onClick={() => router.push(`/${locale}/dashboard`)}
                  className="mt-8 w-full rounded-lg bg-blue-600 px-6 py-3 text-center font-bold text-white hover:bg-blue-700"
                >
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
