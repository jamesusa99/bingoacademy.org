-- Admin platform extension: profiles, video, payments, audit
-- Run after schema.sql. Safe to re-run (IF NOT EXISTS + DROP POLICY IF EXISTS).
-- If profiles / video_assets tables already exist, you can skip this file and run 003–007 only.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'editor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Cloudflare Stream video assets
CREATE TABLE IF NOT EXISTS video_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  cloudflare_uid TEXT UNIQUE,
  playback_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'error')),
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Stripe catalog mirror
CREATE TABLE IF NOT EXISTS stripe_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_product_id TEXT UNIQUE,
  stripe_price_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  amount_cents INT,
  currency TEXT DEFAULT 'usd',
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders / payments
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'canceled')),
  amount_cents INT,
  currency TEXT DEFAULT 'usd',
  product_name TEXT,
  customer_email TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Platform settings (key-value)
CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Admin audit log
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  resource TEXT,
  resource_id TEXT,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_video_assets_status ON video_assets(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Dev-friendly policies (tighten before production)
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_all_dev" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
-- Do NOT add inline "SELECT FROM profiles" admin policy here — causes infinite RLS recursion.
-- Use migration 005 + 006 (is_admin_or_editor SECURITY DEFINER) instead.
CREATE POLICY "profiles_all_dev" ON profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "video_assets_read" ON video_assets;
DROP POLICY IF EXISTS "video_assets_write" ON video_assets;
CREATE POLICY "video_assets_read" ON video_assets FOR SELECT USING (true);
CREATE POLICY "video_assets_write" ON video_assets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "stripe_products_read" ON stripe_products;
DROP POLICY IF EXISTS "stripe_products_write" ON stripe_products;
CREATE POLICY "stripe_products_read" ON stripe_products FOR SELECT USING (true);
CREATE POLICY "stripe_products_write" ON stripe_products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "orders_read_own" ON orders;
DROP POLICY IF EXISTS "orders_write" ON orders;
CREATE POLICY "orders_read_own" ON orders FOR SELECT USING (auth.uid() = user_id OR true);
CREATE POLICY "orders_write" ON orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "platform_settings_read" ON platform_settings;
DROP POLICY IF EXISTS "platform_settings_write" ON platform_settings;
CREATE POLICY "platform_settings_read" ON platform_settings FOR SELECT USING (true);
CREATE POLICY "platform_settings_write" ON platform_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_audit_read" ON admin_audit_log;
DROP POLICY IF EXISTS "admin_audit_insert" ON admin_audit_log;
CREATE POLICY "admin_audit_read" ON admin_audit_log FOR SELECT USING (true);
CREATE POLICY "admin_audit_insert" ON admin_audit_log FOR INSERT WITH CHECK (true);
