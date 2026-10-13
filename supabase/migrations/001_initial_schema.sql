-- ============================================================
-- Migration 001: Core schema for C.O.D.E. Club website
-- Run this against your Supabase project.
-- ============================================================

-- ── Extensions ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Helper: updated_at trigger ────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── EVENTS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                    TEXT NOT NULL,
  slug                     TEXT NOT NULL UNIQUE,
  description              TEXT,
  short_description        TEXT,
  banner_image_url         TEXT,
  venue                    TEXT,
  starts_at                TIMESTAMPTZ,
  ends_at                  TIMESTAMPTZ,
  registration_deadline    TIMESTAMPTZ,
  registration_open        BOOLEAN NOT NULL DEFAULT FALSE,
  published                BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured              BOOLEAN NOT NULL DEFAULT FALSE,
  featured_button_text     TEXT,
  team_min_size            INTEGER NOT NULL DEFAULT 1 CHECK (team_min_size >= 1 AND team_min_size <= 10),
  team_max_size            INTEGER NOT NULL DEFAULT 4 CHECK (team_max_size >= 1 AND team_max_size <= 10),
  fee_per_team             INTEGER NOT NULL DEFAULT 0 CHECK (fee_per_team >= 0),
  payment_methods_enabled  TEXT[] NOT NULL DEFAULT '{upi_manual}',
  eligibility              TEXT,
  rules                    TEXT,
  schedule                 TEXT,
  prizes                   TEXT,
  faqs                     TEXT,
  contact_email            TEXT,
  contact_phone            TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT team_size_valid CHECK (team_max_size >= team_min_size)
);

CREATE INDEX idx_events_slug       ON events (slug);
CREATE INDEX idx_events_published  ON events (published);
CREATE INDEX idx_events_featured   ON events (is_featured) WHERE is_featured = TRUE;

-- Only one event can be featured at a time
CREATE UNIQUE INDEX idx_events_one_featured
  ON events (is_featured)
  WHERE is_featured = TRUE;

-- Auto-update updated_at
CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ── TEAMS ─────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS team_number_seq START 1;

CREATE TABLE IF NOT EXISTS teams (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_number           TEXT NOT NULL UNIQUE
                        DEFAULT 'CODE-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('team_number_seq')::TEXT, 4, '0'),
  event_id              UUID NOT NULL REFERENCES events (id) ON DELETE RESTRICT,
  team_name             TEXT NOT NULL,
  leader_name           TEXT NOT NULL,
  leader_email          TEXT NOT NULL,
  leader_phone          TEXT NOT NULL,
  registration_status   TEXT NOT NULL DEFAULT 'pending_payment'
                        CHECK (registration_status IN (
                          'pending_payment', 'payment_review', 'confirmed', 'rejected', 'cancelled'
                        )),
  public_reference      TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_teams_event_id         ON teams (event_id);
CREATE INDEX idx_teams_leader_email     ON teams (leader_email);
CREATE INDEX idx_teams_public_reference ON teams (public_reference);
CREATE INDEX idx_teams_status           ON teams (registration_status);

-- Prevent duplicate leader email per event
CREATE UNIQUE INDEX idx_teams_unique_leader_per_event
  ON teams (event_id, lower(leader_email));

CREATE TRIGGER set_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ── TEAM MEMBERS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     UUID NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  college     TEXT,
  roll_number TEXT
);

CREATE INDEX idx_team_members_team_id ON team_members (team_id);

-- ── PAYMENTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id               UUID NOT NULL REFERENCES teams (id) ON DELETE RESTRICT,
  amount                INTEGER NOT NULL CHECK (amount >= 0),
  method                TEXT NOT NULL CHECK (method IN ('upi_manual', 'razorpay')),
  transaction_reference TEXT,
  receipt_path          TEXT,
  provider_order_id     TEXT,
  provider_payment_id   TEXT,
  status                TEXT NOT NULL DEFAULT 'submitted'
                        CHECK (status IN ('submitted', 'approved', 'rejected', 'refunded')),
  rejection_reason      TEXT,
  verified_by           UUID REFERENCES auth.users (id),
  verified_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_team_id ON payments (team_id);
CREATE INDEX idx_payments_status  ON payments (status);

-- Prevent duplicate provider payment IDs (Razorpay idempotency)
CREATE UNIQUE INDEX idx_payments_provider_payment_id
  ON payments (provider_payment_id)
  WHERE provider_payment_id IS NOT NULL;

-- ── ADMIN USERS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── AUDIT LOG ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES admin_users (id),
  action        TEXT NOT NULL,
  entity_type   TEXT NOT NULL,
  entity_id     TEXT NOT NULL,
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_entity    ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_logs_admin     ON audit_logs (admin_user_id);
CREATE INDEX idx_audit_logs_created   ON audit_logs (created_at DESC);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams        ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs   ENABLE ROW LEVEL SECURITY;

-- ── Helper: is_admin() ────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── EVENTS policies ───────────────────────────────────────────
-- Public: read published events only
CREATE POLICY "events_public_read"
  ON events FOR SELECT
  USING (published = TRUE);

-- Admins: full access
CREATE POLICY "events_admin_all"
  ON events FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── TEAMS policies ────────────────────────────────────────────
-- Public: read own team via public_reference (used in status page)
-- No direct SELECT allowed for anonymous users browsing all teams
CREATE POLICY "teams_anon_insert"
  ON teams FOR INSERT
  WITH CHECK (TRUE);  -- Controlled via server-side validation + rate limiting

-- Admins: full access
CREATE POLICY "teams_admin_all"
  ON teams FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── TEAM MEMBERS policies ─────────────────────────────────────
CREATE POLICY "team_members_anon_insert"
  ON team_members FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "team_members_admin_all"
  ON team_members FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── PAYMENTS policies ─────────────────────────────────────────
CREATE POLICY "payments_anon_insert"
  ON payments FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "payments_admin_all"
  ON payments FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── ADMIN_USERS policies ──────────────────────────────────────
-- Only admins can see/manage admin_users
CREATE POLICY "admin_users_admin_all"
  ON admin_users FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── AUDIT_LOGS policies ───────────────────────────────────────
CREATE POLICY "audit_logs_admin_read"
  ON audit_logs FOR SELECT
  USING (is_admin());

CREATE POLICY "audit_logs_admin_insert"
  ON audit_logs FOR INSERT
  WITH CHECK (is_admin());

-- ============================================================
-- Storage bucket (created via Supabase dashboard or CLI)
-- Bucket name: payment-receipts
-- Access: private
-- Run this in the Supabase Dashboard > Storage if needed
-- ============================================================

-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'payment-receipts',
--   'payment-receipts',
--   FALSE,
--   5242880, -- 5MB
--   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
-- )
-- ON CONFLICT (id) DO NOTHING;
