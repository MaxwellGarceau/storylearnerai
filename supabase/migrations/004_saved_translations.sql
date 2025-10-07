-- Main translations table
CREATE TABLE IF NOT EXISTS translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_language VARCHAR(10) NOT NULL,  -- en, es, etc.
    to_language VARCHAR(10) NOT NULL,
    original_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    difficulty_level VARCHAR(10),  -- A1, A2, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_translations_created_at ON translations(created_at);
CREATE INDEX IF NOT EXISTS idx_translations_from_language ON translations(from_language);
CREATE INDEX IF NOT EXISTS idx_translations_to_language ON translations(to_language);
CREATE INDEX IF NOT EXISTS idx_translations_difficulty ON translations(difficulty_level);

-- Trigger for updated_at on translations
CREATE TRIGGER update_translations_updated_at BEFORE UPDATE ON translations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();