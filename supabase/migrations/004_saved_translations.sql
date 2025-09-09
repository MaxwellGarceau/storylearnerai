-- Create saved_translations table
CREATE TABLE IF NOT EXISTS saved_translations (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    from_story TEXT NOT NULL,
    target_story TEXT NOT NULL,
    from_language_id INTEGER NOT NULL REFERENCES languages(id),
    target_language_id INTEGER NOT NULL REFERENCES languages(id),
    difficulty_level_id INTEGER NOT NULL REFERENCES difficulty_levels(id),
    title VARCHAR(255), -- Optional title for the saved translation
    notes TEXT, -- Optional user notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_translations_user_id ON saved_translations(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_translations_created_at ON saved_translations(created_at);
CREATE INDEX IF NOT EXISTS idx_saved_translations_from_language ON saved_translations(from_language_id);
CREATE INDEX IF NOT EXISTS idx_saved_translations_target_language ON saved_translations(target_language_id);
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