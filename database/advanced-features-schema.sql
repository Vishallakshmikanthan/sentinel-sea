-- ============================================
-- ADVANCED FEATURES DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. VESSEL POSITION HISTORY TABLE
-- Tracks vessel movement over time
-- ============================================
CREATE TABLE IF NOT EXISTS vessel_position_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vessel_detection_id UUID REFERENCES vessel_detections(id) ON DELETE CASCADE,
    vessel_id TEXT NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(11, 6) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    speed DECIMAL(6, 2), -- knots
    heading DECIMAL(5, 2), -- degrees (0-360)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vessel_history_vessel_id ON vessel_position_history(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_history_timestamp ON vessel_position_history(timestamp DESC);

-- ============================================
-- 2. CUSTOM ALERT ZONES
-- User-defined restricted/watch zones
--============================================
CREATE TABLE IF NOT EXISTS alert_zones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    zone_type TEXT NOT NULL CHECK (zone_type IN ('forbidden', 'restricted', 'watch', 'patrol')),
    coordinates JSONB NOT NULL, -- GeoJSON polygon coordinates
    description TEXT,
    alert_on_entry BOOLEAN DEFAULT TRUE,
    alert_on_exit BOOLEAN DEFAULT FALSE,
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    active BOOLEAN DEFAULT TRUE,
    color TEXT DEFAULT '#FF6B6B', -- Hex color for map display
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zone_intrusions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    zone_id UUID REFERENCES alert_zones(id) ON DELETE CASCADE,
    vessel_detection_id UUID REFERENCES vessel_detections(id) ON DELETE CASCADE,
    vessel_id TEXT NOT NULL,
    intrusion_type TEXT CHECK (intrusion_type IN ('entry', 'exit')),
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by TEXT,
    acknowledged_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_zone_intrusions_zone ON zone_intrusions(zone_id);
CREATE INDEX IF NOT EXISTS idx_zone_intrusions_vessel ON zone_intrusions(vessel_id);
CREATE INDEX IF NOT EXISTS idx_zone_intrusions_acknowledged ON zone_intrusions(acknowledged);

-- ============================================
-- 3. VESSEL REGISTRY
-- Database of known vessels
-- ============================================
CREATE TABLE IF NOT EXISTS vessel_registry (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vessel_id TEXT UNIQUE NOT NULL,
    vessel_name TEXT,
    vessel_type TEXT CHECK (vessel_type IN ('fishing', 'cargo', 'tanker', 'passenger', 'military', 'research', 'recreational', 'other')),
    flag_country TEXT,
    owner_name TEXT,
    owner_contact TEXT,
    registration_number TEXT,
    length_m DECIMAL(6, 2),
    width_m DECIMAL(6, 2),
    tonnage DECIMAL(10, 2),
    year_built INTEGER,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'decommissioned')),
    trust_level TEXT DEFAULT 'unknown' CHECK (trust_level IN ('whitelisted', 'trusted', 'unknown', 'suspicious', 'blacklisted')),
    notes TEXT,
    image_url TEXT,
    last_seen TIMESTAMPTZ,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vessel_registry_vessel_id ON vessel_registry(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_registry_trust_level ON vessel_registry(trust_level);
CREATE INDEX IF NOT EXISTS idx_vessel_registry_type ON vessel_registry(vessel_type);

-- ============================================
-- 4. AUTOMATED REPORTS
-- Generated surveillance reports
-- ============================================
CREATE TABLE IF NOT EXISTS generated_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_type TEXT NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'custom', 'incident')),
    report_title TEXT NOT NULL,
    date_from TIMESTAMPTZ NOT NULL,
    date_to TIMESTAMPTZ NOT NULL,
    summary TEXT,
    total_detections INTEGER DEFAULT 0,
    high_threat_count INTEGER DEFAULT 0,
    mpa_intrusions INTEGER DEFAULT 0,
    dark_vessels INTEGER DEFAULT 0,
    avg_threat_score DECIMAL(5, 2),
    report_data JSONB, -- Full report data/statistics
    generated_by TEXT,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_type ON generated_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_date ON generated_reports(generated_at DESC);

-- ============================================
-- 5. DETECTION BOOKMARKS
-- User-saved important detections
-- ============================================
CREATE TABLE IF NOT EXISTS detection_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vessel_detection_id UUID REFERENCES vessel_detections(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON detection_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_detection ON detection_bookmarks(vessel_detection_id);

-- ============================================
-- 6. DETECTION TAGS
-- Categorize detections
-- ============================================
CREATE TABLE IF NOT EXISTS detection_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vessel_detection_id UUID REFERENCES vessel_detections(id) ON DELETE CASCADE,
    tag TEXT NOT NULL CHECK (tag IN ('fishing', 'cargo', 'suspicious', 'verified', 'false_positive', 'follow_up_required', 'priority', 'other')),
    added_by TEXT,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(vessel_detection_id, tag) -- Prevent duplicate tags
);

