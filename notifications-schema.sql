-- ============================================================
-- notifications table (if not already in your schema)
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID        NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  type        TEXT        NOT NULL,
  -- email_client | email_specialist | email_admin
  -- whatsapp_specialist | whatsapp_admin
  status      TEXT        NOT NULL DEFAULT 'pending',
  -- pending | sent | failed
  error       TEXT,
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_status     ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_booking_id ON notifications(booking_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON notifications
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "admins_all" ON notifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Add reminder_sent flag to bookings if missing
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN NOT NULL DEFAULT false;

-- Add Stripe fields to bookings if missing
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT;
