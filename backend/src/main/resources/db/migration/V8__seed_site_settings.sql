-- Seed a default site_settings row if none exists
INSERT INTO site_settings (
    site_title, site_description, owner_name, headline, short_bio, created_at, updated_at
)
SELECT
    'BasharDev',
    'Personal portfolio and blog',
    'Bashar Khan',
    'Software Developer',
    'Full-stack developer building modern web applications.',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- Remove duplicate rows if any crept in (keep the one with the lowest id)
DELETE FROM site_settings
WHERE id != (SELECT min_id FROM (SELECT MIN(id) AS min_id FROM site_settings) AS s);

-- Enforce singleton: only one row allowed in this table from now on
CREATE UNIQUE INDEX idx_site_settings_singleton ON site_settings ((1));
