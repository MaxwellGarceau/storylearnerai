-- Create vocabulary table
CREATE TABLE IF NOT EXISTS vocabulary (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    from_word VARCHAR(255) NOT NULL,
    target_word VARCHAR(255) NOT NULL,
    target_language_id INTEGER NOT NULL REFERENCES languages(id),
    from_language_id INTEGER NOT NULL REFERENCES languages(id),
    from_word_context TEXT, -- Context sentence where the from word appears
    target_word_context TEXT, -- Context sentence where the target word appears
    definition TEXT, -- Definition of the word
    part_of_speech VARCHAR(50), -- Part of speech (noun, verb, adjective, etc.)
    frequency_level VARCHAR(50), -- Frequency/level (common, rare, etc.)
    translation_id UUID REFERENCES translations(id) ON DELETE SET NULL, -- Optional link to the translation where this word was found
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vocabulary_user_id ON vocabulary(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_created_at ON vocabulary(created_at);
CREATE INDEX IF NOT EXISTS idx_vocabulary_target_language ON vocabulary(target_language_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_from_language ON vocabulary(from_language_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_translation ON vocabulary(translation_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_from_word ON vocabulary(from_word);
CREATE INDEX IF NOT EXISTS idx_vocabulary_target_word ON vocabulary(target_word);

-- Create unique constraint to prevent duplicate vocabulary entries for the same user
CREATE UNIQUE INDEX IF NOT EXISTS idx_vocabulary_user_word_unique 
ON vocabulary(user_id, from_word, target_word, target_language_id, from_language_id);

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
