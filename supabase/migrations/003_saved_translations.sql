-- Create languages lookup table
CREATE TABLE IF NOT EXISTS languages (
    id SERIAL PRIMARY KEY,
    code VARCHAR(2) UNIQUE NOT NULL, -- ISO 639-1 language codes (e.g., 'en', 'es', 'fr')
    name VARCHAR(100) NOT NULL, -- Full language name (e.g., 'English', 'Spanish', 'French')
    native_name VARCHAR(100), -- Name in the native language
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create difficulty_levels lookup table
CREATE TABLE IF NOT EXISTS difficulty_levels (
    id SERIAL PRIMARY KEY,
    code VARCHAR(2) UNIQUE NOT NULL, -- Internal code (e.g., 'a1', 'a2', 'b1', 'b2')
    name VARCHAR(50) NOT NULL, -- Display name (e.g., 'Beginner', 'Intermediate', 'Advanced')
    description TEXT, -- Optional description
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved_translations table
CREATE TABLE IF NOT EXISTS saved_translations (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    original_story TEXT NOT NULL,
    translated_story TEXT NOT NULL,
    original_language_id INTEGER NOT NULL REFERENCES languages(id),
    translated_language_id INTEGER NOT NULL REFERENCES languages(id),
    difficulty_level_id INTEGER NOT NULL REFERENCES difficulty_levels(id),
    title VARCHAR(255), -- Optional title for the saved translation
    notes TEXT, -- Optional user notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_languages_code ON languages(code);
CREATE INDEX IF NOT EXISTS idx_difficulty_levels_code ON difficulty_levels(code);
CREATE INDEX IF NOT EXISTS idx_saved_translations_user_id ON saved_translations(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_translations_created_at ON saved_translations(created_at);
CREATE INDEX IF NOT EXISTS idx_saved_translations_original_language ON saved_translations(original_language_id);
CREATE INDEX IF NOT EXISTS idx_saved_translations_translated_language ON saved_translations(translated_language_id);
CREATE INDEX IF NOT EXISTS idx_saved_translations_difficulty ON saved_translations(difficulty_level_id);

-- Create trigger for updated_at on saved_translations
CREATE TRIGGER update_saved_translations_updated_at BEFORE UPDATE ON saved_translations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on saved_translations
ALTER TABLE saved_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_translations
CREATE POLICY "Users can view their own saved translations" ON saved_translations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved translations" ON saved_translations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved translations" ON saved_translations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved translations" ON saved_translations
    FOR DELETE USING (auth.uid() = user_id);

-- Insert essential languages
INSERT INTO languages (code, name, native_name) VALUES
('en', 'English', 'English'),
('es', 'Spanish', 'Español')
ON CONFLICT (code) DO NOTHING;

-- Insert difficulty levels
INSERT INTO difficulty_levels (code, name, description) VALUES
('a1', 'A1 (Beginner)', 'Basic level - Can understand and use familiar everyday expressions and very basic phrases'),
('a2', 'A2 (Elementary)', 'Elementary level - Can communicate in simple and routine tasks requiring simple information exchange'),
('b1', 'B1 (Intermediate)', 'Intermediate level - Can deal with most situations likely to arise while traveling'),
('b2', 'B2 (Upper Intermediate)', 'Upper intermediate level - Can interact with a degree of fluency and spontaneity')
ON CONFLICT (code) DO NOTHING; 