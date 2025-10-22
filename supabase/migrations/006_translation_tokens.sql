-- Token sequence table (preserves order)
CREATE TABLE IF NOT EXISTS translation_tokens (
    id SERIAL PRIMARY KEY,
    translation_id INTEGER NOT NULL REFERENCES saved_translations(id) ON DELETE CASCADE,
    token_index INTEGER NOT NULL,  -- Critical for order preservation
    token_type VARCHAR(20) NOT NULL,  -- 'word', 'punctuation', 'whitespace'
    
    -- Word-specific fields (nullable for non-word tokens)
    to_word TEXT,
    to_lemma TEXT,
    from_word TEXT,
    from_lemma TEXT,
    pos VARCHAR(50),  -- part of speech
    difficulty VARCHAR(10),
    from_definition TEXT,
    
    -- Generic token value (for punctuation/whitespace)
    token_value TEXT,
    
    -- Constraints
    CONSTRAINT valid_word_token CHECK (
        token_type != 'word' OR (
            to_word IS NOT NULL AND 
            to_lemma IS NOT NULL AND 
            from_word IS NOT NULL
        )
    ),
    CONSTRAINT valid_non_word_token CHECK (
        token_type = 'word' OR token_value IS NOT NULL
    ),
    CONSTRAINT translation_tokens_unique_index UNIQUE (translation_id, token_index)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_translation_tokens_translation_id ON translation_tokens(translation_id);
CREATE INDEX IF NOT EXISTS idx_translation_tokens_lemmas ON translation_tokens(to_lemma) WHERE to_lemma IS NOT NULL;

