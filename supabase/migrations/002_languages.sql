-- Create languages lookup table
CREATE TABLE IF NOT EXISTS languages (
    id SERIAL PRIMARY KEY,
    code VARCHAR(2) UNIQUE NOT NULL, -- ISO 639-1 language codes (e.g., 'en', 'es', 'fr')
    name VARCHAR(100) NOT NULL, -- Full language name (e.g., 'English', 'Spanish', 'French')
    native_name VARCHAR(100) NOT NULL, -- Name in the native language
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_languages_code ON languages(code);

-- Insert essential languages
INSERT INTO languages (code, name, native_name) VALUES
('en', 'English', 'English'),
('es', 'Spanish', 'Español')
ON CONFLICT (code) DO NOTHING;
