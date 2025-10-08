import {
  LanguagePromptConfig,
  GeneralPromptConfig,
  PromptInstructions,
  PromptBuildContext,
  NativeToTargetLanguageConfig,
  NativeToTargetInstructions,
  LanguageCode,
  DifficultyLevel,
  WordTranslationPromptContext,
} from '../../types/llm/prompts';
import { logger } from '../logger';
import languageConfigData from './config/to-language.json';
import generalConfigData from './config/general.json';
import type { VoidPromise } from '../../types/common';

/**
 * General Prompt Configuration Service
 *
 * This service provides base prompt configurations based on language and difficulty level.
 * It serves as the foundation for the prompt system.
 *
 * Future Enhancement Plan:
 * - Add user-specific prompt customizations (user background, learning preferences)
 * - Add language pair-specific prompts (from->to language combinations)
 * - Add A/B testing capabilities for different prompt variations
 * - Add admin interface for non-technical prompt editing
 *
 * The general prompts in prompts/general.json and language-specific prompts in
 * prompts/to-language.json will serve as fallbacks when more specific customizations
 * are not available.
 */

class GeneralPromptConfigService {
  private languageConfig: LanguagePromptConfig;
  private generalConfig: GeneralPromptConfig;
  private nativeToTargetConfig: NativeToTargetLanguageConfig;
  private configLoadingPromise: VoidPromise | null = null;

  // Template content moved from template.json
  private readonly TEMPLATE = `Translate the following {fromLanguage} story to {toLanguage}, adapted for {difficulty} CEFR level:

Instructions:
{instructions}

Specific {toLanguage} Guidelines:
{languageInstructions}

{nativeToTargetInstructions}

{fromLanguage} Story:
{text}

RESPONSE FORMAT:
Return a JSON object with the following structure:
{
  "translation": "<full translated {toLanguage} story text>",
  "tokens": [
    {
      "type": "word",
      "to_word": "<word from the translated {toLanguage} story>",
      "to_lemma": "<lemma/base form of the {toLanguage} word - must be a single word, not a phrase>",
      "from_word": "<corresponding word from the original {fromLanguage} story>",
      "from_lemma": "<lemma/base form of the original {fromLanguage} word - must be a single word, not a phrase>",
      "pos": "<part of speech: noun|verb|adjective|adverb|pronoun|preposition|conjunction|interjection|article|determiner|other>",
      "difficulty": "<CEFR level: A1|A2|B1|B2|C1|C2>",
      "from_definition": "<context-appropriate definition written in {fromLanguage} language explaining the {fromLanguage} word based on how it's used in THIS SPECIFIC CONTEXT>"
    },
    {
      "type": "punctuation",
      "value": "<punctuation mark: period, comma, question mark, exclamation mark, quotation mark, semicolon, colon, dash, etc.>"
    },
    {
      "type": "whitespace",
      "value": "<whitespace character: space, tab, newline, etc.>"
    }
  ]
}

CRITICAL REQUIREMENTS:
- The 'tokens' array must include EVERY element from the TRANSLATED {toLanguage} story: all words, punctuation marks, and whitespace
- Each element is one of three types:
  * "word" - for all words (nouns, verbs, adjectives, adverbs, articles, pronouns, prepositions, conjunctions, etc.)
  * "punctuation" - for punctuation marks ONLY (periods, commas, question marks, exclamation marks, quotation marks, semicolons, colons, dashes, parentheses, etc.)
  * "whitespace" - for whitespace characters ONLY (spaces, tabs, newlines, etc.)
- If a word appears multiple times in the story, include a separate word object for EACH occurrence
- Each duplicate word entry must have a context-specific definition based on how it's used at that particular position in the story
- Maintain exact token order matching the translated story from first character to last
- The 'from_definition' must be written in {fromLanguage} language (the user's native language) so they can easily understand the definition
- The 'from_definition' should define the {fromLanguage} word as it's specifically used in this context (e.g., "correr" in Spanish meaning "dirigir un negocio" vs "correr una carrera" should have different definitions)
- Each word object represents a single word occurrence from the translated story, not the original
- The 'to_word' is the SOURCE OF TRUTH for meaning, tense, aspect, number, gender, and usage. All metadata must align to how the 'to_word' is used in the translated sentence
- The 'from_word' and 'from_definition' MUST be derived to match the exact sense and tense/aspect of the 'to_word' as used in the translated {toLanguage} sentence, EVEN IF this differs from the original {fromLanguage} text
- If the original {fromLanguage} text uses a different tense/aspect/number than the final translated 'to_word', ADJUST 'from_word' and 'from_definition' to align with the 'to_word'. Example: If the translated token is present tense "ama" (she loves), 'from_word' should be "loves" (present), not "loved" (past)
- Use standard part-of-speech tags based on the {toLanguage} word's function in the sentence
- Assign difficulty levels based on the {toLanguage} word complexity and CEFR standards
- Both 'to_lemma' and 'from_lemma' must be single words only - NEVER RETURN MULTI-WORD PHRASES AS LEMMAS
- When reconstructing the story by concatenating all tokens in order, it must exactly match the 'translation' field
- Return ONLY valid JSON, no additional text or markdown formatting`;

