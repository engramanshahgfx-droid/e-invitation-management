# 🏦 Bank Account Configuration - Al Rajhi Bank (Saudi Arabia)

## 📋 Account Details

The following Saudi bank account has been configured for receiving payments:

| Field | Value |
|-------|-------|
| **Account Holder** | SAJJAD BAQER BIN IBRAHIM ALMURAYHIL |
| **Bank Name** | Al Rajhi Bank (البنك الراجحي) |
| **Branch Code** | 0309 |
| **Branch Name** | OMRAN (العمران) |
| **Account Number** | 0108089585850010 |
| **IBAN** | SA9230400108089585850010 |
| **ID Card** | 1134283918 |
| **WhatsApp Support** | +966551981751 |

---

## 🔧 Environment Configuration

The system is configured with these variables in `.env`:

```env
# Bank Transfer Configuration
BANK_ACCOUNT_NUMBER=0108089585850010
BANK_IBAN=SA9230400108089585850010
BANK_HOLDER_NAME=SAJJAD BAQER BIN IBRAHIM ALMURAYHIL
BANK_BRANCH_CODE=0309
BANK_BRANCH_NAME=OMRAN
BANK_NAME=Alrajhi Bank
BANK_RECEIPT_WHATSAPP=+966551981751

# WhatsApp Integration
TWILIO_PHONE_NUMBER=+966551981751
```

---

## 💰 Payment Flow

### Step 1: Customer Selects Plan
- User goes to `/pricing` page
- Chooses a subscription plan (Basic or Pro)
- Clicks "Bank Transfer" button

### Step 2: Customer Views Bank Details
- Page displays account information
- Shows unique reference code (Format: `BANK-[timestamp]-[hex]`)
- Customer shares screen shot or notes details

**What Customer Sees:**
```
Bank Details:
- Account Holder: SAJJAD BAQER BIN IBRAHIM ALMURAYHIL
- Bank: Alrajhi Bank
- Branch: OMRAN (0309)
- Account Number: 0108089585850010
- IBAN: SA9230400108089585850010

Reference Code: BANK-1709876234-a4d2f8
(Include this in the transfer note)
```

### Step 3: Customer Makes Bank Transfer
Customer:
1. Opens their bank app (Al Rajhi or any Saudi bank)
2. Initiates transfer to the account details above
3. **IMPORTANT**: Includes reference code in transfer description
4. Completes transfer

### Step 4: Customer Uploads Proof
- Returns to system
- Uploads screenshot of successful transfer
- Provides WhatsApp number for receipt

**Proof Requirements:**
- Clear screenshot of transfer confirmation
- Transaction receipt showing:
  - Account transferred to
  - Amount
  - Reference code
  - Timestamp

### Step 5: WhatsApp Receipt Sent
Customer receives message:
```
🎉 Payment Receipt Confirmation

Dear Customer Name,

✅ Your bank transfer proof has been received successfully!

📦 Account Details:
• Account Holder: SAJJAD BAQER BIN IBRAHIM ALMURAYHIL
• Account Number: 0108089585850010
• IBAN: SA9230400108089585850010
• Branch: OMRAN (0309)

💰 Payment Status: Pending Admin Approval
⏳ Expected approval within 24 hours

📞 WhatsApp Support: +966551981751
```

### Step 6: Admin Reviews in Dashboard
Admin goes to `/admin/dashboard`:
1. Clicks "Bank Transfers" tab
2. Reviews customer proof image
3. Verifies:
   - Amount matches plan price
   - Reference code is correct
   - Proof image is clear
   - Account details match

### Step 7: Admin Approves Payment
Admin clicks "Approve" button:
- Payment status → "approved"
- User subscription → "active"
- User gets email confirmation
- Customer receives WhatsApp:

```
✅ Payment Approved!

Dear Customer Name,

Great news! Your bank transfer payment has been verified and approved.

💰 Payment Details:
• Plan: Basic Plan
• Amount: $9.99
• Status: ✅ APPROVED

🎉 Your subscription is now active!
• Unlimited event creation
• Full feature access
• Valid until: [Expiry Date]

Thank you for your business!
📞 Support: +966551981751
```

---

## 🔍 Verification Checklist

When customer uploads proof, verify:

- ✅ **Amount**: Matches the plan price
- ✅ **Recipient Account**: Same as configured IBAN
- ✅ **Reference Code**: Matches what we generated
- ✅ **Timestamp**: Recent (within 24 hours)
- ✅ **Image Quality**: Clear and readable
- ✅ **All Fields**: Account holder, amount, reference visible
- ✅ **Transaction Status**: Shows "Completed" or "Successful"

---

## ❌ When to Reject

Reject the payment if:
- ❌ Reference code doesn't match
- ❌ Amount is different from plan price
- ❌ Account number doesn't match
- ❌ Proof image is unclear/illegible
- ❌ Transfer status shows "Pending" (not completed)
- ❌ Suspicious or inconsistent details
- ❌ Proof appears altered or fake

