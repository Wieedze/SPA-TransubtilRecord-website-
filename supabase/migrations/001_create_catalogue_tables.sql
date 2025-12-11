-- =============================================
-- ARTISTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS artists (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  act TEXT NOT NULL,
  description TEXT DEFAULT '',
  style TEXT[] NOT NULL DEFAULT '{}',
  country TEXT NOT NULL,
  image_url TEXT NOT NULL,
  social JSONB DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_artists_slug ON artists(slug);

-- =============================================
-- RELEASES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS releases (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('album', 'ep', 'track', 'compilation')),
  release_date TEXT NOT NULL,
  catalog_number TEXT DEFAULT '',
  cover_url TEXT NOT NULL,
  bandcamp_url TEXT NOT NULL,
  bandcamp_id TEXT NOT NULL,
  description TEXT DEFAULT '',
  tracklist TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_releases_artist ON releases(artist);
CREATE INDEX IF NOT EXISTS idx_releases_type ON releases(type);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;

-- Public can read all artists and releases
CREATE POLICY "Anyone can view artists" ON artists
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view releases" ON releases
  FOR SELECT USING (true);

-- Only admins can insert/update/delete artists
CREATE POLICY "Admins can insert artists" ON artists
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update artists" ON artists
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete artists" ON artists
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can insert/update/delete releases
CREATE POLICY "Admins can insert releases" ON releases
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update releases" ON releases
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete releases" ON releases
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =============================================
-- TRIGGERS FOR updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_artists_updated_at
  BEFORE UPDATE ON artists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_releases_updated_at
  BEFORE UPDATE ON releases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
