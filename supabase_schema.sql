-- Supabase / PostgreSQL Enterprise Database Schema
-- Location: C:\Users\HP\Desktop\aroohan-serenity-resort\supabase_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Enums for status consistency
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');
CREATE TYPE staff_role AS ENUM ('SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING', 'RESTAURANT_STAFF', 'SPA_STAFF');
CREATE TYPE room_status AS ENUM ('AVAILABLE', 'OCCUPIED', 'DIRTY', 'MAINTENANCE');
CREATE TYPE order_status AS ENUM ('PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED');
CREATE TYPE transport_status AS ENUM ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- 1. Departments Table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 2. Staff Table (JWT & Role Based Access Control)
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role staff_role NOT NULL DEFAULT 'RECEPTIONIST',
  department_id UUID REFERENCES departments(id),
  two_factor_secret VARCHAR(100),
  is_two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 3. Guests Table (CRM & Loyalty Programs)
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  identity_doc VARCHAR(200) NOT NULL, -- e.g., "Passport: Z123456"
  loyalty_points INT DEFAULT 0,
  vip_status VARCHAR(50) DEFAULT 'STANDARD',
  preferences TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 4. Room Types Table (PMS Configuration)
CREATE TABLE room_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  base_price NUMERIC(10, 2) NOT NULL,
  weekend_price NUMERIC(10, 2) NOT NULL,
  holiday_price NUMERIC(10, 2) NOT NULL,
  capacity INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 5. Rooms Table (PMS Status Tracking)
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number VARCHAR(20) UNIQUE NOT NULL,
  room_type_id UUID REFERENCES room_types(id) NOT NULL,
  status room_status NOT NULL DEFAULT 'AVAILABLE',
  last_cleaned TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 6. Coupons Table
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_percentage INT NOT NULL,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 7. Bookings Table (Core Reservation Database & Calendar Sync)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference VARCHAR(50) UNIQUE NOT NULL, -- e.g., BK-8724-XYZ
  guest_id UUID REFERENCES guests(id) NOT NULL,
  room_id UUID REFERENCES rooms(id) NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INT NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  status booking_status NOT NULL DEFAULT 'PENDING',
  coupon_id UUID REFERENCES coupons(id),
  channel_source VARCHAR(100) DEFAULT 'DIRECT', -- e.g. "Booking.com", "Airbnb"
  qr_code_pass TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Exclude overlapping stays for the same room to prevent DOUBLE BOOKING at the database level!
  CONSTRAINT prevent_double_booking EXCLUDE USING gist (
    room_id WITH =,
    tsrange(check_in::timestamp, check_out::timestamp) WITH &&
  ) WHERE (status != 'CANCELLED' AND deleted_at IS NULL)
);

-- 8. Payments Table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  gateway VARCHAR(50) NOT NULL, -- "Stripe", "Razorpay", "PayPal"
  gateway_transaction_id VARCHAR(255) UNIQUE NOT NULL,
  status payment_status NOT NULL DEFAULT 'PENDING',
  refunded_amount NUMERIC(10, 2) DEFAULT 0.00,
  tax_amount NUMERIC(10, 2) NOT NULL,
  gst_amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 9. Invoices Table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. INV-8724-XYZ
  booking_id UUID REFERENCES bookings(id) NOT NULL,
  payment_id UUID REFERENCES payments(id) NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 10. Audit Logs Table (Activity Tracking)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id),
  action VARCHAR(255) NOT NULL,
  table_name VARCHAR(100),
  row_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Maintenance Table (Staff task coordination)
CREATE TABLE maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(50) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH
  assigned_staff_id UUID REFERENCES staff(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 12. Housekeeping Table
CREATE TABLE housekeeping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) NOT NULL,
  cleaner_staff_id UUID REFERENCES staff(id),
  notes TEXT,
  cleaned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Promotions Table
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  discount_percentage INT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Loyalty Programs Table
CREATE TABLE loyalty_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES guests(id) UNIQUE NOT NULL,
  points_balance INT DEFAULT 0,
  membership_tier VARCHAR(50) DEFAULT 'BRONZE', -- BRONZE, SILVER, GOLD, VIP PLATINUM
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(50),
  message TEXT NOT NULL,
  channel VARCHAR(50) NOT NULL, -- "EMAIL", "SMS", "WHATSAPP"
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Restaurant Orders Table (Food & Room Service Ordering)
CREATE TABLE restaurant_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id), -- Nullable if walk-in guest
  table_number VARCHAR(10),
  is_room_service BOOLEAN DEFAULT FALSE,
  items JSONB NOT NULL, -- [{name: 'forest salad', qty: 2, price: 15.00}]
  total_price NUMERIC(10,2) NOT NULL,
  status order_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 17. Spa Bookings Table
