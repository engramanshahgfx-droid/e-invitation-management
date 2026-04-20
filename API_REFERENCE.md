# API Reference - Single Organization & Template System

## Overview
Enhanced invitation system with organization management and template support.

## Organization Endpoints (Admin Only)

### Get Organization Details
```http
GET /api/organizations/{id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Marasim",
    "whatsapp_number": "+966551981751",
    "whatsapp_contact_name": "Marasim",
    "email": "noreply@marasim.digital",
    "logo_path": null,
    "is_active": true,
    "created_at": "2026-04-19T...",
    "updated_at": "2026-04-19T..."
  }
}
```

## Invitation Endpoints

### Create Invitation with Template
```http
POST /api/invitations
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "event_id": 1,
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  "guest_phone": "+966512345678",
  "template_id": "elegant",
  "template_data": {
    "event_title": "Wedding Celebration",
    "event_date": "2026-05-20",
    "event_time": "19:00",
    "event_location": "Riyadh, Saudi Arabia",
    "event_description": "You are cordially invited..."
  },
  "template_customization": {
    "primary_color": "#ffd700",
    "secondary_color": "#1a1a2e",
    "backdrop": "gradient",
    "stickers": ["heart", "star"],
    "header_text": "You're Invited!",
    "custom_font": "elegant"
  }
}

Response:
{
  "success": true,
  "message": "Invitation created and sent on WhatsApp.",
  "data": {
    "invitation": {
      "id": 1,
      "event_id": 1,
      "guest_name": "John Doe",
      "guest_email": "john@example.com",
      "guest_phone": "+966512345678",
      "status": "pending",
      "invitation_code": "ABC123DE",
      "template_id": "elegant",
      "template_data": {...},
      "template_customization": {...},
      "delivery_status": "sent",
      "delivery_phone": "+966512345678",
      "created_at": "2026-04-19T...",
      "updated_at": "2026-04-19T..."
    },
    "public_url": "http://localhost:8000/invitation/ABC123DE",
    "whatsapp": {
      "attempted": true,
      "sent": true,
      "to": "+966512345678",
      "message_id": "SM1234567890abcdef",
      "status": "sent"
    }
  }
}
```

### Update Invitation with Template
```http
PATCH /api/invitations/{id}
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "template_id": "modern",
  "template_data": {...},
  "template_customization": {
    "primary_color": "#667eea",
    "secondary_color": "#764ba2"
  }
}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "template_id": "modern",
    "template_data": {...},
    "template_customization": {...},
    ...
  }
}
```

### Get Single Invitation (Authenticated)
```http
GET /api/invitations/{id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "event_id": 1,
    "guest_name": "John Doe",
    "guest_email": "john@example.com",
    "guest_phone": "+966512345678",
    "status": "pending",
    "invitation_code": "ABC123DE",
    "template_id": "elegant",
    "template_data": {...},
    "template_customization": {...},
    "delivery_status": "sent",
    "delivery_channel": "whatsapp",
    "delivery_sent_at": "2026-04-19T...",
    ...
  }
}
```

### List Invitations
```http
GET /api/invitations?event_id={eventId}&page=1
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "event_id": 1,
      "guest_name": "John Doe",
      "guest_email": "john@example.com",
      "template_id": "elegant",
      "delivery_status": "sent",
      ...
    },
    ...
  ],
  "meta": {
    "current_page": 1,
    "per_page": 50,
    "total": 100
  }
}
```

## Public Invitation Endpoints (No Auth Required)

### View Invitation (Guest)
```http
GET /api/invitations/shared/{invitation_code}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "guest_name": "John Doe",
    "guest_email": "john@example.com",
    "guest_phone": "+966512345678",
    "status": "pending",
    "event_title": "Wedding Celebration",
    "event_date": "2026-05-20",
    "event_time": "19:00",
    "event_location": "Riyadh, Saudi Arabia",
    "event_description": "You are cordially invited...",
    "organizer_name": "Aman Shah",
    "organizer_phone": "+966512345678",
    "template": {
      "template_id": "elegant",
      "template_data": {
        "event_title": "Wedding Celebration",
        "event_date": "2026-05-20",
        "event_time": "19:00",
        "event_location": "Riyadh, Saudi Arabia",
        "event_description": "You are cordially invited..."
      },
      "template_customization": {
        "primary_color": "#ffd700",
        "secondary_color": "#1a1a2e",
        "backdrop": "gradient",
        "stickers": ["heart", "star"],
        "header_text": "You're Invited!",
        "custom_font": "elegant"
      }
    }
  }
}
```

