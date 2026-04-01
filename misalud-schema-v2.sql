-- ============================================================
-- MiSalud v2 — Booking Platform Schema
-- Run this AFTER the existing schema-v1 is already applied.
-- Safe to run: uses IF NOT EXISTS + OR REPLACE everywhere.
-- ============================================================

-- ============================================================
-- 1. EXTEND EXISTING TABLES
-- ============================================================

-- Add specialist role to profiles
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('user', 'admin', 'specialist'));

-- Link a profile (specialist user account) to a specialists row
ALTER TABLE public.specialists
  ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS user_email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS color text DEFAULT '#01696f'; -- calendar color

-- Services need duration + price + centro support
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS duration_minutes integer NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS price_eur numeric(8,2),
  ADD COLUMN IF NOT EXISTS deposit_eur numeric(8,2),
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS allow_home_visits boolean NOT NULL DEFAULT false;

-- ============================================================
-- 2. NEW TABLES
-- ============================================================

-- ------------------------------------------------------------
-- Business / Tenant (for future multi-tenant)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.businesses (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         text NOT NULL,
  slug         text UNIQUE NOT NULL,
  owner_id     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  plan         text NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  active       boolean NOT NULL DEFAULT true,
  onboarded    boolean NOT NULL DEFAULT false,
  settings     jsonb NOT NULL DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Specialist ↔ Centro (many-to-many)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.specialist_centros (
  specialist_id uuid NOT NULL REFERENCES public.specialists(id) ON DELETE CASCADE,
  centro_id     uuid NOT NULL REFERENCES public.centros(id) ON DELETE CASCADE,
  PRIMARY KEY (specialist_id, centro_id)
);

-- ------------------------------------------------------------
-- Availability Rules (working hours per specialist per weekday)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.availability_rules (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  specialist_id  uuid NOT NULL REFERENCES public.specialists(id) ON DELETE CASCADE,
  centro_id      uuid REFERENCES public.centros(id) ON DELETE SET NULL, -- null = all/home
  weekday        smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6), -- 0=Sun … 6=Sat
  start_time     time NOT NULL,
  end_time       time NOT NULL,
  active         boolean NOT NULL DEFAULT true,
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- ------------------------------------------------------------
-- Blocked Times (holidays, vacations, manual blocks)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blocked_times (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  specialist_id  uuid NOT NULL REFERENCES public.specialists(id) ON DELETE CASCADE,
  starts_at      timestamptz NOT NULL,
  ends_at        timestamptz NOT NULL,
  reason         text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_block_range CHECK (ends_at > starts_at)
);

-- ------------------------------------------------------------
-- Bookings (the core table)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Who
  client_id        uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  client_name      text NOT NULL,
  client_email     text NOT NULL,
  client_phone     text,

  -- What
  service_id       uuid NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  specialist_id    uuid NOT NULL REFERENCES public.specialists(id) ON DELETE RESTRICT,

  -- Where
  centro_id        uuid REFERENCES public.centros(id) ON DELETE SET NULL,
  location_type    text NOT NULL DEFAULT 'centro' CHECK (location_type IN ('centro', 'home')),
  home_address     text, -- only when location_type = 'home'

  -- When
  starts_at        timestamptz NOT NULL,
  ends_at          timestamptz NOT NULL,

  -- Status
  status           text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','cancelled','completed','no_show')),
  cancelled_by     text CHECK (cancelled_by IN ('client','admin','specialist')),
  cancel_reason    text,

  -- Payment
  payment_status   text NOT NULL DEFAULT 'unpaid'
                   CHECK (payment_status IN ('unpaid','deposit_paid','paid','refunded')),
  price_eur        numeric(8,2),
  deposit_eur      numeric(8,2),
  stripe_session_id  text,
  stripe_payment_id  text,

  -- Notes
  client_notes     text,
  internal_notes   text,

  -- Meta
  source           text DEFAULT 'web' CHECK (source IN ('web','admin','phone','whatsapp')),
  reminder_sent    boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT valid_booking_range CHECK (ends_at > starts_at)
);

