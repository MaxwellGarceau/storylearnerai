-- Create prompt_configurations table to store language-specific prompt instructions
CREATE TABLE IF NOT EXISTS prompt_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
    difficulty_level_id UUID NOT NULL REFERENCES difficulty_levels(id) ON DELETE CASCADE,
    vocabulary TEXT,
    grammar TEXT,
    cultural TEXT,
    style TEXT,
    examples TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(language_id, difficulty_level_id)
);

-- Create prompt_templates table to store general prompt templates
CREATE TABLE IF NOT EXISTS prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'translation', 'story_generation', etc.
    template TEXT NOT NULL,
    general_instructions TEXT[], -- Array of general instructions
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prompt_configurations_language ON prompt_configurations(language_id);
CREATE INDEX IF NOT EXISTS idx_prompt_configurations_difficulty ON prompt_configurations(difficulty_level_id);
CREATE INDEX IF NOT EXISTS idx_prompt_configurations_language_difficulty ON prompt_configurations(language_id, difficulty_level_id);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_name ON prompt_templates(name);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_active ON prompt_templates(is_active);

-- Create triggers for updated_at
CREATE TRIGGER update_prompt_configurations_updated_at BEFORE UPDATE ON prompt_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompt_templates_updated_at BEFORE UPDATE ON prompt_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default prompt template
INSERT INTO prompt_templates (name, template, general_instructions) VALUES
('translation', 
 'Translate the following {fromLanguage} story to {toLanguage}, adapted for {difficulty} CEFR level:

Instructions:
{instructions}

Specific {toLanguage} Guidelines:
{languageInstructions}

{fromLanguage} Story:
{text}

Please provide only the {toLanguage} translation.',
 ARRAY[
   'Maintain the story''s meaning and narrative flow',
   'Preserve cultural context where appropriate',
   'Keep the story engaging and readable',
   'Provide only the translation without additional commentary'
 ]
) ON CONFLICT (name) DO NOTHING;

-- Insert prompt configurations for English (A1-B2)
INSERT INTO prompt_configurations (language_id, difficulty_level_id, vocabulary, grammar, cultural, style, examples) 
SELECT 
    l.id as language_id,
    dl.id as difficulty_level_id,
    CASE dl.code
        WHEN 'a1' THEN 'Use only the most common 1000 English words. Replace complex words with simple alternatives (e.g., ''big'' instead of ''enormous'')'
        WHEN 'a2' THEN 'Use common vocabulary (top 2000 words). Introduce some descriptive adjectives and adverbs but keep them simple'
        WHEN 'b1' THEN 'Use intermediate vocabulary (top 3000 words). Include more varied adjectives, adverbs, and some phrasal verbs'
        WHEN 'b2' THEN 'Use upper-intermediate vocabulary (top 5000 words). Include advanced adjectives, abstract nouns, and idiomatic expressions'
    END as vocabulary,
    CASE dl.code
        WHEN 'a1' THEN 'Use only present simple, past simple, and present continuous tenses. Keep sentences short and simple with basic subject-verb-object structure'
        WHEN 'a2' THEN 'Include past simple, present perfect, and future with ''will''. Use some compound sentences with ''and'', ''but'', ''because'''
        WHEN 'b1' THEN 'Use all basic tenses plus conditionals and passive voice. Include relative clauses and more complex sentence structures'
        WHEN 'b2' THEN 'Use advanced tenses, subjunctive mood, and complex conditional structures. Include sophisticated connecting devices'
    END as grammar,
    CASE dl.code
        WHEN 'a1' THEN 'Explain cultural references in simple terms or replace with more universal concepts'
        WHEN 'a2' THEN 'Include basic cultural references with brief explanations when needed'
        WHEN 'b1' THEN 'Include cultural references with context. Maintain idiomatic expressions where appropriate for learning'
        WHEN 'b2' THEN 'Preserve cultural nuances and idiomatic expressions. Include subtle cultural references'
    END as cultural,
    CASE dl.code
        WHEN 'a1' THEN 'Use very short sentences (5-10 words). Avoid compound and complex sentences'
        WHEN 'a2' THEN 'Mix short and medium-length sentences. Use some basic connecting words'
        WHEN 'b1' THEN 'Use varied sentence lengths and structures. Include some complex sentences with multiple clauses'
        WHEN 'b2' THEN 'Use sophisticated sentence structures with embedded clauses. Vary sentence length for rhythm and emphasis'
    END as style,
    CASE dl.code
        WHEN 'a1' THEN 'Replace ''The magnificent castle stood proudly'' with ''The big castle was very tall'''
        WHEN 'a2' THEN 'Replace ''He was utterly devastated'' with ''He was very sad and upset'''
        WHEN 'b1' THEN 'Can use ''He was devastated by the news'' or ''The ancient castle dominated the landscape'''
        WHEN 'b2' THEN 'Can use ''He was utterly devastated'' or ''The magnificent fortress commanded the entire valley'''
    END as examples