### RSVP (Guest Response)
```http
POST /api/invitations/shared/{invitation_code}/rsvp
Content-Type: application/json

Request:
{
  "status": "accepted"  // or "declined", "attending"
}

Response:
{
  "success": true,
  "message": "RSVP updated successfully.",
  "data": {
    "id": 1,
    "status": "accepted",
    "responded_at": "2026-04-19T...",
    ...
  }
}
```

### Share Invitation (Send via WhatsApp)
```http
POST /api/invitations/{id}/share
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "invitation_code": "ABC123DE",
    "public_url": "http://localhost:8000/invitation/ABC123DE",
    "api_url": "http://localhost:8000/api/invitations/shared/ABC123DE",
    "whatsapp": {
      "attempted": true,
      "sent": true,
      "to": "+966512345678",
      "message_id": "SM1234567890abcdef",
      "status": "sent"
    }
  }
}
```

## Bulk Operations

### Create Invitations from Guests
```http
POST /api/invitations/bulk-from-guests
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "event_id": 1,
  "resend_existing": false  // optional
}

Response:
{
  "success": true,
  "message": "Bulk invitation processing completed.",
  "data": {
    "created_count": 5,
    "sent_count": 4,
    "failed_count": 0,
    "skipped_count": 1,
    "results": [
      {
        "guest_id": 1,
        "guest_name": "John Doe",
        "invitation_id": 1,
        "delivery_status": "sent",
        "reason": null,
        "to": "+966512345678"
      },
      ...
    ]
  }
}
```

## Template Fields Reference

### Template IDs
Supported template identifiers:
- `elegant` - Gold/navy wedding style
- `modern` - Gradient purple/pink contemporary
- `minimal` - Black/white corporate
- `playful` - Colorful birthday with animations
- `professional` - Navy blue business style

### Template Data Structure
```json
{
  "event_title": "Wedding Celebration",
  "event_date": "2026-05-20",
  "event_time": "19:00",
  "event_location": "Riyadh, Saudi Arabia",
  "event_description": "You are cordially invited...",
  "guest_name": "John Doe",
  "organizer_name": "Aman Shah",
  "organizer_contact": "+966512345678"
}
```

### Template Customization Structure
```json
{
  "primary_color": "#ffd700",
  "secondary_color": "#1a1a2e",
  "backdrop": "gradient",  // or "solid", "pattern"
  "header_text": "You're Invited!",
  "custom_font": "elegant",  // or "modern", "professional"
  "stickers": ["heart", "star", "rose"],
  "logo_url": "https://example.com/logo.png",
  "custom_text": {
    "line1": "Custom Line 1",
    "line2": "Custom Line 2"
  }
}
```

## Pagination

All list endpoints support:
- `?page=1` - Page number (default: 1)
- `?per_page=50` - Items per page (default: 50)

Response includes:
```json
{
  "meta": {
    "current_page": 1,
    "per_page": 50,
    "total": 100,
    "last_page": 2
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "event_id": ["The event_id field is required."],
    "guest_email": ["The guest_email must be a valid email."]
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Invitation not found."
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "An error occurred while processing your request."
}
```

## WhatsApp Message Format

When invitation is sent via WhatsApp, the message includes:

```
Hello {guest_name}, you're invited by {organizer_name}!
Open your invitation: {public_url}
Organizer WhatsApp: {organization_phone} ({organization_contact_name})
Reply on the invitation page to confirm your attendance.
```

Example:
```
Hello John Doe, you're invited by Aman Shah!
Open your invitation: http://localhost:8000/invitation/ABC123DE
Organizer WhatsApp: +966551981751 (Marasim)
Reply on the invitation page to confirm your attendance.
```

## Rate Limiting

- **Invitation Creation**: Unlimited (depends on subscription)
- **WhatsApp Send**: Depends on Twilio Verify configuration
- **RSVP**: No limit
- **View Invitation**: No limit

## Authentication

All authenticated endpoints require:
```http
Authorization: Bearer {access_token}
```

Get token via login:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

## Response Format

All responses follow this structure:
```json
{
  "success": true/false,
  "message": "Human readable message",
  "data": {...},
  "errors": {...}  // Optional, only on error
}
```

## Versioning

Current API Version: v1

For future versions:
```http
GET /api/v2/invitations/...
```

## Changelog

### v1.0.0 (2026-04-19)
- ✅ Single organization WhatsApp number
- ✅ Template system integration
- ✅ Template data persistence
- ✅ Template customization support
- ✅ Organization model and relationships