CREATE INDEX IF NOT EXISTS idx_tags_detection ON detection_tags(vessel_detection_id);
CREATE INDEX IF NOT EXISTS idx_tags_tag ON detection_tags(tag);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE vessel_position_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE zone_intrusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vessel_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE detection_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE detection_tags ENABLE ROW LEVEL SECURITY;

-- Vessel Position History - Public access for demo
CREATE POLICY "Allow public read access to vessel history"
    ON vessel_position_history FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert to vessel history"
    ON vessel_position_history FOR INSERT
    WITH CHECK (true);

-- Alert Zones - Public access for demo
CREATE POLICY "Allow public read access to alert zones"
    ON alert_zones FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert to alert zones"
    ON alert_zones FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update to alert zones"
    ON alert_zones FOR UPDATE
    USING (true);

CREATE POLICY "Allow public delete from alert zones"
    ON alert_zones FOR DELETE
    USING (true);

-- Zone Intrusions - Public access
CREATE POLICY "Allow public read access to intrusions"
    ON zone_intrusions FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert to intrusions"
    ON zone_intrusions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update to intrusions"
    ON zone_intrusions FOR UPDATE
    USING (true);

-- Vessel Registry - Public access
CREATE POLICY "Allow public read access to vessel registry"
    ON vessel_registry FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert to vessel registry"
    ON vessel_registry FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update to vessel registry"
    ON vessel_registry FOR UPDATE
    USING (true);

CREATE POLICY "Allow public delete from vessel registry"
    ON vessel_registry FOR DELETE
    USING (true);

-- Generated Reports - Public access
CREATE POLICY "Allow public read access to reports"
    ON generated_reports FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert to reports"
    ON generated_reports FOR INSERT
    WITH CHECK (true);

-- Bookmarks - Public access
CREATE POLICY "Allow public read access to bookmarks"
    ON detection_bookmarks FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert to bookmarks"
    ON detection_bookmarks FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public delete from bookmarks"
    ON detection_bookmarks FOR DELETE
    USING (true);

-- Tags - Public access
CREATE POLICY "Allow public read access to tags"
    ON detection_tags FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert to tags"
    ON detection_tags FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public delete from tags"
    ON detection_tags FOR DELETE
    USING (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to auto-create position history from detections
CREATE OR REPLACE FUNCTION create_position_history_from_detection()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO vessel_position_history (
        vessel_detection_id,
        vessel_id,
        latitude,
        longitude,
        timestamp
    ) VALUES (
        NEW.id,
        NEW.vessel_id,
        NEW.latitude,
        NEW.longitude,
        NEW.timestamp
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-populate position history
DROP TRIGGER IF EXISTS trigger_create_position_history ON vessel_detections;
CREATE TRIGGER trigger_create_position_history
    AFTER INSERT ON vessel_detections
    FOR EACH ROW
    EXECUTE FUNCTION create_position_history_from_detection();

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Sample Alert Zone (Gulf of Mannar Restricted Zone)
INSERT INTO alert_zones (name, zone_type, coordinates, description, severity, color)
VALUES (
    'Gulf of Mannar No-Entry Zone',
    'forbidden',
    '[[8.9, 78.9], [8.9, 79.2], [8.7, 79.2], [8.7, 78.9], [8.9, 78.9]]'::jsonb,
    'Critical marine biodiversity area - No fishing or transit allowed',
    'critical',
    '#FF0000'
) ON CONFLICT DO NOTHING;

-- Sample Vessel Registry Entries
INSERT INTO vessel_registry (vessel_id, vessel_name, vessel_type, flag_country, trust_level, length_m)
VALUES 
(
    'VSL-20260130-A001',
    'Sea Guardian',
    'fishing',
    'India',
    'suspicious',
    45.5
),
(
    'VSL-20260130-A002',
    'Ocean Explorer',
    'cargo',
    'Singapore',
    'trusted',
    120.0
)
ON CONFLICT (vessel_id) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'vessel_position_history',
    'alert_zones',
    'zone_intrusions',
    'vessel_registry',
    'generated_reports',
    'detection_bookmarks',
    'detection_tags'
);

-- Verify RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
    'vessel_position_history',
    'alert_zones',
    'zone_intrusions',
    'vessel_registry',
    'generated_reports',
    'detection_bookmarks',
    'detection_tags'
);

-- ============================================
-- SUCCESS!
-- All tables created and ready to use
-- ============================================
