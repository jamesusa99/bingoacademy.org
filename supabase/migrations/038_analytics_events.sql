-- First-party analytics events for SEO/GEO conversion attribution

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  page TEXT,
  page_type TEXT,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  attribution JSONB NOT NULL DEFAULT '{}'::jsonb,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_name_created
  ON analytics_events(event_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_channel_created
  ON analytics_events((attribution->>'channel'), created_at DESC)
  WHERE attribution ? 'channel';

CREATE INDEX IF NOT EXISTS idx_analytics_events_conversion
  ON analytics_events((properties->>'conversion_type'), created_at DESC)
  WHERE event_name = 'conversion';

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Inserts via service role API only; no public read