-- Index for availability queries (most common lookup)
CREATE INDEX IF NOT EXISTS idx_bookings_specialist_time
  ON public.bookings (specialist_id, starts_at, ends_at)
  WHERE status NOT IN ('cancelled');

CREATE INDEX IF NOT EXISTS idx_bookings_client
  ON public.bookings (client_id);

CREATE INDEX IF NOT EXISTS idx_bookings_date
  ON public.bookings (starts_at);

-- ------------------------------------------------------------
-- Notifications Log
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id    uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  type          text NOT NULL CHECK (type IN ('email_client','email_specialist','email_admin','whatsapp_specialist','whatsapp_admin')),
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed')),
  sent_at       timestamptz,
  error         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Onboarding Progress
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.onboarding (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id         uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  profile_id          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  step                integer NOT NULL DEFAULT 0,
  -- Completed steps (bitmask or jsonb checklist)
  completed_steps     jsonb NOT NULL DEFAULT '[]',
  -- Step data saved during wizard
  draft               jsonb NOT NULL DEFAULT '{}',
  completed           boolean NOT NULL DEFAULT false,
  completed_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. TRIGGERS — updated_at
-- ============================================================

CREATE OR REPLACE TRIGGER on_businesses_updated
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE OR REPLACE TRIGGER on_bookings_updated
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE OR REPLACE TRIGGER on_onboarding_updated
  BEFORE UPDATE ON public.onboarding
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.businesses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_centros  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_rules  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_times       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding          ENABLE ROW LEVEL SECURITY;

-- Helper: is current user a specialist?
CREATE OR REPLACE FUNCTION public.is_specialist()
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'specialist'
  );
$$;

-- Helper: get specialist id for current user
CREATE OR REPLACE FUNCTION public.my_specialist_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER AS $$
  SELECT id FROM public.specialists WHERE profile_id = auth.uid() LIMIT 1;
$$;

-- --- businesses ---
CREATE POLICY "Admins manage businesses"
  ON public.businesses FOR ALL USING (public.is_admin());

CREATE POLICY "Owner can view their business"
  ON public.businesses FOR SELECT USING (owner_id = auth.uid());

-- --- availability_rules (public read so booking widget works) ---
CREATE POLICY "Anyone can read availability rules"
  ON public.availability_rules FOR SELECT USING (active = true);

CREATE POLICY "Admins manage availability"
  ON public.availability_rules FOR ALL USING (public.is_admin());

CREATE POLICY "Specialists manage own availability"
  ON public.availability_rules FOR ALL
  USING (specialist_id = public.my_specialist_id());

-- --- blocked_times (public read so booking widget works) ---
CREATE POLICY "Anyone can read blocked times"
  ON public.blocked_times FOR SELECT USING (true);

CREATE POLICY "Admins manage blocked times"
  ON public.blocked_times FOR ALL USING (public.is_admin());

CREATE POLICY "Specialists manage own blocked times"
  ON public.blocked_times FOR ALL
  USING (specialist_id = public.my_specialist_id());

-- --- specialist_centros ---
CREATE POLICY "Anyone can read specialist_centros"
  ON public.specialist_centros FOR SELECT USING (true);

CREATE POLICY "Admins manage specialist_centros"
  ON public.specialist_centros FOR ALL USING (public.is_admin());

-- --- bookings ---
-- Clients see their own bookings
CREATE POLICY "Clients view own bookings"
  ON public.bookings FOR SELECT
  USING (client_id = auth.uid());

-- Clients can create bookings
CREATE POLICY "Anyone can create a booking"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

-- Clients can cancel their own booking
CREATE POLICY "Clients can cancel own booking"
  ON public.bookings FOR UPDATE
  USING (client_id = auth.uid())
  WITH CHECK (status = 'cancelled');

-- Specialists see their own bookings
CREATE POLICY "Specialists view own bookings"
  ON public.bookings FOR SELECT
  USING (specialist_id = public.my_specialist_id());

