-- sql-citas-payment-columns.sql
-- Run in Supabase SQL editor to add payment columns to citas table
-- Only needed if your existing schema doesn't already have these columns

ALTER TABLE citas
  ADD COLUMN IF NOT EXISTS pago_estado      TEXT DEFAULT 'pendiente',
  ADD COLUMN IF NOT EXISTS pago_importe_eur NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS pago_stripe_id   TEXT;

-- pago_estado values: pendiente | pagado | expirado | reembolsado
