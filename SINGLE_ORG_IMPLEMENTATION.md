# Single Organization WhatsApp & Template System - Implementation Guide

## Summary
Successfully implemented a centralized organization system where:
- ✅ **Single official WhatsApp number** for the entire platform (Marasim)
- ✅ **All subscriber users** use the organization's WhatsApp number
- ✅ **Templates sent when invitation link opens** - template data returned with invitation
- ✅ **Scalable architecture** for future multi-organization support

## What Changed

### 1. Database Structure
Three new migrations created:

**organizations table** - Centralized organization settings
- Stores official WhatsApp number
- Stores organization metadata (name, email, logo)
- Users belong to organizations

**users table** - Added organization_id foreign key
- Links each user to an organization
- Maintains all existing user fields

**invitations table** - Added template fields
- `template_id` - Which template was used
- `template_data` - Template content (JSON)
- `template_customization` - User customizations (JSON)

### 2. Models Created/Updated

**Organization Model** (NEW)
- Has many users
- Fields: name, whatsapp_number, whatsapp_contact_name, email, logo_path, is_active

**User Model** (UPDATED)
- Added organization relationship
- Added organization_id to fillable fields

**Invitation Model** (UPDATED)
- Added template fields to fillable
- JSON casts for template_data and template_customization

### 3. Services & Controllers

**InvitationDeliveryService** (UPDATED)
- Now loads and uses organization's WhatsApp number
- Includes organization contact name in WhatsApp messages
- Fallback to organizer name if no organization

**PublicInvitationController** (UPDATED)
- Returns template data in invitation view response
- Frontend receives template to display

**InvitationController** (UPDATED)
- Accept template_id, template_data, template_customization on create
- Allow updating template fields
- Template data persisted with invitation

### 4. Seeding

**OrganizationSeeder** (NEW)
- Creates default "Marasim" organization
- Reads WhatsApp number from `DEFAULT_PHONE_COUNTRY_CODE` env variable
- Sets email from `MAIL_FROM_ADDRESS` env variable

**DatabaseSeeder** (UPDATED)
- Calls OrganizationSeeder first
- Assigns organization_id to admin users
- Maintains existing seeding logic

## Configuration

### Environment Variables
Already set in .env:
```env
# Organization WhatsApp Contact
DEFAULT_PHONE_COUNTRY_CODE=+966551981751

# Organization Email
MAIL_FROM_ADDRESS="noreply@marasim.digital"

# Twilio WhatsApp
TWILIO_WHATSAPP_FROM=whatsapp:+your_approved_twilio_sender
```

## How It Works

### When User Registers
1. User created in database
2. Automatically assigned to "Marasim" organization
3. User inherits organization's WhatsApp number

### When Invitation Sent
1. Organizer creates invitation (optionally with template)
2. Template data stored in invitation
3. WhatsApp message sent using organization's official number
4. Message includes organization's contact information

### When Guest Opens Invitation
1. Guest clicks link → opens public invitation page
2. API returns invitation data + **template data**
3. Frontend uses template_id to render correct template
4. Template_customization applied to template
5. Guest sees fully styled invitation

## Files Created
- `app/Models/Organization.php`
- `database/migrations/2026_04_19_000001_create_organizations_table.php`
- `database/migrations/2026_04_19_000002_add_organization_id_to_users_table.php`
- `database/migrations/2026_04_19_000003_add_template_fields_to_invitations_table.php`
- `database/seeders/OrganizationSeeder.php`

## Files Modified
- `app/Models/User.php`
- `app/Models/Invitation.php`
- `app/Services/InvitationDeliveryService.php`
- `app/Http/Controllers/Api/PublicInvitationController.php`
- `app/Http/Controllers/Api/InvitationController.php`
- `database/seeders/DatabaseSeeder.php`

## Migration Instructions

```bash
# Run migrations to create new tables
php artisan migrate

# Or for fresh install
php artisan migrate:fresh --seed
```

## API Examples

### Create Invitation with Template
```bash
POST /api/invitations
Content-Type: application/json

{
  "event_id": 1,
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  "guest_phone": "+966512345678",
  "template_id": "elegant",
  "template_data": {
    "event_title": "Wedding",
    "event_date": "2026-05-20"
  },
  "template_customization": {
    "primary_color": "#ffd700",
    "stickers": []
  }
}
```

### View Invitation (Guest)
```bash
GET /api/invitations/shared/ABC123

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "guest_name": "John Doe",
    "event_title": "Wedding",
    "template": {
      "template_id": "elegant",
      "template_data": { ... },
      "template_customization": { ... }
    }
  }
}
```

## Next Steps (Optional)

1. **Frontend Integration**
   - Update invitation creation form to capture template
   - Modify guest invitation display to render template

2. **Admin Dashboard**
   - Add organization management UI
   - Allow admins to update organization WhatsApp number
   - Show organization settings

3. **Multi-Organization Support** (Future)
   - Support multiple organizations
   - Allow users in organizations
   - Role-based access control per organization

## Benefits

✅ **Unified Communication** - Single WhatsApp number for all invitations
✅ **Professional Branding** - Consistent organization identity
✅ **Template Persistence** - Templates saved with invitations
✅ **Guest Experience** - Beautiful templated invitations
✅ **Scalable** - Easy to extend to multiple organizations
✅ **Data Integrity** - Proper foreign key relationships
✅ **Backward Compatible** - organization_id is nullable

## Technical Notes

- All migrations are reversible
- No data loss on rollback
- Existing users will have NULL organization_id initially
- OrganizationSeeder creates default organization
- Templates are optional (backward compatible)
- WhatsApp messaging automatically updated

## Questions or Issues?

The implementation maintains backward compatibility while adding new features. All changes are properly typed and follow Laravel conventions.
