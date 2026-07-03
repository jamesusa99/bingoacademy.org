-- Marketing leads from channel landing pages (whitepaper, etc.)

CREATE TABLE IF NOT EXISTS marketing_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  name TEXT,
  source TEXT NOT NULL DEFAULT 'unknown',
  campaign TEXT,
  page TEXT,
  utm JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketing_leads_email ON marketing_leads(email);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_source_created ON marketing_leads(source, created_at DESC);

ALTER TABLE marketing_leads ENABLE ROW LEVEL SECURITY;

-- No public read; inserts via service role API only
