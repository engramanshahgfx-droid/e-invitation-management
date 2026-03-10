import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '')

// Generate unique reference code for bank transfer
export async function POST(request: NextRequest) {
  try {
    const { planId, userId } = await request.json()

    // Get plan details
    const { data: plan } = await supabase.from('subscription_plans').select('*').eq('id', planId).single()

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 400 })
    }

    // Generate unique reference code and an id for the payment (won't persist yet)
    const referenceCode = `BANK-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
    const paymentId = crypto.randomUUID()

    // Get bank account info from database, fallback to environment variables if none found
    let bankAccount = null

    try {
      const { data } = await supabase.from('bank_accounts').select('*').eq('is_active', true).single()

      if (data) {
        bankAccount = data
      }
    } catch (err) {
      console.warn('Failed to fetch bank account from DB, using env vars', err)
    }

    if (!bankAccount) {
      bankAccount = {
        account_number: process.env.BANK_ACCOUNT_NUMBER || '0108089585850010',
        iban: process.env.BANK_IBAN || 'SA9230400108089585850010',
        account_holder: process.env.BANK_HOLDER_NAME || 'SAJJAD BAQER BIN IBRAHIM ALMURAYHIL',
        bank_name: process.env.BANK_NAME || 'Al Rajhi Bank',
        branch_code: process.env.BANK_BRANCH_CODE || '0309',
        branch_name: process.env.BANK_BRANCH_NAME || 'OMRAN',
        currency: 'SAR',
        is_active: true,
      }
    }

    if (!bankAccount) {
      return NextResponse.json({ error: 'Bank account not configured' }, { status: 500 })
    }

    // Return details without touching payments table; record will be created later when proof is uploaded
    return NextResponse.json({
      success: true,
      paymentId,
      referenceCode,
      bankDetails: bankAccount,
      amount: plan.price_paypal,
      planName: plan.name,
    })
  } catch (error) {
    console.error('Bank transfer creation error:', error)
    // try to extract useful message
    const msg = error instanceof Error ? error.message : JSON.stringify(error)
    return NextResponse.json({ error: `Failed to create bank transfer request: ${msg}` }, { status: 500 })
  }
}