FROM languages l, difficulty_levels dl
WHERE l.code = 'en' AND dl.code IN ('a1', 'a2', 'b1', 'b2')
ON CONFLICT (language_id, difficulty_level_id) DO NOTHING;

-- Insert prompt configurations for Spanish (A1-B2)
INSERT INTO prompt_configurations (language_id, difficulty_level_id, vocabulary, grammar, cultural, style, examples) 
SELECT 
    l.id as language_id,
    dl.id as difficulty_level_id,
    CASE dl.code
        WHEN 'a1' THEN 'Usa solo las 1000 palabras más comunes en español. Reemplaza palabras complejas con alternativas simples'
        WHEN 'a2' THEN 'Usa vocabulario común (top 2000 palabras). Introduce algunos adjetivos y adverbios descriptivos simples'
        WHEN 'b1' THEN 'Usa vocabulario intermedio (top 3000 palabras). Incluye adjetivos y adverbios más variados, y algunos verbos con preposición'
        WHEN 'b2' THEN 'Usa vocabulario intermedio-alto (top 5000 palabras). Incluye adjetivos avanzados, sustantivos abstractos y expresiones idiomáticas'
    END as vocabulary,
    CASE dl.code
        WHEN 'a1' THEN 'Usa solo presente, pretérito perfecto simple y presente continuo. Mantén oraciones cortas y simples'
        WHEN 'a2' THEN 'Incluye pretérito perfecto simple, presente perfecto y futuro con ''va a'' o futuro simple. Usa oraciones compuestas con ''y'', ''pero'', ''porque'''
        WHEN 'b1' THEN 'Usa todos los tiempos básicos más condicionales y voz pasiva. Incluye cláusulas relativas y estructuras oracionales más complejas'
        WHEN 'b2' THEN 'Usa tiempos avanzados, modo subjuntivo y estructuras condicionales complejas. Incluye conectores sofisticados'
    END as grammar,
    CASE dl.code
        WHEN 'a1' THEN 'Explica referencias culturales en términos simples o reemplázalas con conceptos más universales'
        WHEN 'a2' THEN 'Incluye referencias culturales básicas con breves explicaciones cuando sea necesario'
        WHEN 'b1' THEN 'Incluye referencias culturales con contexto. Mantén expresiones idiomáticas apropiadas para el aprendizaje'
        WHEN 'b2' THEN 'Preserva matices culturales y expresiones idiomáticas. Incluye referencias culturales sutiles'
    END as cultural,
    CASE dl.code
        WHEN 'a1' THEN 'Usa oraciones muy cortas (5-10 palabras). Evita oraciones compuestas y complejas'
        WHEN 'a2' THEN 'Mezcla oraciones cortas y de longitud media. Usa algunas palabras conectoras básicas'
        WHEN 'b1' THEN 'Usa longitudes y estructuras de oración variadas. Incluye algunas oraciones complejas con múltiples cláusulas'
        WHEN 'b2' THEN 'Usa estructuras oracionales sofisticadas con cláusulas incrustadas. Varía la longitud de las oraciones para ritmo y énfasis'
    END as style,
    CASE dl.code
        WHEN 'a1' THEN 'Reemplaza ''El magnífico castillo se alzaba orgulloso'' con ''El castillo grande era muy alto'''
        WHEN 'a2' THEN 'Reemplaza ''Estaba completamente devastado'' con ''Estaba muy triste y molesto'''
        WHEN 'b1' THEN 'Puede usar ''Estaba devastado por la noticia'' o ''El castillo antiguo dominaba el paisaje'''
        WHEN 'b2' THEN 'Puede usar ''Estaba completamente devastado'' o ''La magnífica fortaleza dominaba todo el valle'''
    END as examples
FROM languages l, difficulty_levels dl
WHERE l.code = 'es' AND dl.code IN ('a1', 'a2', 'b1', 'b2')
ON CONFLICT (language_id, difficulty_level_id) DO NOTHING;

-- Update difficulty_levels to use CEFR codes
UPDATE difficulty_levels SET code = 'a1' WHERE code = 'beginner';
UPDATE difficulty_levels SET code = 'a2' WHERE code = 'intermediate';
UPDATE difficulty_levels SET code = 'b1' WHERE code = 'advanced';

-- Add CEFR levels B2, C1, C2
INSERT INTO difficulty_levels (code, name, description) VALUES
('b2', 'Upper Intermediate', 'Upper-intermediate level with sophisticated vocabulary and complex grammar'),
('c1', 'Advanced', 'Advanced level with native-like proficiency and nuanced expression'),
('c2', 'Mastery', 'Mastery level with near-native fluency and cultural understanding')
ON CONFLICT (code) DO NOTHING; 