  private readonly VOCABULARY_SECTION = `

Learner Vocabulary Focus:
Please include and naturally use the following target-language words when appropriate in the translation, matching {difficulty} level:
{vocabList}`;

  constructor() {
    this.languageConfig = languageConfigData as LanguagePromptConfig;
    this.generalConfig = generalConfigData as GeneralPromptConfig;
    this.nativeToTargetConfig = {} as NativeToTargetLanguageConfig;
    this.configLoadingPromise = this.loadNativeToTargetConfigs();
  }

  /**
   * Dynamically load native-to-target configurations
   */
  private async loadNativeToTargetConfigs(): VoidPromise {
    try {
      logger.time('prompts', 'load-native-to-target-configs');

      // Load configurations in parallel for better performance
      const [englishConfig, spanishConfig] = await Promise.all([
        import('./config/native-to-target/en/es.json'),
        import('./config/native-to-target/es/en.json'),
      ]);

      // Update configurations with proper type assertions
      const config = this.nativeToTargetConfig as Record<string, unknown>;
      config['en'] = {
        es: englishConfig.default as Record<string, unknown>,
      };
      config['es'] = {
        en: spanishConfig.default as Record<string, unknown>,
      };

      logger.debug('prompts', 'Loaded all native-to-target configurations');
      logger.timeEnd('prompts', 'load-native-to-target-configs');
    } catch (error) {
      logger.error(
        'prompts',
        'Failed to load native-to-target configurations',
        { error }
      );
      // Re-throw the error so consumers know loading failed
      throw error;
    }
  }

  /**
   * Wait for configurations to be loaded
   */
  private async waitForConfigs(): Promise<void> {
    if (this.configLoadingPromise) {
      await this.configLoadingPromise;
    }
  }

  /**
   * Get native-to-target specific instructions for a given native language and target language
   */
  async getNativeToTargetInstructions(
    fromLanguage: LanguageCode,
    targetLanguage: LanguageCode,
    difficulty: DifficultyLevel
  ): Promise<NativeToTargetInstructions | null> {
    // Wait for configs to be loaded
    await this.waitForConfigs();
    logger.debug('prompts', 'Getting native-to-target instructions', {
      fromLanguage,
      targetLanguage,
      difficulty,
    });

    const config = this.nativeToTargetConfig as Record<string, unknown>;
    const nativeConfig = config[fromLanguage] as
      | Record<string, unknown>
      | undefined;
    if (!nativeConfig) {
      logger.warn(
        'prompts',
        'No native-to-target configuration found for native language',
        { fromLanguage }
      );
      return null;
    }

    const targetConfig = nativeConfig[targetLanguage] as
      | Record<string, unknown>
      | undefined;
    if (!targetConfig) {
      logger.warn(
        'prompts',
        'No native-to-target configuration found for target language',
        {
          fromLanguage,
          targetLanguage,
        }
      );
      return null;
    }

    const difficultyConfig = targetConfig[difficulty.toLowerCase()] as
      | NativeToTargetInstructions
      | undefined;
    if (!difficultyConfig) {
      logger.warn(
        'prompts',
        'No native-to-target configuration found for difficulty',
        {
          fromLanguage,
          targetLanguage,
          difficulty,
        }
      );
      return null;
    }

    logger.debug('prompts', 'Found native-to-target instructions', {
      fromLanguage,
      targetLanguage,
      difficulty,
    });

    return difficultyConfig;
  }

  /**
   * Build native-to-target instructions text from the configuration
   */
  private buildNativeToTargetInstructionsText(
    instructions: NativeToTargetInstructions
  ): string {
    const sections = [];

    // Add description
    if (instructions.description) {
      sections.push(`Native Speaker Guidance: ${instructions.description}`);
    }

    // Add grammar focus
    if (
      instructions.grammar_focus &&
      Object.keys(instructions.grammar_focus).length > 0
    ) {
      const grammarRules = Object.entries(instructions.grammar_focus)
        .map(
          ([key, value]) => `${key.replace(/_/g, ' ').toUpperCase()}: ${value}`
        )
        .join('\n');
      sections.push(`Grammar Focus:\n${grammarRules}`);
    }

    // Add vocabulary focus
    if (
      instructions.vocabulary_focus &&
      Object.keys(instructions.vocabulary_focus).length > 0
    ) {
      const vocabularyRules = Object.entries(instructions.vocabulary_focus)
        .map(
          ([key, value]) => `${key.replace(/_/g, ' ').toUpperCase()}: ${value}`
        )
        .join('\n');
      sections.push(`Vocabulary Focus:\n${vocabularyRules}`);
    }

    // Add phonetics support
    if (
      instructions.phonetics_support_in_text &&
      Object.keys(instructions.phonetics_support_in_text).length > 0
    ) {
      const phoneticsRules = Object.entries(
        instructions.phonetics_support_in_text
      )
        .map(
          ([key, value]) => `${key.replace(/_/g, ' ').toUpperCase()}: ${value}`
        )
        .join('\n');
      sections.push(`Phonetics Support:\n${phoneticsRules}`);
    }

    return sections.join('\n\n');
  }