CREATE TABLE spa_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) NOT NULL,
  therapy_name VARCHAR(150) NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  assigned_therapist_id UUID REFERENCES staff(id),
  price NUMERIC(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'SCHEDULED', -- SCHEDULED, COMPLETED, CANCELLED
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Transport Bookings Table (Airport Pickup/Drop)
CREATE TABLE transport_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) NOT NULL,
  vehicle_type VARCHAR(100) NOT NULL, -- Sedan, SUV, Luxury Coach
  pickup_location TEXT NOT NULL,
  drop_location TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  driver_staff_id UUID REFERENCES staff(id),
  status transport_status NOT NULL DEFAULT 'SCHEDULED',
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. Events Table (Corporate/Private)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  event_type VARCHAR(100) NOT NULL, -- Wedding, Conference, Seminar, Birthday
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  budget NUMERIC(12,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 20. Wedding Bookings Table (Niche Event Subsystem)
CREATE TABLE wedding_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) UNIQUE NOT NULL,
  bride_name VARCHAR(255) NOT NULL,
  groom_name VARCHAR(255) NOT NULL,
  guests_count INT NOT NULL,
  catering_selections JSONB,
  decoration_theme VARCHAR(150),
  vendor_tracking JSONB, -- [{vendor: 'floral design co', budget: 2500, paid: true}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 21. Reviews Table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) UNIQUE NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 22. Transactions Table (Full ledger tracing)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id),
  type VARCHAR(50) NOT NULL, -- "INCOME", "REFUND", "EXPENSE", "PURCHASE"
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ========================================================
-- DATABASE TRIGGERS FOR AUDIT TRAILS & AUTO UPDATING
-- ========================================================

-- Trigger to auto-update update_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Attach update triggers to key tables
CREATE TRIGGER update_guests_modtime BEFORE UPDATE ON guests FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_bookings_modtime BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_rooms_modtime BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_payments_modtime BEFORE UPDATE ON payments FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_staff_modtime BEFORE UPDATE ON staff FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Audit logging trigger function
CREATE OR REPLACE FUNCTION audit_trail_logger()
RETURNS TRIGGER AS $$
DECLARE
  current_staff_id UUID;
BEGIN
  -- Attempt to get session staff ID (configured during dashboard API calls)
  BEGIN
    current_staff_id := NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID;
  EXCEPTION WHEN OTHERS THEN
    current_staff_id := NULL;
  END;

  IF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs(staff_id, action, table_name, row_id, old_data, new_data)
    VALUES (current_staff_id, 'UPDATE', TG_TABLE_NAME, OLD.id, row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB);
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs(staff_id, action, table_name, row_id, old_data, new_data)
    VALUES (current_staff_id, 'DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD)::JSONB, NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach audit log triggers
CREATE TRIGGER audit_guests_trigger AFTER UPDATE OR DELETE ON guests FOR EACH ROW EXECUTE PROCEDURE audit_trail_logger();
CREATE TRIGGER audit_bookings_trigger AFTER UPDATE OR DELETE ON bookings FOR EACH ROW EXECUTE PROCEDURE audit_trail_logger();
CREATE TRIGGER audit_rooms_trigger AFTER UPDATE OR DELETE ON rooms FOR EACH ROW EXECUTE PROCEDURE audit_trail_logger();
CREATE TRIGGER audit_payments_trigger AFTER UPDATE OR DELETE ON payments FOR EACH ROW EXECUTE PROCEDURE audit_trail_logger;

-- 23. Room Images Table (Visual asset configurations)
CREATE TABLE room_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type_id UUID REFERENCES room_types(id) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

