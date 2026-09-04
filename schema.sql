CREATE TABLE IF NOT EXISTS applications (
  id BIGSERIAL PRIMARY KEY,
  discord_id TEXT NOT NULL,
  discord_name TEXT NOT NULL,
  discord_avatar TEXT,
  type TEXT NOT NULL CHECK (type IN ('whitelist','staff','creator','company')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','interview','approved','rejected')),
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  staff_reply TEXT,
  handled_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_discord_id ON applications(discord_id);
CREATE INDEX IF NOT EXISTS idx_applications_type ON applications(type);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