  /**
   * Get language-specific prompt instructions for a given difficulty level
   */
  private getLanguageInstructions(
    languageCode: string,
    difficulty: DifficultyLevel
  ): PromptInstructions {
    const config = this.languageConfig as Record<string, unknown>;
    const language = config[languageCode.toLowerCase()] as Record<
      string,
      unknown
    >;
    const difficultyLevel = language[
      difficulty.toLowerCase()
    ] as PromptInstructions;

    return difficultyLevel;
  }

  /**
   * Get language pair-specific prompt instructions for a given from->to language combination
   * For now, this delegates to the single language configuration since we don't have
   * comprehensive user background customization yet
   */
  private getLanguagePairInstructions(
    _fromLanguageCode: LanguageCode,
    toLanguageCode: LanguageCode,
    difficulty: DifficultyLevel
  ): PromptInstructions {
    // For now, use the single language configuration
    // In the future, this can be enhanced with user background considerations
    return this.getLanguageInstructions(toLanguageCode, difficulty);
  }

  /**
   * Get the general instructions that apply to all prompts
   */
  getGeneralInstructions(): string[] {
    return this.generalConfig.instructions;
  }

  /**
   * Get the prompt template
   */
  getTemplate(): string {
    return this.TEMPLATE;
  }

  /**
   * Build a complete prompt from the template and context
   */
  private async buildDifficultyLevelAndLanguagePrompt(
    context: PromptBuildContext
  ): Promise<string> {
    logger.time('prompts', 'build-prompt');

    try {
      const { fromLanguage, toLanguage, difficulty, text } = context;

      logger.debug('prompts', 'Building prompt', {
        fromLanguage,
        toLanguage,
        difficulty,
        textLength: text.length,
      });

      // Get language-specific instructions
      const languageInstructions = this.getLanguagePairInstructions(
        fromLanguage,
        toLanguage,
        difficulty
      );

      // Get native-to-target specific instructions if native language is provided
      let nativeToTargetInstructions = '';
      const nativeInstructions = await this.getNativeToTargetInstructions(
        fromLanguage,
        toLanguage,
        difficulty
      );
      if (nativeInstructions) {
        nativeToTargetInstructions =
          this.buildNativeToTargetInstructionsText(nativeInstructions);
        logger.debug('prompts', 'Added native-to-target instructions', {
          fromLanguage,
          toLanguage,
          difficulty,
        });
      }

      // Build the language instructions text
      const languageInstructionsText = [
        languageInstructions.vocabulary &&
          `Vocabulary: ${languageInstructions.vocabulary}`,
        languageInstructions.grammar &&
          `Grammar: ${languageInstructions.grammar}`,
        languageInstructions.cultural &&
          `Cultural: ${languageInstructions.cultural}`,
        languageInstructions.style && `Style: ${languageInstructions.style}`,
        languageInstructions.examples &&
          `Examples: ${languageInstructions.examples}`,
        // Language pair specific fields (for future use)
        languageInstructions.grammar_focus &&
          `Grammar Focus: ${languageInstructions.grammar_focus}`,
        languageInstructions.pronunciation_notes &&
          `Pronunciation: ${languageInstructions.pronunciation_notes}`,
        languageInstructions.common_mistakes &&
          `Common Mistakes: ${languageInstructions.common_mistakes}`,
        languageInstructions.helpful_patterns &&
          `Helpful Patterns: ${languageInstructions.helpful_patterns}`,
      ]
        .filter(Boolean)
        .join('\n');

      // Get general instructions
      const generalInstructions = this.getGeneralInstructions().join('\n');

      // Build the complete prompt
      const prompt = this.getTemplate()
        .replace(/{fromLanguage}/g, fromLanguage)
        .replace(/{toLanguage}/g, toLanguage)
        .replace(/{difficulty}/g, difficulty)
        .replace(/{instructions}/g, generalInstructions)
        .replace(/{languageInstructions}/g, languageInstructionsText)
        .replace(/{nativeToTargetInstructions}/g, nativeToTargetInstructions)
        .replace(/{text}/g, text);

      logger.info('prompts', 'Prompt built successfully', {
        fromLanguage,
        toLanguage,
        difficulty,
        promptLength: prompt.length,
        hasNativeInstructions: !!nativeToTargetInstructions,
      });

      return prompt;
    } catch (error) {
      logger.error('prompts', 'Error building prompt', { error, context });
      return this.buildFallbackPrompt(context);
    } finally {
      logger.timeEnd('prompts', 'build-prompt');
    }
  }

