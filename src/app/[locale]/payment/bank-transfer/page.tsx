'use client'

import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useLocale } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

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
  const isArabic = locale === 'ar'
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

  const content = {
    backPricing: isArabic ? 'العودة إلى الأسعار' : 'Back to Pricing',
    title: isArabic ? 'الدفع بالتحويل البنكي' : 'Bank Transfer Payment',
    warning: isArabic
      ? 'تعذر الوصول إلى الخادم، استخدم التفاصيل أدناه لإرسال الدفع يدويًا.'
      : 'Could not reach server; use details below to send payment manually.',
    loading: isArabic ? 'جارٍ تحميل تفاصيل التحويل البنكي...' : 'Loading bank transfer details...',
    errorTitle: isArabic ? 'خطأ' : 'Error',
    orderSummary: isArabic ? 'ملخص الطلب' : 'Order Summary',
    total: isArabic ? 'الإجمالي:' : 'Total:',
    bankDetails: isArabic ? 'تفاصيل الحساب البنكي' : 'Bank Details',
    accountHolder: isArabic ? 'اسم صاحب الحساب' : 'Account Holder',
    bankName: isArabic ? 'اسم البنك' : 'Bank Name',
    accountNumber: isArabic ? 'رقم الحساب' : 'Account Number',
    iban: 'IBAN',
    branch: isArabic ? 'الفرع' : 'Branch',
    reference: isArabic ? 'رمز المرجع' : 'Reference Code',
    loadingValue: isArabic ? 'جارٍ التحميل...' : 'Loading...',
    importantTitle: isArabic ? 'مهم:' : 'Important:',
    importantPrefix: isArabic ? 'يرجى كتابة' : 'Please include the',
    importantSuffix: isArabic
      ? 'كرمز مرجعي أو ملاحظة عند التحويل حتى نتمكن من مطابقة الدفعة مع حسابك.'
      : 'as the reference/note when making the transfer. This helps us match your payment to your account.',
    sentPayment: isArabic ? 'لقد قمت بالفعل بإرسال الدفعة' : 'I Have Already Sent the Payment',
    cancel: isArabic ? 'إلغاء' : 'Cancel',
    uploadTitle: isArabic ? 'رفع إثبات الدفع' : 'Upload Payment Proof',
    whatsapp: isArabic ? 'رقم واتساب' : 'WhatsApp Number (for receipt)',
    whatsappHint: isArabic
      ? 'سنرسل لك إيصال الدفع وتحديثات الموافقة عبر واتساب'
      : 'We will send payment receipt & approval updates to this WhatsApp',
    uploadProof: isArabic ? 'رفع إثبات التحويل البنكي (صورة)' : 'Upload Bank Transfer Proof (Screenshot)',
    pleaseUpload: isArabic ? 'يرجى رفع:' : 'Please upload:',
    uploadItems: isArabic
      ? ['صورة لعملية التحويل الناجحة', 'إيصال العملية', 'إثبات دفع واضح']
      : ['Screenshot of successful bank transfer', 'Transaction receipt', 'Proof of payment (clear image)'],
    uploading: isArabic ? 'جارٍ الرفع...' : 'Uploading...',
    submitProof: isArabic ? 'إرسال إثبات الدفع' : 'Submit Payment Proof',
    back: isArabic ? 'رجوع' : 'Back',
    nextTitle: isArabic ? 'ماذا يحدث بعد ذلك؟' : 'What happens next?',
    nextText: isArabic
      ? 'سيقوم فريق الإدارة بمراجعة إثبات الدفع خلال 24 ساعة، وسيتم تفعيل الاشتراك فور الموافقة.'
      : 'Our admin team will review your payment proof within 24 hours. Your subscription will be activated immediately upon approval.',
    successTitle: isArabic ? 'تم إرسال إثبات الدفع!' : 'Payment Proof Submitted!',
    successCardTitle: isArabic ? 'جارٍ معالجة تأكيد الدفع الخاص بك' : 'Your payment confirmation is being processed',
    successSteps: isArabic
      ? [
          ['✓ تم إرسال الإثبات بنجاح', 'تم استلام إثبات التحويل البنكي الخاص بك'],
          ['⏳ بانتظار تحقق الإدارة', 'سيقوم فريقنا بمراجعة الدفعة عادة خلال 24 ساعة'],
          ['🎉 ترقية الحساب تلقائيًا', 'بمجرد الموافقة سيتم تفعيل خطتك مباشرة'],
        ]
      : [
          ['✓ Proof submitted successfully', 'Your bank transfer proof has been received'],
          ['⏳ Awaiting admin verification', 'Our team will review your payment (typically within 24 hours)'],
          ['🎉 Automatic account upgrade', 'Once approved, your plan will be instantly activated'],
        ],
    whatsappUpdatesTitle: isArabic ? 'تحديثات واتساب:' : 'WhatsApp Updates:',
    whatsappUpdates: isArabic
      ? 'سنرسل لك تأكيد الدفع وتحديثات الموافقة إلى رقم واتساب المسجل'
      : 'We will send payment confirmation and approval updates to your registered WhatsApp number',
    dashboard: isArabic ? 'الذهاب إلى لوحة التحكم' : 'Go to Dashboard',
    uploadFailed: isArabic ? 'فشل رفع الإثبات' : 'Failed to upload proof',
    uploadTryAgain: isArabic ? 'فشل رفع الإثبات. حاول مرة أخرى.' : 'Failed to upload proof. Please try again.',
  }

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
        setWarning(content.warning)
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
        setStep('success')
      } else {
        alert(data.error || content.uploadFailed)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert(content.uploadTryAgain)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">{content.loading}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-lg">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="mb-2 text-lg font-bold text-red-900">{content.errorTitle}</h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => router.push(`/${locale}/pricing`)}
              className="mt-4 rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700"
            >
              {content.backPricing}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900">{content.title}</h1>

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
                  <h2 className="mb-4 text-xl font-bold text-gray-900">{content.orderSummary}</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{plan.name}</span>
                      <span className="font-bold text-gray-900">${plan.price_monthly}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>{content.total}</span>
                        <span className="text-blue-600">${plan.price_monthly}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-gray-200 pt-8">
                  <h2 className="mb-4 text-xl font-bold text-gray-900">{content.bankDetails}</h2>
                  <div className="space-y-4 rounded-lg bg-blue-50 p-6">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{content.accountHolder}</p>
                      <p className="text-lg font-bold text-gray-900">
                        {paymentData.bankDetails?.account_holder || content.loadingValue}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{content.bankName}</p>
                      <p className="text-lg font-bold text-gray-900">
                        {paymentData.bankDetails?.bank_name || content.loadingValue}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{content.accountNumber}</p>
                      <p className="font-mono text-lg font-bold text-gray-900">
                        {paymentData.bankDetails?.account_number || content.loadingValue}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{content.iban}</p>
                      <p className="font-mono text-lg font-bold text-gray-900">
                        {paymentData.bankDetails?.iban || content.loadingValue}
                      </p>
                    </div>
                    {paymentData.bankDetails?.branch_code && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">{content.branch}</p>
                        <p className="text-lg font-bold text-gray-900">
                          {paymentData.bankDetails.branch_name} ({paymentData.bankDetails.branch_code})
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-600">{content.reference}</p>
                      <p className="font-mono text-lg font-bold text-green-600">{paymentData.referenceCode}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-lg bg-yellow-50 p-6">
                  <p className="text-sm text-gray-700">
                    📌 <strong>{content.importantTitle}</strong> {content.importantPrefix}{' '}
                    <strong className="text-green-600">{paymentData.referenceCode}</strong> {content.importantSuffix}
                  </p>
                </div>

                <button
                  onClick={() => setStep('upload')}
                  className="mt-8 w-full rounded-lg bg-blue-600 px-6 py-3 text-center font-bold text-white hover:bg-blue-700"
                >
                  {content.sentPayment}
                </button>

                <button
                  onClick={() => router.back()}
                  className="mt-4 w-full rounded-lg border-2 border-gray-200 px-6 py-3 text-center font-bold text-gray-700 hover:bg-gray-50"
                >
                  {content.cancel}
                </button>
              </div>
            )}

            {step === 'upload' && (
              <div>
                <h2 className="mt-8 text-xl font-bold text-gray-900">{content.uploadTitle}</h2>

                <form onSubmit={handleProofSubmit} className="mt-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{content.whatsapp}</label>
                    <input
                      type="tel"
                      placeholder="+966 55 1234 5678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
                    />
                    <p className="mt-1 text-xs text-gray-500">{content.whatsappHint}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">{content.uploadProof}</label>
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
                    <div className="text-sm text-gray-700">
                      <p>
                        📸 <strong>{content.pleaseUpload}</strong>
                      </p>
                      <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                        {content.uploadItems.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={uploading || !proofFile}
                    className="w-full rounded-lg bg-green-600 px-6 py-3 text-center font-bold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {uploading ? content.uploading : content.submitProof}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('info')}
                    className="w-full rounded-lg border-2 border-gray-200 px-6 py-3 text-center font-bold text-gray-700 hover:bg-gray-50"
                  >
                    {content.back}
                  </button>
                </form>

                <div className="mt-6 rounded-lg bg-yellow-50 p-4">
                  <p className="text-sm text-gray-700">
                    ⏳ <strong>{content.nextTitle}</strong> {content.nextText}
                  </p>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="mt-8 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 p-6">
                  <span className="text-4xl">✅</span>
                </div>

                <h2 className="mb-2 text-3xl font-bold text-gray-900">{content.successTitle}</h2>

                <div className="mt-6 space-y-3 rounded-lg bg-blue-50 p-6 text-left">
                  <p className="text-lg font-semibold text-gray-900">{content.successCardTitle}</p>

                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-start gap-3">
                      <span className="mt-1 font-bold text-blue-600">1.</span>
                      <div>
                        <p className="font-medium">{content.successSteps[0][0]}</p>
                        <p className="text-xs text-gray-600">{content.successSteps[0][1]}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="mt-1 font-bold text-yellow-600">2.</span>
                      <div>
                        <p className="font-medium">{content.successSteps[1][0]}</p>
                        <p className="text-xs text-gray-600">{content.successSteps[1][1]}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="mt-1 font-bold text-green-600">3.</span>
                      <div>
                        <p className="font-medium">{content.successSteps[2][0]}</p>
                        <p className="text-xs text-gray-600">{content.successSteps[2][1]}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-lg bg-green-50 p-4 text-left">
                  <p className="text-sm text-green-700">
                    📱 <strong>{content.whatsappUpdatesTitle}</strong> {content.whatsappUpdates}
                  </p>
                </div>

                <button
                  onClick={() => router.push(`/${locale}/event-management-dashboard`)}
                  className="mt-8 w-full rounded-lg bg-blue-600 px-6 py-3 text-center font-bold text-white hover:bg-blue-700"
                >
                  {content.dashboard}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
