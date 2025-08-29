-- Create difficulty_levels lookup table
CREATE TABLE IF NOT EXISTS difficulty_levels (
    id SERIAL PRIMARY KEY,
    code VARCHAR(2) UNIQUE NOT NULL, -- Internal code (e.g., 'a1', 'a2', 'b1', 'b2')
    name VARCHAR(50) NOT NULL, -- Display name (e.g., 'Beginner', 'Intermediate', 'Advanced')
    description TEXT, -- Optional description
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_difficulty_levels_code ON difficulty_levels(code);

-- Insert difficulty levels
INSERT INTO difficulty_levels (code, name, description) VALUES
('a1', 'A1 (Beginner)', 'Basic level - Can understand and use familiar everyday expressions and very basic phrases'),
('a2', 'A2 (Elementary)', 'Elementary level - Can communicate in simple and routine tasks requiring simple information exchange'),
('b1', 'B1 (Intermediate)', 'Intermediate level - Can deal with most situations likely to arise while traveling'),
('b2', 'B2 (Upper Intermediate)', 'Upper intermediate level - Can interact with a degree of fluency and spontaneity')
ON CONFLICT (code) DO NOTHING;
