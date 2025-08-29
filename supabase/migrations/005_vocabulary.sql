-- Create vocabulary table
CREATE TABLE IF NOT EXISTS vocabulary (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    original_word VARCHAR(255) NOT NULL,
    translated_word VARCHAR(255) NOT NULL,
    translated_language_id INTEGER NOT NULL REFERENCES languages(id),
    from_language_id INTEGER NOT NULL REFERENCES languages(id),
    original_word_context TEXT, -- Context sentence where the original word appears
    translated_word_context TEXT, -- Context sentence where the translated word appears
    definition TEXT, -- Definition of the word
    part_of_speech VARCHAR(50), -- Part of speech (noun, verb, adjective, etc.)
    frequency_level VARCHAR(50), -- Frequency/level (common, rare, etc.)
    saved_translation_id INTEGER REFERENCES saved_translations(id) ON DELETE SET NULL, -- Optional link to the story where this word was found
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vocabulary_user_id ON vocabulary(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_created_at ON vocabulary(created_at);
CREATE INDEX IF NOT EXISTS idx_vocabulary_translated_language ON vocabulary(translated_language_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_from_language ON vocabulary(from_language_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_saved_translation ON vocabulary(saved_translation_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_original_word ON vocabulary(original_word);
CREATE INDEX IF NOT EXISTS idx_vocabulary_translated_word ON vocabulary(translated_word);

-- Create unique constraint to prevent duplicate vocabulary entries for the same user
CREATE UNIQUE INDEX IF NOT EXISTS idx_vocabulary_user_word_unique 
ON vocabulary(user_id, original_word, translated_word, translated_language_id, from_language_id);

-- Create trigger for updated_at on vocabulary
CREATE TRIGGER update_vocabulary_updated_at BEFORE UPDATE ON vocabulary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on vocabulary
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vocabulary
CREATE POLICY "Users can view their own vocabulary words" ON vocabulary
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vocabulary words" ON vocabulary
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vocabulary words" ON vocabulary
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vocabulary words" ON vocabulary
    FOR DELETE USING (auth.uid() = user_id);
