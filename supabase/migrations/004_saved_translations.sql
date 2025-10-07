-- Main translations table
CREATE TABLE IF NOT EXISTS saved_translations (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    from_language_id INTEGER NOT NULL,
    to_language_id INTEGER NOT NULL,
    original_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    difficulty_level_id INTEGER NOT NULL,
    title VARCHAR(255), -- Optional title for the saved translation
    notes TEXT, -- Optional user notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints with explicit names
    CONSTRAINT saved_translations_from_language_id_fkey 
        FOREIGN KEY (from_language_id) REFERENCES languages(id),
    CONSTRAINT saved_translations_to_language_id_fkey 
        FOREIGN KEY (to_language_id) REFERENCES languages(id),
    CONSTRAINT saved_translations_difficulty_level_id_fkey 
        FOREIGN KEY (difficulty_level_id) REFERENCES difficulty_levels(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_translations_created_at ON saved_translations(created_at);
CREATE INDEX IF NOT EXISTS idx_translations_from_language_id ON saved_translations(from_language_id);
CREATE INDEX IF NOT EXISTS idx_translations_to_language_id ON saved_translations(to_language_id);
CREATE INDEX IF NOT EXISTS idx_translations_difficulty_level_id ON saved_translations(difficulty_level_id);

-- Trigger for updated_at on translations
CREATE TRIGGER update_translations_updated_at BEFORE UPDATE ON saved_translations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();