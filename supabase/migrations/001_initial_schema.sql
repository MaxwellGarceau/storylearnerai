-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    language VARCHAR(10) NOT NULL,
    difficulty_level VARCHAR(20) NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
    id SERIAL PRIMARY KEY,
    story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    target_language VARCHAR(10) NOT NULL,
    translated_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, target_language)
);



-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stories_language ON stories(language);
CREATE INDEX IF NOT EXISTS idx_stories_difficulty ON stories(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at);

CREATE INDEX IF NOT EXISTS idx_translations_story_id ON translations(story_id);
CREATE INDEX IF NOT EXISTS idx_translations_target_language ON translations(target_language);



-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_translations_updated_at BEFORE UPDATE ON translations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



-- Insert some sample data
INSERT INTO stories (title, content, language, difficulty_level) VALUES
('The Little Red Hen', 'Once upon a time, there was a little red hen who lived on a farm. She found some wheat seeds and decided to plant them. She asked her friends, the cat, the dog, and the pig, "Who will help me plant these seeds?" But they all said, "Not I!" So the little red hen planted the seeds herself.', 'en', 'beginner'),
('The Three Little Pigs', 'Once there were three little pigs who set out to seek their fortune. The first pig built his house of straw, the second built his house of sticks, and the third built his house of bricks. When the big bad wolf came, only the house of bricks stood strong.', 'en', 'beginner'),
('The Tortoise and the Hare', 'A hare was boasting about how fast he could run. He laughed at the tortoise for being so slow. The tortoise challenged the hare to a race. The hare ran fast but stopped to rest, thinking he had plenty of time. The tortoise kept going slowly and steadily, and won the race.', 'en', 'intermediate')
ON CONFLICT DO NOTHING; 