  /**
   * Build only the vocabulary instruction block for learner vocabulary inclusion
   */
  buildVocabularyInstruction(
    context: PromptBuildContext,
    vocabulary: string[]
  ): string {
    if (!vocabulary || vocabulary.length === 0) return '';

    const vocabList = vocabulary
      .slice(0, 30)
      .map(w => `- ${w}`)
      .join('\n');

    return this.VOCABULARY_SECTION
      .replace('{difficulty}', context.difficulty)
      .replace('{vocabList}', vocabList);
  }

  /**
   * Build a customized translation prompt based on language and difficulty level
   */
  async buildTranslationPrompt(context: PromptBuildContext): Promise<string> {
    // If the configuration doesn't support this language/difficulty combination,
    // fall back to a basic prompt
    if (!this.isSupported(context.toLanguage, context.difficulty)) {
      logger.warn(
        'prompts',
        `Unsupported language/difficulty combination: ${context.toLanguage}/${context.difficulty}. Using fallback prompt.`
      );
      return this.buildFallbackPrompt(context);
    }

    // Build the base prompt
    const basePrompt =
      await this.buildDifficultyLevelAndLanguagePrompt(context);

    // Add vocabulary instruction if vocabulary is selected
    if (context.selectedVocabulary && context.selectedVocabulary.length > 0) {
      const vocabInstruction = this.buildVocabularyInstruction(
        context,
        context.selectedVocabulary
      );
      return `${basePrompt}${vocabInstruction}`;
    }

    return basePrompt;
  }

  /**
   * Build a prompt for translating a single focus word using sentence context
   */
  buildWordTranslationPrompt(context: WordTranslationPromptContext): string {
    return `You are a precise translator.

Task: Translate ONLY the specified focus word from {fromLanguage} to {toLanguage}, using the full sentence for context.

Rules:
- Output ONLY the single translated word.
- No explanations, punctuation, quotes, or extra words.
- Choose the most common, natural everyday term in {toLanguage}.
- If multiple translations exist, pick the most likely given the sentence.
- If the word is a proper noun that should remain unchanged, return it unchanged.
- If no single-word translation exists, return the closest single-word equivalent.

Context sentence ({fromLanguage}):
"{sentence}"

Focus word: {focusWord}

Return: ONLY the translation of the focus word in {toLanguage}.`
      .replace(/{fromLanguage}/g, context.fromLanguage)
      .replace(/{toLanguage}/g, context.toLanguage)
      .replace(/{sentence}/g, context.sentence)
      .replace(/{focusWord}/g, context.focusWord);
  }

  /**
   * Build a fallback prompt when language-specific instructions are not available
   */
  private buildFallbackPrompt(context: PromptBuildContext): string {
    const { fromLanguage, toLanguage, difficulty, text } = context;

    return `
      Translate the following ${fromLanguage} story to ${toLanguage}, adapted for ${difficulty} CEFR level:

      Instructions:
      - Maintain the story's meaning and narrative flow
      - Adapt vocabulary and sentence complexity to ${difficulty} level
      - Preserve cultural context where appropriate
      - Keep the story engaging and readable

      ${fromLanguage} Story:
      ${text}

      Please provide only the ${toLanguage} translation.
    `;
  }

  /**
   * Get available language codes
   */
  getAvailableLanguages(): string[] {
    return Object.keys(this.languageConfig);
  }

  /**
   * Get available difficulty levels for a given language
   */
  getAvailableDifficulties(languageCode: string): string[] {
    const config = this.languageConfig as Record<string, unknown>;
    const language = config[languageCode.toLowerCase()] as
      | Record<string, unknown>
      | undefined;
    if (!language) {
      return [];
    }
    return Object.keys(language);
  }

  /**
   * Check if a language and difficulty combination is supported
   */
  isSupported(
    languageCode: LanguageCode,
    difficulty: DifficultyLevel
  ): boolean {
    const config = this.languageConfig as Record<string, unknown>;
    const language = config[languageCode.toLowerCase()] as
      | Record<string, unknown>
      | undefined;
    if (!language) {
      return false;
    }
    return difficulty.toLowerCase() in language;
  }
}

// Create a singleton instance
let _instance: GeneralPromptConfigService | null = null;

export const generalPromptConfigService = (() => {
  _instance ??= new GeneralPromptConfigService();
  return _instance;
})();
