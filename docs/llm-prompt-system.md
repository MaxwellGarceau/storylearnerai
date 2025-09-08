# LLM Prompt Configuration System

## Overview

The LLM Prompt Configuration System builds translation prompts based on target language and CEFR difficulty using JSON configs. It supports native‑to‑target guidance (e.g., Spanish→English) and falls back gracefully when a combination is unsupported.

## Architecture

### Core Components

1. **GeneralPromptConfigService** (`src/lib/prompts/GeneralPromptConfigService.ts`)
   - Loads general, template, language, and native‑to‑target configs
   - Builds complete prompts from a template and context
   - Exposes language/difficulty support helpers

2. **Configuration Files** (`src/lib/prompts/config/*`)
   - `general.json` and `template.json`
   - `to-language.json` (language‑specific instructions)
   - `native-to-target/<from>/<to>.json` (pair‑specific guidance)

3. **Type Definitions** (`src/types/llm/prompts.ts`)
   - Types for `LanguageCode`, `DifficultyLevel`, configuration shapes, and request context

### Configuration Structure

```json
{
  "general": {
    "instructions": ["List of general instructions"],
    "template": "Template string with placeholders"
  },
  "languages": {
    "en": { "a1": { ... }, "a2": { ... }, "b1": { ... }, "b2": { ... } },
    "es": { "a1": { ... }, "a2": { ... }, "b1": { ... }, "b2": { ... } }
  }
}
```

## Usage

### Basic Usage

```typescript
import { generalPromptConfigService } from '@/lib/prompts';

// Check if a language/difficulty combination is supported
const isSupported = generalPromptConfigService.isSupported('en', 'a1');

// Build a complete prompt
const context = {
  fromLanguage: 'es',
  toLanguage: 'en',
  difficulty: 'a1',
  text: 'Hola, ¿cómo estás?',
};
const prompt = await generalPromptConfigService.buildDifficultyLevelAndLanguagePrompt(context);
```

### Integration with Translation Service

The translation service uses the prompt system and falls back when unsupported:

```typescript
// In translationService.ts
private async buildTranslationPrompt(request: TranslationRequest): Promise<string> {
  const context = {
    fromLanguage: request.fromLanguage,
    toLanguage: request.toLanguage,
    difficulty: request.difficulty,
    text: request.text,
    nativeLanguage: request.nativeLanguage,
  };

  if (!generalPromptConfigService.isSupported(request.toLanguage, request.difficulty)) {
    return this.buildFallbackPrompt(request);
  }
  return generalPromptConfigService.buildDifficultyLevelAndLanguagePrompt(context);
}
```

## Supported Languages and Levels

### Languages

- **English (en)**: A1–B2
- **Spanish (es)**: A1–B2

### CEFR Levels

- **A1**: Beginner level with basic vocabulary and simple grammar
- **A2**: Elementary level with expanded vocabulary and compound sentences
- **B1**: Intermediate level with varied expressions and complex structures
- **B2**: Upper-intermediate level with advanced vocabulary and sophisticated grammar

## Customization Guidelines

### Language-Specific Instructions

Each language/difficulty combination includes:

- **Vocabulary**: Word choice guidelines and complexity levels
- **Grammar**: Grammatical structures appropriate for the level
- **Cultural**: How to handle cultural references and context
- **Style**: Sentence structure and writing style guidelines
- **Examples**: Specific examples of transformations

### Adding New Languages

1. Add entries to `src/lib/prompts/config/to-language.json`
2. Add native‑to‑target files under `src/lib/prompts/config/native-to-target/<from>/<to>.json`
3. Add tests under `src/lib/prompts/__tests__/`

### Adding New Difficulty Levels

1. Add the level to the per‑language configs
2. Update `DifficultyLevel` in `src/types/llm/prompts.ts`
3. Provide examples and grammar/vocabulary guidance
4. Add tests

## Examples

### A1 English Translation Prompt

For A1 level English translations, the system generates prompts that:

- Use only the most common 1000 English words
- Employ simple present, past, and continuous tenses
- Keep sentences short (5-10 words)
- Replace complex cultural references with universal concepts

### B2 Spanish Translation Prompt

For B2 level Spanish translations, the system generates prompts that:

- Use upper-intermediate vocabulary (top 5000 words)
- Include advanced tenses and subjunctive mood
- Preserve cultural nuances and idiomatic expressions
- Use sophisticated sentence structures with embedded clauses

## Fallback Behavior

If a language/difficulty combination is not supported, the translation service logs a warning and uses a minimal template prompt.

## Testing

The system includes comprehensive tests for:

- Configuration loading and validation
- Prompt building with various contexts
- Language/difficulty support checking
- Integration with translation service
- Fallback behavior for unsupported combinations

Run tests with:

```bash
npm run test:once -- src/lib/prompts/__tests__
```

## Future Enhancements

1. **Dynamic Configuration Loading**: Load configurations from external sources
2. **User Customization**: Allow users to customize prompts for their needs
3. **Context-Aware Prompts**: Adjust prompts based on story content and themes
4. **Performance Optimization**: Cache frequently used prompt configurations
5. **Multi-Modal Support**: Extend to support image and audio content translation

## Troubleshooting

### Common Issues

1. **"Unsupported language/difficulty combination"**
   - Verify the language code exists in `prompts.json`
   - Check that the difficulty level is defined for that language
   - Ensure proper case sensitivity (languages and difficulties are case-insensitive)

2. **"No prompt configuration found"**
   - Check that `prompts.json` is properly formatted
   - Verify the JSON structure matches the expected schema
   - Ensure the file is accessible from the service location

3. **Template placeholders not replaced**
   - Verify all required placeholders exist in the template
   - Check that the context object contains all necessary fields
   - Ensure the template string format is correct
