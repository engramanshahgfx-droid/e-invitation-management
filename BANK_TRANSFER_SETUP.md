# Bank Transfer Payment Setup Instructions

## Step 1: Run Database Migration

You need to update your Supabase database to add support for bank transfer payments.

### Option A: Using Supabase CLI (Recommended)

```bash
# Make sure you have Supabase CLI installed
npm install -g supabase

# Link to your project
supabase link

# Run the migration
supabase migration up
```

### Option B: Manual SQL in Supabase Dashboard

1. Go to https://app.supabase.com
2. Select your project
3. Go to SQL Editor
4. Copy and paste the migration script from `supabase/migrations/add_bank_transfer_fields.sql`
5. Click "Run"

The migration will add these columns to the `payments` table:
- `reference_code` - Unique reference code for the payment
- `proof_image_url` - URL to the uploaded proof image

## Step 2: Create Storage Bucket

1. Go to https://app.supabase.com
2. Select your project
3. Go to Storage → Buckets
4. Click "New Bucket"
5. Name: `payment-proofs`
6. Visibility: Public (so proofs can be viewed by admins)
7. Click "Create Bucket"

## Step 3: Configure RLS Policy for Storage Bucket (Optional but Recommended)

For security, you can restrict who can upload:

1. Click on the `payment-proofs` bucket
2. Go to "Policies"
3. Click "New policy"
4. Choose "For Authenticated users can upload their files"
5. Save

## Step 4: Verify Environment Variables

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Bank account details
BANK_HOLDER_NAME=Your Bank Account Holder
BANK_ACCOUNT_NUMBER=Your Account Number
BANK_IBAN=Your IBAN
BANK_BRANCH_NAME=Your Branch
BANK_BRANCH_CODE=Your Code

# WhatsApp notifications
TWILIO_ACCOUNT_SID=your_sid
TWILIO_API_KEY_SECRET=your_key
TWILIO_PHONE_NUMBER=whatsapp:+1234567890
BANK_RECEIPT_WHATSAPP=whatsapp:+9665XXXXXXX
```

## Step 5: Test the Payment Flow

1. Register a new user
2. Go to Pricing page
3. Click "Pay with Bank Transfer"
4. Fill in WhatsApp number
5. Upload a test image
6. You should see "Payment Proof Submitted!" success screen
7. Check your admin dashboard for the pending bank transfer

## Troubleshooting

### "Failed to upload proof" error
- Check if `payment-proofs` bucket exists in Supabase Storage
- Check if the service role key has permission to upload to storage
- Check browser console for detailed error messages

### "User not found" error
- Make sure you're logged in before making payment
- Check if your user record exists in `public.users` table

### WhatsApp messages not sending
- Verify TWILIO credentials in environment variables
- Check if Twilio WhatsApp is properly set up
- This is non-blocking - payment should still work even if WhatsApp fails

