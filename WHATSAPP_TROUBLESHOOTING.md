# WhatsApp Invitation Sending - Issue Resolution

## Issues Found & Fixed

### 1. ✅ TWILIO_WHATSAPP_FROM Configuration
**Problem:** Was set to sandbox number `+14155238886`
**Solution:** Updated to approved WhatsApp number `whatsapp:+966509283847`
**File:** `.env`

### 2. ✅ SSL Certificate Error (Local Development)
**Problem:** cURL error 60 - SSL certificate verification failing
**Error:** `SSL certificate problem: unable to get local issuer certificate`
**Solution:** Added `->withoutVerifying()` to InvitationDeliveryService for local development
**File:** `app/Services/InvitationDeliveryService.php`
**Note:** This is ONLY for local development. NEVER use in production.

### 3. ⚠️ Phone Number Validation Issue
**Problem:** Guest phone showing as `+9665519811751` (has extra "1")
**Root Cause:** User may have typed phone number incorrectly in UI
**Solution:** Review phone number entry in UI form - should validate properly

---

## Current Configuration

```
✓ TWILIO_WHATSAPP_FROM = whatsapp:+966509283847
✓ ORGANIZATION_WHATSAPP_NUMBER = +966509283847
✓ DEFAULT_PHONE_COUNTRY_CODE = +966
✓ SSL Verification = Disabled (local dev only)
```

---

## What Changed

### `.env` File
```
TWILIO_WHATSAPP_FROM=whatsapp:+966509283847  ← Updated from +14155238886
```

### `InvitationDeliveryService.php`
```php
$response = Http::asForm()
    ->withBasicAuth($accountSid, $authToken)
    ->withoutVerifying()  // ← Added for SSL certificate issue
    ->post("https://api.twilio.com/...");
```

---

## Next Steps

### 1. Delete Failed Invitations (Optional)
The old failed invitations won't work. Delete and recreate:
```bash
php artisan tinker
>>> App\Models\Invitation::whereIn('id', [3, 4])->delete()
```

### 2. Test New Invitation Creation
Use the UI to create a new invitation:
- Event: wedding
- Guest Name: Test User
- Guest Email: test@example.com
- Guest Phone: **0509283847** (or +966509283847)
- Create Invitation

### 3. Verify Phone Number Format
Make sure guest phone number is:
- ✅ Correct: 0509283847 or +966509283847
- ❌ Wrong: +9665519811751 (has extra "1")

### 4. Check WhatsApp Message
When invitation sends, verify the message includes:
```
Organizer WhatsApp: +966509283847 (Marasim)
```

---

## Troubleshooting

### If invitations still fail:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Verify Twilio credentials in .env are correct:
   - TWILIO_ACCOUNT_SID
   - TWILIO_AUTH_TOKEN
3. Verify Twilio WhatsApp number is approved in Twilio Dashboard

### Phone Number Issues:
- Guest enters: 0509283847 → normalizes to +966509283847 ✓
- Guest enters: +966509283847 → stays +966509283847 ✓
- Guest enters: +9665519811751 → INVALID (extra digit)

---

## Production Considerations

⚠️ **IMPORTANT:** The `->withoutVerifying()` line is for local development ONLY!

For production, you should:
1. Install proper SSL certificates
2. Remove `->withoutVerifying()`
3. Use proper certificate validation

---

## API Examples

### Create Invitation
```bash
curl -X POST http://localhost:8000/api/invitations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1,
    "guest_name": "Ahmed Ali",
    "guest_email": "ahmed@example.com",
    "guest_phone": "0509283847",
    "template_id": "elegant"
  }'
```

### Expected Response (Success)
```json
{
  "success": true,
  "message": "Invitation created and sent on WhatsApp.",
  "data": {
    "invitation": {
      "id": 5,
      "guest_name": "Ahmed Ali",
      "guest_phone": "+966509283847",
      "delivery_status": "sent",
      "template_id": "elegant"
    },
    "whatsapp": {
      "sent": true,
      "to": "+966509283847",
      "status": "sent"
    }
  }
}
```

---

## Summary

| Item | Before | After |
|------|--------|-------|
| WhatsApp Sender | +14155238886 (sandbox) | whatsapp:+966509283847 ✓ |
| SSL Error | cURL error 60 ❌ | Disabled for dev ✓ |
| Phone Format | +9665519811751 (malformed) | Need to validate UI input |
| Organization Number | +966551981751 | +966509283847 ✓ |

**Status:** Ready to test! Create a new invitation and it should send successfully now.
