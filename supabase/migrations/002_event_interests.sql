-- Migration: Create event_interests table
CREATE TABLE IF NOT EXISTS event_interests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID REFERENCES events (id) ON DELETE CASCADE,
  event_slug      TEXT NOT NULL,
  team_name       TEXT NOT NULL,
  leader_name     TEXT NOT NULL,
  leader_email    TEXT NOT NULL,
  leader_phone    TEXT NOT NULL,
  leader_usn      TEXT NOT NULL,
  members         JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_interests_event_slug ON event_interests (event_slug);
CREATE INDEX IF NOT EXISTS idx_event_interests_email ON event_interests (leader_email);
CREATE INDEX IF NOT EXISTS idx_event_interests_created_at ON event_interests (created_at DESC);

-- Enable RLS
ALTER TABLE event_interests ENABLE ROW LEVEL SECURITY;

-- Allow public insert
CREATE POLICY "Allow public insert to event_interests"
  ON event_interests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow admins/service role to read and manage
CREATE POLICY "Allow admin read access on event_interests"
  ON event_interests FOR SELECT
  TO authenticated
  USING (true);
