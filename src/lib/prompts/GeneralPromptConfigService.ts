import { LanguagePromptConfig, GeneralPromptConfig, PromptInstructions, PromptBuildContext } from '../types/prompt';
import languageConfigData from './config/to-language.json';
import generalConfigData from './config/general.json';

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

  constructor() {
    this.languageConfig = languageConfigData as LanguagePromptConfig;
    this.generalConfig = generalConfigData as GeneralPromptConfig;
  }

  /**
   * Get language-specific prompt instructions for a given difficulty level
   */
  getLanguageInstructions(languageCode: string, difficulty: string): PromptInstructions | null {
    const language = this.languageConfig[languageCode.toLowerCase()];
    if (!language) {
      console.warn(`No prompt configuration found for language: ${languageCode}`);
      return null;
    }

    const difficultyLevel = language[difficulty.toLowerCase() as keyof typeof language];
    if (!difficultyLevel) {
      console.warn(`No prompt configuration found for difficulty: ${difficulty} in language: ${languageCode}`);
      return null;
    }

    return difficultyLevel;
  }

  /**
   * Get language pair-specific prompt instructions for a given from->to language combination
   * For now, this delegates to the single language configuration since we don't have
   * comprehensive user background customization yet
   */
  getLanguagePairInstructions(fromLanguageCode: string, toLanguageCode: string, difficulty: string): PromptInstructions | null {
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
    return this.generalConfig.template;
  }

  /**
   * Build a complete prompt from the template and context
   */
  buildPrompt(context: PromptBuildContext): string {
    const { fromLanguage, toLanguage, difficulty, text } = context;

    // Get language-specific instructions
    const languageInstructions = this.getLanguagePairInstructions(fromLanguage, toLanguage, difficulty);
    if (!languageInstructions) {
      console.warn(`No language instructions found for ${fromLanguage}->${toLanguage}/${difficulty}`);
      return this.buildFallbackPrompt(context);
    }

    // Build the language instructions text
    const languageInstructionsText = [
      languageInstructions.vocabulary && `Vocabulary: ${languageInstructions.vocabulary}`,
      languageInstructions.grammar && `Grammar: ${languageInstructions.grammar}`,
      languageInstructions.cultural && `Cultural: ${languageInstructions.cultural}`,
      languageInstructions.style && `Style: ${languageInstructions.style}`,
      languageInstructions.examples && `Examples: ${languageInstructions.examples}`,
      // Language pair specific fields (for future use)
      languageInstructions.grammar_focus && `Grammar Focus: ${languageInstructions.grammar_focus}`,
      languageInstructions.pronunciation_notes && `Pronunciation: ${languageInstructions.pronunciation_notes}`,
      languageInstructions.common_mistakes && `Common Mistakes: ${languageInstructions.common_mistakes}`,
      languageInstructions.helpful_patterns && `Helpful Patterns: ${languageInstructions.helpful_patterns}`
    ].filter(Boolean).join('\n');

    // Get general instructions
    const generalInstructions = this.getGeneralInstructions().join('\n');

    // Build the complete prompt
    const prompt = this.getTemplate()
      .replace(/{fromLanguage}/g, fromLanguage)
      .replace(/{toLanguage}/g, toLanguage)
      .replace(/{difficulty}/g, difficulty)
      .replace(/{instructions}/g, generalInstructions)
      .replace(/{languageInstructions}/g, languageInstructionsText)
      .replace(/{text}/g, text);

    return prompt;
  }

  /**
   * Build a fallback prompt when language-specific instructions are not available
   */
  private buildFallbackPrompt(context: PromptBuildContext): string {
    const { fromLanguage, toLanguage, difficulty, text } = context;
    
    return `Translate the following ${fromLanguage} story to ${toLanguage}, adapted for ${difficulty} level:

${fromLanguage} Story:
${text}

Please provide only the ${toLanguage} translation.`;
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
    const language = this.languageConfig[languageCode.toLowerCase()];
    if (!language) {
      return [];
    }
    return Object.keys(language);
  }

  /**
   * Check if a language and difficulty combination is supported
   */
  isSupported(languageCode: string, difficulty: string): boolean {
    const language = this.languageConfig[languageCode.toLowerCase()];
    if (!language) {
      return false;
    }
    return difficulty.toLowerCase() in language;
  }
}

// Create a singleton instance
let _instance: GeneralPromptConfigService | null = null;

export const generalPromptConfigService = (() => {
  if (!_instance) {
    _instance = new GeneralPromptConfigService();
  }
  return _instance;
})(); 