**Rejection Message to Customer:**
```
❌ Payment Verification Failed

Dear Customer Name,

Unfortunately, your bank transfer could not be verified.

📋 Reasons may include:
• Incomplete or unclear proof image
• Reference code mismatch
• Incorrect amount transferred
• Proof image quality issues

✏️ Next Steps:
1. Review the requirements for payment proof
2. Retake a clear screenshot of the transfer confirmation
3. Ensure the reference code is clearly visible
4. Submit new proof through your account

📞 Need help?
Contact support: +966551981751
```

---

## 📊 Bank Account Dashboard

In Admin Dashboard at `/admin/dashboard`, Bank Transfers section shows:

**Columns:**
| Column | Purpose |
|--------|---------|
| Reference Code | Unique ID for tracking |
| Customer | Name of payer |
| Amount | Plan price |
| Status | Pending / Approved / Rejected |
| Proof | Link to uploaded screenshot |
| Date | When proof was submitted |
| Action | Approve / Reject buttons |

---

## 🔐 Security Notes

1. **Keep account details secure**
   - Only display to authenticated users
   - Don't share in public emails/messages

2. **Verify all proofs:**
   - Check account matches exactly
   - Verify amount matches plan
   - Don't approve suspicious transfers

3. **Track approvals**
   - Record who approved each payment
   - Maintain audit trail

4. **Monitor for fraud:**
   - Watch for repeated rejections
   - Flag suspicious patterns
   - Contact support if needed

---

## 🆘 Troubleshooting

### "Customer transferred wrong amount"
- ❌ REJECT the payment
- WhatsApp customer rejection message
- Ask them to transfer the correct amount
- They can resubmit proof

### "Reference code doesn't match"
- ❌ REJECT the payment
- Likely accidental or intentional fraud attempt
- Create new payment request with new reference
- Customer tries again with correct code

### "Proof image is unclear"
- ❌ REJECT the payment
- Message: "Please send a clearer screenshot"
- Customer retakes screenshot
- Resubmits proof

### "Transfer still showing as Pending"
- ❌ REJECT the payment
- Explain that transfer must be completed first
- Ask them to wait and verify with their bank
- Resubmit once status is Completed

### "Bank account seems suspicious"
- ⚠️ CONTACT ADMIN
- Don't approve
- Investigate before proceeding
- May need to reject or escalate

---

## 📱 WhatsApp Integration

### Setup (if not done)
1. Signup at https://www.twilio.com/
2. Enable WhatsApp channel
3. Request production number
4. Add to `.env` as `TWILIO_PHONE_NUMBER`

### Automatic Messages Sent:

| Trigger | Message | Recipient |
|---------|---------|-----------|
| Proof uploaded | Confirmation receipt | Customer (WhatsApp) |
| Proof uploaded | Admin alert | Admin (WhatsApp: +966551981751) |
| Payment approved | Success message | Customer (WhatsApp) |
| Payment rejected | Instructions to retry | Customer (WhatsApp) |

### Testing WhatsApp
```bash
# 1. Go to /en/payment/bank-transfer?planId=PLAN_ID
# 2. Fill in phone number: +966 55 1234 5678
# 3. Upload proof image
# 4. Check WhatsApp for receipt message
# 5. Go to admin dashboard
# 6. Click "Approve"
# 7. Check WhatsApp for approval message
```

---

## 💡 Tips for Success

1. **Clear Instructions**
   - Show example of correct proof screenshot
   - Explain how to include reference code
   - Provide support contact

2. **Fast Approvals**
   - Check dashboard regularly for pending transfers
   - Approve within 24 hours if correct
   - Notify customer immediately

3. **Professional**
   - Use template messages
   - Be consistent in approvals
   - Keep records of all approvals

4. **Customer Service**
   - Be available via WhatsApp
   - Respond quickly to issues
   - Help with unclear transfers

---

## 📞 Support Information

For customers with questions:

| Issue | Solution |
|-------|----------|
| Can't transfer | Send bank details via WhatsApp |
| Lost reference code | Resend link to payment page |
| Transfer stuck | Contact their bank or support |
| Multiple rejections | Call support: +966551981751 |
| Account verified | Send confirmation message |

---

## 🎯 Key Takeaways

✅ **Account is real and verified**
- Name: SAJJAD BAQER BIN IBRAHIM ALMURAYHIL
- ID: 1134283918
- IBAN: SA9230400108089585850010

✅ **Fully automated with WhatsApp**
- Customers get instant receipts
- Admin gets alerts
- Approvals trigger notifications

✅ **Secure process**
- Requires proof upload
- Manual admin approval
- Reference code verification
- Prevents fraud

✅ **Customer-friendly**
- Clear bank details displayed
- Unique reference codes
- WhatsApp updates
- 24-hour approval window

---

**System Ready for Production** ✅

The bank account setup is complete and customers can start making payments immediately!