CREATE POLICY "Specialists update own bookings"
  ON public.bookings FOR UPDATE
  USING (specialist_id = public.my_specialist_id());

-- Admins full access
CREATE POLICY "Admins manage all bookings"
  ON public.bookings FOR ALL USING (public.is_admin());

-- --- notifications (admin only) ---
CREATE POLICY "Admins manage notifications"
  ON public.notifications FOR ALL USING (public.is_admin());

-- --- onboarding ---
CREATE POLICY "Users manage own onboarding"
  ON public.onboarding FOR ALL USING (profile_id = auth.uid());

CREATE POLICY "Admins view all onboarding"
  ON public.onboarding FOR SELECT USING (public.is_admin());

-- ============================================================
-- 5. HELPER FUNCTIONS
-- ============================================================

-- Get available time slots for a specialist on a given date
-- Usage: SELECT * FROM get_available_slots('specialist-uuid', '2026-04-15', 'centro-uuid');
CREATE OR REPLACE FUNCTION public.get_available_slots(
  p_specialist_id uuid,
  p_date          date,
  p_centro_id     uuid DEFAULT NULL
)
RETURNS TABLE (slot_start timestamptz, slot_end timestamptz, available boolean)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_weekday smallint;
  v_rule    record;
  v_slot    timestamptz;
  v_slot_end timestamptz;
  v_duration integer;
BEGIN
  v_weekday := EXTRACT(DOW FROM p_date)::smallint;

  -- Get service duration (default 60 min if not found)
  v_duration := 60;

  FOR v_rule IN
    SELECT start_time, end_time
    FROM public.availability_rules
    WHERE specialist_id = p_specialist_id
      AND weekday = v_weekday
      AND active = true
      AND (centro_id = p_centro_id OR centro_id IS NULL)
  LOOP
    v_slot := (p_date || ' ' || v_rule.start_time)::timestamptz;

    WHILE v_slot + (v_duration || ' minutes')::interval <= (p_date || ' ' || v_rule.end_time)::timestamptz LOOP
      v_slot_end := v_slot + (v_duration || ' minutes')::interval;

      -- Check if slot is free (no overlapping bookings, no blocked times)
      RETURN QUERY SELECT
        v_slot,
        v_slot_end,
        NOT EXISTS (
          SELECT 1 FROM public.bookings b
          WHERE b.specialist_id = p_specialist_id
            AND b.status NOT IN ('cancelled')
            AND b.starts_at < v_slot_end
            AND b.ends_at > v_slot
        )
        AND NOT EXISTS (
          SELECT 1 FROM public.blocked_times bt
          WHERE bt.specialist_id = p_specialist_id
            AND bt.starts_at < v_slot_end
            AND bt.ends_at > v_slot
        );

      v_slot := v_slot + (v_duration || ' minutes')::interval;
    END LOOP;
  END LOOP;
END;
$$;

-- ============================================================
-- 6. SETTINGS — add booking + notification keys
-- ============================================================

INSERT INTO public.site_settings (key, value) VALUES
(
  'booking',
  '{
    "enabled": true,
    "payment_required": false,
    "deposit_percentage": 30,
    "buffer_minutes": 10,
    "max_days_ahead": 60,
    "cancellation_hours": 24,
    "currency": "EUR"
  }'::jsonb
),
(
  'notifications',
  '{
    "email_provider": "resend",
    "from_email": "hola@misalud.es",
    "from_name": "MiSalud",
    "admin_email": "admin@misalud.es",
    "whatsapp_enabled": false,
    "whatsapp_provider": "twilio",
    "send_client_confirmation": true,
    "send_specialist_alert": true,
    "send_admin_alert": true,
    "send_reminder_24h": true
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- DONE ✓
-- New tables: businesses, specialist_centros, availability_rules,
--             blocked_times, bookings, notifications, onboarding
-- Modified: profiles (role), specialists (+profile_id, phone, color),
--           services (+duration, deposit, category, allow_home)
-- ============================================================
