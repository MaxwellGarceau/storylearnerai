-- Create language_pair_prompts table for from->to language specific configurations
CREATE TABLE IF NOT EXISTS language_pair_prompts (
    id SERIAL PRIMARY KEY,
    from_language_id INTEGER NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
    to_language_id INTEGER NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
    difficulty_level_id INTEGER NOT NULL REFERENCES difficulty_levels(id) ON DELETE CASCADE,
    
    -- Core prompt instructions
    vocabulary TEXT,
    grammar TEXT,
    cultural TEXT,
    style TEXT,
    examples TEXT,
    
    -- Language-specific considerations
    grammar_focus TEXT, -- Specific grammar challenges for this language pair
    pronunciation_notes TEXT, -- Pronunciation challenges
    common_mistakes TEXT, -- Common mistakes speakers of from_language make
    helpful_patterns TEXT, -- Patterns that transfer well between languages
    
    -- Learner background considerations (for future use)
    native_language_considerations TEXT, -- How native language affects learning
    known_languages_benefits TEXT, -- Benefits from knowing other languages
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(from_language_id, to_language_id, difficulty_level_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_language_pair_prompts_from_language ON language_pair_prompts(from_language_id);
CREATE INDEX IF NOT EXISTS idx_language_pair_prompts_to_language ON language_pair_prompts(to_language_id);
CREATE INDEX IF NOT EXISTS idx_language_pair_prompts_difficulty ON language_pair_prompts(difficulty_level_id);
CREATE INDEX IF NOT EXISTS idx_language_pair_prompts_from_to_difficulty ON language_pair_prompts(from_language_id, to_language_id, difficulty_level_id);

-- Create trigger for updated_at
CREATE TRIGGER update_language_pair_prompts_updated_at BEFORE UPDATE ON language_pair_prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert language pair configurations for English -> Spanish (A1-B2)
INSERT INTO language_pair_prompts (from_language_id, to_language_id, difficulty_level_id, vocabulary, grammar, cultural, style, examples, grammar_focus, pronunciation_notes, common_mistakes, helpful_patterns) 
SELECT 
    l1.id as from_language_id,
    l2.id as to_language_id,
    dl.id as difficulty_level_id,
    CASE dl.code
        WHEN 'a1' THEN 'Use only the most common 1000 Spanish words. Replace complex words with simple alternatives. Focus on cognates that exist between English and Spanish.'
        WHEN 'a2' THEN 'Use common vocabulary (top 2000 words). Introduce some descriptive adjectives and adverbs. Leverage English-Spanish cognates when possible.'
        WHEN 'b1' THEN 'Use intermediate vocabulary (top 3000 words). Include more varied adjectives, adverbs, and some phrasal verbs. Use false cognates carefully.'
        WHEN 'b2' THEN 'Use upper-intermediate vocabulary (top 5000 words). Include advanced adjectives, abstract nouns, and idiomatic expressions. Master false cognates.'
    END as vocabulary,
    CASE dl.code
        WHEN 'a1' THEN 'Focus on present tense conjugations. English speakers struggle with verb conjugations - emphasize the pattern. Use only present simple, past simple, and present continuous equivalents.'
        WHEN 'a2' THEN 'Introduce past tense conjugations. English speakers need practice with preterite vs imperfect. Include present perfect and future with ''ir a''.'
        WHEN 'b1' THEN 'Work on subjunctive mood introduction. English speakers find this challenging. Use all basic tenses plus conditionals and passive voice.'
        WHEN 'b2' THEN 'Master subjunctive mood and complex verb forms. English speakers need extensive practice with subjunctive triggers and usage.'
    END as grammar,
    CASE dl.code
        WHEN 'a1' THEN 'Explain cultural references in simple terms. Many English speakers are unfamiliar with Spanish-speaking cultures.'
        WHEN 'a2' THEN 'Include basic cultural references with brief explanations. Introduce common cultural concepts from Spanish-speaking countries.'
        WHEN 'b1' THEN 'Include cultural references with context. Maintain idiomatic expressions where appropriate for learning.'
        WHEN 'b2' THEN 'Preserve cultural nuances and idiomatic expressions. Include subtle cultural references and regional variations.'
    END as cultural,
    CASE dl.code
        WHEN 'a1' THEN 'Use very short sentences (5-10 words). English speakers need to adjust to Spanish sentence structure.'
        WHEN 'a2' THEN 'Mix short and medium-length sentences. Use some basic connecting words. Practice Spanish word order.'
        WHEN 'b1' THEN 'Use varied sentence lengths and structures. Include some complex sentences with multiple clauses.'
        WHEN 'b2' THEN 'Use sophisticated sentence structures with embedded clauses. Vary sentence length for rhythm and emphasis.'
    END as style,
    CASE dl.code
        WHEN 'a1' THEN 'Replace ''The magnificent castle stood proudly'' with ''El castillo grande era muy alto''. Show how English word order translates to Spanish.'
        WHEN 'a2' THEN 'Replace ''He was utterly devastated'' with ''Estaba muy triste y molesto''. Demonstrate adjective placement differences.'
        WHEN 'b1' THEN 'Can use ''He was devastated by the news'' or ''El castillo antiguo dominaba el paisaje''. Show more complex structures.'
        WHEN 'b2' THEN 'Can use ''He was utterly devastated'' or ''La magnífica fortaleza dominaba todo el valle''. Demonstrate advanced vocabulary.'
    END as examples,
    CASE dl.code
        WHEN 'a1' THEN 'Verb conjugations are the biggest challenge. English has minimal conjugation, Spanish has extensive. Focus on regular -ar, -er, -ir patterns.'
        WHEN 'a2' THEN 'Preterite vs imperfect distinction. English speakers struggle with this concept. Practice with clear examples.'
        WHEN 'b1' THEN 'Subjunctive mood introduction. This doesn''t exist in English. Start with common triggers like ''es importante que''.'
        WHEN 'b2' THEN 'Advanced subjunctive usage and complex verb forms. Master all subjunctive triggers and irregular forms.'
    END as grammar_focus,
    CASE dl.code
        WHEN 'a1' THEN 'Rolling ''r'' sound and Spanish vowels. English speakers need practice with these sounds.'
        WHEN 'a2' THEN 'Stress patterns and accent marks. English speakers must learn to use accent marks correctly.'
        WHEN 'b1' THEN 'Intonation patterns and rhythm. Spanish has different rhythm than English.'
        WHEN 'b2' THEN 'Advanced pronunciation including regional variations. Master all Spanish sounds and patterns.'
    END as pronunciation_notes,
    CASE dl.code
        WHEN 'a1' THEN 'Forgetting verb conjugations, using English word order, not using articles correctly.'
        WHEN 'a2' THEN 'Confusing preterite and imperfect, forgetting accent marks, using false cognates incorrectly.'
        WHEN 'b1' THEN 'Avoiding subjunctive, incorrect gender agreement, literal translations from English.'
        WHEN 'b2' THEN 'Overusing subjunctive, not understanding regional variations, poor idiomatic usage.'
    END as common_mistakes,
    CASE dl.code
        WHEN 'a1' THEN 'Many cognates transfer well (hospital/hospital, important/importante). Use these as building blocks.'
        WHEN 'a2' THEN 'Some grammar concepts transfer (subject-verb agreement). Build on these similarities.'
        WHEN 'b1' THEN 'Complex sentence structures can be adapted. Learn to think in Spanish patterns.'
        WHEN 'b2' THEN 'Advanced vocabulary often has Latin roots. Leverage this knowledge for expansion.'
    END as helpful_patterns
FROM languages l1, languages l2, difficulty_levels dl
WHERE l1.code = 'en' AND l2.code = 'es' AND dl.code IN ('a1', 'a2', 'b1', 'b2')
ON CONFLICT (from_language_id, to_language_id, difficulty_level_id) DO NOTHING;

-- Insert language pair configurations for Spanish -> English (A1-B2)
INSERT INTO language_pair_prompts (from_language_id, to_language_id, difficulty_level_id, vocabulary, grammar, cultural, style, examples, grammar_focus, pronunciation_notes, common_mistakes, helpful_patterns) 
SELECT 
    l1.id as from_language_id,
    l2.id as to_language_id,
    dl.id as difficulty_level_id,
    CASE dl.code
        WHEN 'a1' THEN 'Use only the most common 1000 English words. Replace complex words with simple alternatives. Leverage Spanish-English cognates.'
        WHEN 'a2' THEN 'Use common vocabulary (top 2000 words). Introduce some descriptive adjectives and adverbs. Use cognates strategically.'
        WHEN 'b1' THEN 'Use intermediate vocabulary (top 3000 words). Include more varied adjectives, adverbs, and some phrasal verbs.'
        WHEN 'b2' THEN 'Use upper-intermediate vocabulary (top 5000 words). Include advanced adjectives, abstract nouns, and idiomatic expressions.'
    END as vocabulary,
    CASE dl.code
        WHEN 'a1' THEN 'Simplify verb conjugations. Spanish speakers are used to complex conjugations - English is much simpler. Focus on basic tenses.'
        WHEN 'a2' THEN 'Introduce English verb patterns. Spanish speakers need to learn English auxiliary verbs and modal verbs.'
        WHEN 'b1' THEN 'Work on English phrasal verbs. These don''t exist in Spanish and are challenging. Use all basic tenses plus conditionals.'
        WHEN 'b2' THEN 'Master complex English verb forms and idiomatic expressions. Focus on advanced tenses and structures.'
    END as grammar,
    CASE dl.code
        WHEN 'a1' THEN 'Explain cultural references in simple terms. Many Spanish speakers are unfamiliar with English-speaking cultures.'
        WHEN 'a2' THEN 'Include basic cultural references with brief explanations. Introduce common cultural concepts from English-speaking countries.'
        WHEN 'b1' THEN 'Include cultural references with context. Maintain idiomatic expressions where appropriate for learning.'
        WHEN 'b2' THEN 'Preserve cultural nuances and idiomatic expressions. Include subtle cultural references and regional variations.'
    END as cultural,
    CASE dl.code
        WHEN 'a1' THEN 'Use very short sentences (5-10 words). Spanish speakers need to adjust to English sentence structure.'
        WHEN 'a2' THEN 'Mix short and medium-length sentences. Use some basic connecting words. Practice English word order.'
        WHEN 'b1' THEN 'Use varied sentence lengths and structures. Include some complex sentences with multiple clauses.'
        WHEN 'b2' THEN 'Use sophisticated sentence structures with embedded clauses. Vary sentence length for rhythm and emphasis.'
    END as style,
    CASE dl.code
        WHEN 'a1' THEN 'Replace ''El magnífico castillo se alzaba orgulloso'' with ''The big castle was very tall''. Show how Spanish word order translates to English.'
        WHEN 'a2' THEN 'Replace ''Estaba completamente devastado'' with ''He was very sad and upset''. Demonstrate adjective placement differences.'
        WHEN 'b1' THEN 'Can use ''Estaba devastado por la noticia'' or ''The ancient castle dominated the landscape''. Show more complex structures.'
        WHEN 'b2' THEN 'Can use ''Estaba completamente devastado'' or ''The magnificent fortress commanded the entire valley''. Demonstrate advanced vocabulary.'
    END as examples,
    CASE dl.code
        WHEN 'a1' THEN 'Verb conjugations are much simpler in English. Spanish speakers need to unlearn complex conjugation patterns.'
        WHEN 'a2' THEN 'Auxiliary verbs and modal verbs. These don''t exist in Spanish. Practice with ''do'', ''have'', ''will'', ''can''.'
        WHEN 'b1' THEN 'Phrasal verbs introduction. These are completely foreign to Spanish speakers. Start with common ones like ''look up''.'
        WHEN 'b2' THEN 'Advanced phrasal verbs and idiomatic expressions. Master complex verb combinations and idioms.'
    END as grammar_focus,
    CASE dl.code
        WHEN 'a1' THEN 'English vowel sounds and stress patterns. Spanish speakers need practice with English pronunciation.'
        WHEN 'a2' THEN 'English consonant clusters and rhythm. Spanish has different rhythm than English.'
        WHEN 'b1' THEN 'Intonation patterns and word stress. English has more varied stress patterns than Spanish.'
        WHEN 'b2' THEN 'Advanced pronunciation including regional variations. Master all English sounds and patterns.'
    END as pronunciation_notes,
    CASE dl.code
        WHEN 'a1' THEN 'Over-conjugating verbs, using Spanish word order, forgetting articles.'
        WHEN 'a2' THEN 'Confusing auxiliary verbs, forgetting to use ''do'' in questions, literal translations from Spanish.'
        WHEN 'b1' THEN 'Avoiding phrasal verbs, incorrect word order, using Spanish grammar patterns.'
        WHEN 'b2' THEN 'Overusing formal language, not understanding idioms, poor phrasal verb usage.'
    END as common_mistakes,
    CASE dl.code
        WHEN 'a1' THEN 'Many cognates transfer well (hospital/hospital, important/importante). Use these as building blocks.'
        WHEN 'a2' THEN 'Some grammar concepts transfer (subject-verb agreement). Build on these similarities.'
        WHEN 'b1' THEN 'Complex sentence structures can be adapted. Learn to think in English patterns.'
        WHEN 'b2' THEN 'Advanced vocabulary often has Latin roots. Leverage this knowledge for expansion.'
    END as helpful_patterns
FROM languages l1, languages l2, difficulty_levels dl
WHERE l1.code = 'es' AND l2.code = 'en' AND dl.code IN ('a1', 'a2', 'b1', 'b2')
ON CONFLICT (from_language_id, to_language_id, difficulty_level_id) DO NOTHING;

 