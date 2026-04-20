# Deployment Checklist - Single Organization WhatsApp & Template System

## Pre-Deployment

### Code Review
- [x] Organization model created
- [x] User model updated with organization relationship
- [x] Invitation model updated with template fields
- [x] Migrations created (3 new migrations)
- [x] InvitationDeliveryService updated
- [x] PublicInvitationController updated
- [x] InvitationController updated to handle templates
- [x] OrganizationSeeder created
- [x] DatabaseSeeder updated
- [x] Documentation created

### Environment Configuration
- [x] .env has `DEFAULT_PHONE_COUNTRY_CODE=+966551981751`
- [x] .env has `MAIL_FROM_ADDRESS="noreply@marasim.digital"`
- [x] Twilio credentials configured in .env

## Deployment Steps

### 1. Pull Latest Code
```bash
git pull origin main
```

### 2. Install Dependencies (if any composer.json changes)
```bash
composer update
```

### 3. Run Migrations
```bash
# Option 1: Fresh database (WARNING: loses all data)
php artisan migrate:fresh --seed

# Option 2: Add migrations only (preferred for production)
php artisan migrate

# Verify migrations ran
php artisan migrate:status
```

### 4. Seed Organization
```bash
# If you didn't use migrate:fresh --seed
php artisan db:seed --class=OrganizationSeeder

# Verify organization created
php artisan tinker
>>> App\Models\Organization::all()
```

### 5. Cache Clear (for Filament if used)
```bash
php artisan cache:clear
php artisan config:clear
```

## Post-Deployment Testing

### Database
- [ ] Run `php artisan tinker` and verify:
  - `App\Models\Organization::first()` returns "Marasim"
  - Organization has whatsapp_number: "+966551981751"
  - Admin users have organization_id set

### API Testing

#### Test 1: View Invitation with Template
```bash
# Get an invitation code
$ curl http://localhost:8000/api/invitations/shared/ABC123

# Should return template data in response:
{
  "success": true,
  "data": {
    "template": {
      "template_id": null,
      "template_data": null,
      "template_customization": null
    }
  }
}
```

#### Test 2: Create Invitation with Template
```bash
$ curl -X POST http://localhost:8000/api/invitations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1,
    "guest_name": "Test User",
    "guest_email": "test@example.com",
    "guest_phone": "+966512345678",
    "template_id": "elegant",
    "template_data": {"title": "Wedding"},
    "template_customization": {"primary_color": "#ffd700"}
  }'
```

#### Test 3: WhatsApp Message Contains Organization Number
- [ ] Send an invitation via WhatsApp
- [ ] Verify message includes organization contact: "+966551981751 (Marasim)"
- [ ] Verify message doesn't include user's personal phone number

### Frontend Testing
- [ ] Invitation creation form accepts template_id
- [ ] Invitation creation form accepts template_data
- [ ] Invitation creation form accepts template_customization
- [ ] Guest invitation page displays template
- [ ] Template customization applies correctly

## Rollback Plan

If issues occur, rollback using:

```bash
# Rollback all migrations
php artisan migrate:rollback

# Or rollback specific migration
php artisan migrate:rollback --step=3

# Verify rollback
php artisan migrate:status
```

## Database Backup

Before deployment:
```bash
# Export database
mysqldump -u root -p marasim > marasim_backup_$(date +%Y%m%d_%H%M%S).sql

# Or using Laravel
php artisan backup:run
```

## Monitoring After Deployment

### Check Logs
```bash
tail -f storage/logs/laravel.log
```

### Monitor WhatsApp Sends
```bash
# Check recent invitations
php artisan tinker
>>> App\Models\Invitation::with('event.user.organization')->latest()->limit(10)->get()

# Check delivery status
>>> $invitation = App\Models\Invitation::find(1);
>>> $invitation->delivery_status
>>> $invitation->delivery_error
```

### Performance
- [ ] Invitation creation time is acceptable
- [ ] API response times are normal
- [ ] No database query issues in logs
- [ ] WhatsApp sending is working

## Troubleshooting

### Migration Errors
```bash
# If foreign key constraint fails:
# 1. Check organizations table exists
php artisan tinker
>>> Schema::hasTable('organizations')

# 2. Check organizations table has correct structure
>>> DB::select("DESCRIBE organizations")

# 3. Recreate organizations if needed
php artisan migrate:rollback --step=3
php artisan migrate
```

### Seeder Issues
```bash
# Run seeder with verbose output
php artisan db:seed --class=OrganizationSeeder -vvv

# Manually create organization
php artisan tinker
>>> App\Models\Organization::create(['name' => 'Marasim', 'whatsapp_number' => '+966551981751', 'whatsapp_contact_name' => 'Marasim', 'is_active' => true])
```

### WhatsApp Not Sending
- [ ] Check Twilio credentials in .env
- [ ] Check organization has whatsapp_number set
- [ ] Check user has organization_id set
- [ ] Review logs for Twilio errors

## Sign-Off

- [ ] All tests passed
- [ ] No errors in logs
- [ ] WhatsApp messages sending correctly
- [ ] API responses include template data
- [ ] Database queries optimized
- [ ] Backup created before deployment
- [ ] Team notified of deployment

## Notes

- Organization ID is nullable for backward compatibility
- Existing invitations will have NULL template fields
- Default organization is "Marasim" with +966551981751
- All migrations are reversible
- No data loss on rollback
