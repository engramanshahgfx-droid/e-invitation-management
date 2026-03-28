-- Shopping Cart and Payment Processing Tables Migration
-- Run this migration in Supabase SQL editor or via migrations folder
-- Created: March 2026

-- 1. Shopping Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Composite key for uniqueness per guest per service
  UNIQUE(guest_id, event_id, service_id)
);

CREATE INDEX idx_cart_items_guest ON cart_items(guest_id);
CREATE INDEX idx_cart_items_event ON cart_items(event_id);
CREATE INDEX idx_cart_items_service ON cart_items(service_id);
CREATE INDEX idx_cart_items_guest_event ON cart_items(guest_id, event_id);

-- 2. Extends Bookings Table for Multi-Service Purchases
-- Add order/batch grouping for checkout sessions
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checkout_session_id VARCHAR;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_part_of_bulk_order BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS bulk_order_id UUID;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method VARCHAR; -- credit_card, debit_card, digital_wallet, bank_transfer

CREATE INDEX IF NOT EXISTS idx_bookings_checkout_session ON bookings(checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_bookings_bulk_order ON bookings(bulk_order_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_method ON bookings(payment_method);

-- 3. Bulk Order Header Table (for grouping multiple service bookings)
CREATE TABLE IF NOT EXISTS bulk_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number VARCHAR UNIQUE NOT NULL,
  status VARCHAR DEFAULT 'pending', -- pending, processing, completed, cancelled, refunded
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  platform_fee DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR DEFAULT 'unpaid', -- unpaid, paid, refunded, partial_refund
  payment_method VARCHAR,
  stripe_payment_intent_id VARCHAR,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bulk_orders_event ON bulk_orders(event_id);
CREATE INDEX idx_bulk_orders_customer ON bulk_orders(customer_id);
CREATE INDEX idx_bulk_orders_status ON bulk_orders(status);
CREATE INDEX idx_bulk_orders_payment_status ON bulk_orders(payment_status);
CREATE INDEX idx_bulk_orders_created ON bulk_orders(created_at);

-- 4. Service Guest Assignment Table (optional services linked to guest)
CREATE TABLE IF NOT EXISTS guest_assigned_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  quantity INT DEFAULT 1,
  assigned_by_organizer BOOLEAN DEFAULT FALSE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(guest_id, service_id, event_id)
);

CREATE INDEX idx_guest_assigned_services_guest ON guest_assigned_services(guest_id);
CREATE INDEX idx_guest_assigned_services_event ON guest_assigned_services(event_id);
CREATE INDEX idx_guest_assigned_services_booking ON guest_assigned_services(booking_id);

-- 5. Payment Methods Table (for storing card/payment info temporarily)
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_provider VARCHAR NOT NULL, -- stripe, paypal, mada, etc.
  provider_id VARCHAR NOT NULL,
  last_four VARCHAR,
  card_brand VARCHAR, -- visa, mastercard, amex, etc.
  exp_month INT,
  exp_year INT,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_customer ON payment_methods(customer_id);
CREATE INDEX idx_payment_methods_provider ON payment_methods(payment_provider);

-- 6. Refunds Table
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  bulk_order_id UUID REFERENCES bulk_orders(id) ON DELETE SET NULL,
  refund_amount DECIMAL(10,2) NOT NULL,
  refund_reason VARCHAR NOT NULL,
  refund_notes TEXT,
  stripe_refund_id VARCHAR,
  refund_status VARCHAR DEFAULT 'initiated', -- initiated, processing, completed, failed
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_refunds_booking ON refunds(booking_id);
CREATE INDEX idx_refunds_bulk_order ON refunds(bulk_order_id);
CREATE INDEX idx_refunds_status ON refunds(refund_status);

-- 7. Service Notifications Table (organizer alerts for new bookings)
CREATE TABLE IF NOT EXISTS service_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  bulk_order_id UUID REFERENCES bulk_orders(id) ON DELETE SET NULL,
  notification_type VARCHAR NOT NULL, -- booking_received, payment_confirmed, refund_issued
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_service_notifications_organizer ON service_notifications(organizer_id);
CREATE INDEX idx_service_notifications_event ON service_notifications(event_id);
CREATE INDEX idx_service_notifications_unread ON service_notifications(organizer_id, is_read);
CREATE INDEX idx_service_notifications_created ON service_notifications(created_at DESC);
