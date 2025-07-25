-- Update difficulty levels to use CEFR standards
-- This migration updates the difficulty_levels table to use CEFR codes and names

-- First, drop the existing constraint on stories to allow updates
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_difficulty_level_check;

-- Update existing stories to use CEFR difficulty levels
UPDATE stories SET difficulty_level = 'a1' WHERE difficulty_level = 'beginner';
UPDATE stories SET difficulty_level = 'a2' WHERE difficulty_level = 'intermediate';
UPDATE stories SET difficulty_level = 'b1' WHERE difficulty_level = 'advanced';

-- Update the stories table constraint to use CEFR codes
ALTER TABLE stories ADD CONSTRAINT stories_difficulty_level_check
    CHECK (difficulty_level IN ('a1', 'a2', 'b1', 'b2'));

-- Update the difficulty_levels table
UPDATE difficulty_levels SET
    code = 'a1',
    name = 'A1 (Beginner)',
    description = 'Basic level - Can understand and use familiar everyday expressions and very basic phrases'
WHERE code = 'beginner';

UPDATE difficulty_levels SET
    code = 'a2',
    name = 'A2 (Elementary)',
    description = 'Elementary level - Can communicate in simple and routine tasks requiring simple information exchange'
WHERE code = 'intermediate';

UPDATE difficulty_levels SET
    code = 'b1',
    name = 'B1 (Intermediate)',
    description = 'Intermediate level - Can deal with most situations likely to arise while traveling'
WHERE code = 'advanced';

-- Add B2 level if it doesn't exist
INSERT INTO difficulty_levels (code, name, description) VALUES
('b2', 'B2 (Upper Intermediate)', 'Upper intermediate level - Can interact with a degree of fluency and spontaneity')
ON CONFLICT (code) DO NOTHING;

-- Update the constraint to allow CEFR codes
ALTER TABLE difficulty_levels DROP CONSTRAINT IF EXISTS difficulty_levels_code_check;
ALTER TABLE difficulty_levels ADD CONSTRAINT difficulty_levels_code_check
    CHECK (code IN ('a1', 'a2', 'b1', 'b2')); 