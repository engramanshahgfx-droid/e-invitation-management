-- E-Invitation Management Platform - Supabase Database Schema
-- Version: 1.0.0 MVP

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL DEFAULT '18:00',
    venue TEXT NOT NULL,
    description TEXT,
    event_type TEXT DEFAULT 'wedding',
    expected_guests INTEGER DEFAULT 100,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'upcoming', 'ongoing', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_status ON events(status);

-- ============================================
-- GUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    status TEXT NOT NULL DEFAULT 'no_response' CHECK (status IN ('confirmed', 'declined', 'no_response', 'not_delivered')),
    qr_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, phone) -- Prevent duplicate guests per event
);

CREATE INDEX idx_guests_event_id ON guests(event_id);
CREATE INDEX idx_guests_status ON guests(status);
CREATE INDEX idx_guests_qr_token ON guests(qr_token);

-- ============================================
-- INVITATION TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invitation_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ar')),
    header_image TEXT,
    title TEXT NOT NULL DEFAULT 'You''re Invited!',
    title_ar TEXT DEFAULT 'أنت مدعو!',
    message TEXT NOT NULL,
    message_ar TEXT,
    footer_text TEXT NOT NULL DEFAULT 'Please confirm your attendance.',
    footer_text_ar TEXT DEFAULT 'يرجى تأكيد حضورك.',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_event_id ON invitation_templates(event_id);
CREATE INDEX idx_templates_user_id ON invitation_templates(user_id);

-- ============================================
-- MESSAGES TABLE (WhatsApp tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    message_type TEXT NOT NULL DEFAULT 'invitation' CHECK (message_type IN ('invitation', 'reminder', 'update')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_guest_id ON messages(guest_id);
CREATE INDEX idx_messages_event_id ON messages(event_id);
CREATE INDEX idx_messages_status ON messages(status);

-- ============================================
-- CHECKINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    checked_in_by UUID REFERENCES users(id),
    checked_in_at TIMESTAMPTZ DEFAULT NOW(),
    check_in_method TEXT DEFAULT 'qr_scan' CHECK (check_in_method IN ('qr_scan', 'manual'))
);

CREATE INDEX idx_checkins_event_id ON checkins(event_id);
CREATE INDEX idx_checkins_guest_id ON checkins(guest_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Events policies
CREATE POLICY "Users can view their own events" ON events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create events" ON events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" ON events
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" ON events
    FOR DELETE USING (auth.uid() = user_id);

-- Guests policies
CREATE POLICY "Users can view guests of their events" ON guests
    FOR SELECT USING (
        event_id IN (SELECT id FROM events WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can manage guests of their events" ON guests
    FOR ALL USING (
        event_id IN (SELECT id FROM events WHERE user_id = auth.uid())
    );

-- Templates policies
CREATE POLICY "Users can view their templates" ON invitation_templates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their templates" ON invitation_templates
    FOR ALL USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages of their events" ON messages
    FOR SELECT USING (
        event_id IN (SELECT id FROM events WHERE user_id = auth.uid())
    );

-- Checkins policies
CREATE POLICY "Users can view checkins of their events" ON checkins
    FOR SELECT USING (
        event_id IN (SELECT id FROM events WHERE user_id = auth.uid())
    );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at
    BEFORE UPDATE ON guests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON invitation_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for development)
-- ============================================
-- Uncomment below to insert sample data

/*
INSERT INTO events (id, name, date, time, venue, event_type, expected_guests, status)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Wedding - Sarah & Ahmed', '2026-03-15', '18:00', 'Grand Ballroom, Riyadh', 'wedding', 250, 'upcoming'),
    ('22222222-2222-2222-2222-222222222222', 'Corporate Gala 2026', '2026-04-20', '19:00', 'Convention Center, Jeddah', 'corporate', 500, 'upcoming');
*/
