# LLM Prompt Configuration System

## Overview

The LLM Prompt Configuration System provides a flexible, scalable way to customize translation prompts based on target language and difficulty level. This system replaces the hardcoded prompts with a configurable approach that supports CEFR language levels and language-specific instructions.

## Architecture

### Core Components

1. **PromptConfigService** (`src/lib/config/PromptConfigService.ts`)
   - Manages prompt configuration loading and building
   - Provides methods to retrieve language-specific instructions
   - Builds complete prompts using templates and context

2. **Configuration File** (`src/lib/config/prompts.json`)
   - JSON-based configuration for all prompt customizations
   - Organized by language code and difficulty level
   - Contains general instructions and language-specific guidelines

3. **Type Definitions** (`src/lib/types/prompt.ts`)
   - TypeScript interfaces for type safety
   - Defines structure for configuration and context

### Configuration Structure

```json
{
  "general": {
    "instructions": ["List of general instructions"],
    "template": "Template string with placeholders"
  },
  "languages": {
    "en": {
      "a1": { "vocabulary": "...", "grammar": "...", "cultural": "...", "style": "...", "examples": "..." },
      "a2": { ... },
      "b1": { ... },
      "b2": { ... }
    },
    "es": {
      "a1": { ... },
      ...
    }
  }
}
```

## Usage

### Basic Usage

```typescript
import { promptConfigService } from '../config/PromptConfigService';

// Check if a language/difficulty combination is supported
const isSupported = promptConfigService.isSupported('en', 'a1');

// Build a complete prompt
const context = {
  fromLanguage: 'es',
  toLanguage: 'en', 
  difficulty: 'a1',
  text: 'Hola, ¿cómo estás?'
};
const prompt = promptConfigService.buildPrompt(context);
```

### Integration with Translation Service

The translation service automatically uses the prompt configuration system:

```typescript
// In translationService.ts
private buildTranslationPrompt(request: TranslationRequest): string {
  const context = {
    fromLanguage: request.fromLanguage,
    toLanguage: request.toLanguage,
    difficulty: request.difficulty,
    text: request.text
  };

  // Use configuration service to build customized prompt
  return promptConfigService.buildPrompt(context);
}
```

## Supported Languages and Levels

### Languages
- **English (en)**: Full A1-B2 support
- **Spanish (es)**: Full A1-B2 support

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

1. Add language configuration to `prompts.json`
2. Update language name mapping in `PromptConfigService.ts`
3. Add corresponding difficulty levels (A1-B2 minimum)
4. Write comprehensive tests for the new language

### Adding New Difficulty Levels

1. Add the level to existing language configurations
2. Update the `DifficultyLevel` type in `prompt.ts`
3. Write appropriate instructions for each language
4. Test the new level with various content types

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

When a language/difficulty combination is not supported:
1. The system logs a warning
2. Falls back to a basic prompt template
3. Uses generic difficulty-level instructions
4. Maintains functionality while alerting about missing configuration

## Testing

The system includes comprehensive tests for:
- Configuration loading and validation
- Prompt building with various contexts
- Language/difficulty support checking
- Integration with translation service
- Fallback behavior for unsupported combinations

Run tests with:
```bash
npm run test:once -- src/lib/config/__tests__/PromptConfigService.test.ts
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