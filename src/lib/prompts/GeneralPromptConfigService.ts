import { 
  LanguagePromptConfig, 
  GeneralPromptConfig, 
  TemplateConfig,
  PromptInstructions, 
  PromptBuildContext,
  NativeToTargetLanguageConfig,
  NativeToTargetInstructions,
  LanguageCode,
  DifficultyLevel
} from '../../types/llm/prompts';
import { logger } from '../logger';
import languageConfigData from './config/to-language.json';
import generalConfigData from './config/general.json';
import templateConfigData from './config/template.json';

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
  private templateConfig: TemplateConfig;
  private nativeToTargetConfig: NativeToTargetLanguageConfig;
  private configLoadingPromise: Promise<void> | null = null;

  constructor() {
    this.languageConfig = languageConfigData as LanguagePromptConfig;
    this.generalConfig = generalConfigData as GeneralPromptConfig;
    this.templateConfig = templateConfigData as TemplateConfig;
    this.nativeToTargetConfig = {} as NativeToTargetLanguageConfig;
    this.configLoadingPromise = this.loadNativeToTargetConfigs();
  }

  /**
   * Dynamically load native-to-target configurations
   */
  private async loadNativeToTargetConfigs(): Promise<void> {
    try {
      logger.time('prompts', 'load-native-to-target-configs');
      
      // Load configurations in parallel for better performance
      const [englishConfig, spanishConfig] = await Promise.all([
        import('./config/native-to-target/en/es.json'),
        import('./config/native-to-target/es/en.json')
      ]);

      // Update configurations with proper type assertions
      const config = this.nativeToTargetConfig as Record<string, unknown>;
      config['en'] = {
        'es': englishConfig.default as Record<string, unknown>
      };
      config['es'] = {
        'en': spanishConfig.default as Record<string, unknown>
      };

      logger.debug('prompts', 'Loaded all native-to-target configurations');
      logger.timeEnd('prompts', 'load-native-to-target-configs');
    } catch (error) {
      logger.error('prompts', 'Failed to load native-to-target configurations', { error });
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
  async getNativeToTargetInstructions(fromLanguage: LanguageCode, targetLanguage: LanguageCode, difficulty: DifficultyLevel): Promise<NativeToTargetInstructions | null> {
    // Wait for configs to be loaded
    await this.waitForConfigs();
    logger.debug('prompts', 'Getting native-to-target instructions', { 
      fromLanguage, 
      targetLanguage, 
      difficulty 
    });

    const config = this.nativeToTargetConfig as Record<string, unknown>;
    const nativeConfig = config[fromLanguage] as Record<string, unknown> | undefined;
    if (!nativeConfig) {
      logger.warn('prompts', 'No native-to-target configuration found for native language', { fromLanguage });
      return null;
    }

    const targetConfig = nativeConfig[targetLanguage] as Record<string, unknown> | undefined;
    if (!targetConfig) {
      logger.warn('prompts', 'No native-to-target configuration found for target language', { 
        fromLanguage, 
        targetLanguage 
      });
      return null;
    }

    const difficultyConfig = targetConfig[difficulty.toLowerCase()] as NativeToTargetInstructions | undefined;
    if (!difficultyConfig) {
      logger.warn('prompts', 'No native-to-target configuration found for difficulty', { 
        fromLanguage, 
        targetLanguage, 
        difficulty 
      });
      return null;
    }

    logger.debug('prompts', 'Found native-to-target instructions', { 
      fromLanguage, 
      targetLanguage, 
      difficulty 
    });

    return difficultyConfig;
  }

  /**
   * Build native-to-target instructions text from the configuration
   */
  private buildNativeToTargetInstructionsText(instructions: NativeToTargetInstructions): string {
    const sections = [];

    // Add description
    if (instructions.description) {
      sections.push(`Native Speaker Guidance: ${instructions.description}`);
    }

    // Add grammar focus
    if (instructions.grammar_focus && Object.keys(instructions.grammar_focus).length > 0) {
      const grammarRules = Object.entries(instructions.grammar_focus)
        .map(([key, value]) => `${key.replace(/_/g, ' ').toUpperCase()}: ${value}`)
        .join('\n');
      sections.push(`Grammar Focus:\n${grammarRules}`);
    }

    // Add vocabulary focus
    if (instructions.vocabulary_focus && Object.keys(instructions.vocabulary_focus).length > 0) {
      const vocabularyRules = Object.entries(instructions.vocabulary_focus)
        .map(([key, value]) => `${key.replace(/_/g, ' ').toUpperCase()}: ${value}`)
        .join('\n');
      sections.push(`Vocabulary Focus:\n${vocabularyRules}`);
    }

    // Add phonetics support
    if (instructions.phonetics_support_in_text && Object.keys(instructions.phonetics_support_in_text).length > 0) {
      const phoneticsRules = Object.entries(instructions.phonetics_support_in_text)
        .map(([key, value]) => `${key.replace(/_/g, ' ').toUpperCase()}: ${value}`)
        .join('\n');
      sections.push(`Phonetics Support:\n${phoneticsRules}`);
    }

    return sections.join('\n\n');
  }

  /**
   * Get language-specific prompt instructions for a given difficulty level
   */
  getLanguageInstructions(languageCode: string, difficulty: DifficultyLevel): PromptInstructions | null {
    const config = this.languageConfig as Record<string, unknown>;
    const language = config[languageCode.toLowerCase()] as Record<string, unknown> | undefined;
    if (!language) {
      logger.warn('prompts', `No prompt configuration found for language: ${languageCode}`);
      return null;
    }

    const difficultyLevel = language[difficulty.toLowerCase()] as PromptInstructions | undefined;
    if (!difficultyLevel) {
      logger.warn('prompts', 'No prompt configuration found for difficulty', { difficulty, languageCode });
      return null;
    }

    return difficultyLevel;
  }

  /**
   * Get language pair-specific prompt instructions for a given from->to language combination
   * For now, this delegates to the single language configuration since we don't have
   * comprehensive user background customization yet
   */
  getLanguagePairInstructions(fromLanguageCode: LanguageCode, toLanguageCode: LanguageCode, difficulty: DifficultyLevel): PromptInstructions | null {
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
    return this.templateConfig.template;
  }

  /**
   * Build a complete prompt from the template and context
   */
  async buildPrompt(context: PromptBuildContext): Promise<string> {
    logger.time('prompts', 'build-prompt');
    
    try {
      const { fromLanguage, toLanguage, difficulty, text } = context;

      logger.debug('prompts', 'Building prompt', { 
        fromLanguage, 
        toLanguage, 
        difficulty,
        textLength: text.length 
      });

      // Get language-specific instructions
      const languageInstructions = this.getLanguagePairInstructions(fromLanguage, toLanguage, difficulty);
      if (!languageInstructions) {
        logger.warn('prompts', 'No language instructions found', { 
          fromLanguage, 
          toLanguage, 
          difficulty 
        });
        return this.buildFallbackPrompt(context);
      }

      // Get native-to-target specific instructions if native language is provided
      let nativeToTargetInstructions = '';
      const nativeInstructions = await this.getNativeToTargetInstructions(fromLanguage, toLanguage, difficulty);
      if (nativeInstructions) {
        nativeToTargetInstructions = this.buildNativeToTargetInstructionsText(nativeInstructions);
        logger.debug('prompts', 'Added native-to-target instructions', { 
          fromLanguage, 
          toLanguage, 
          difficulty 
        });
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
        .replace(/{nativeToTargetInstructions}/g, nativeToTargetInstructions)
        .replace(/{text}/g, text);

      logger.info('prompts', 'Prompt built successfully', { 
        fromLanguage, 
        toLanguage, 
        difficulty, 
        promptLength: prompt.length,
        hasNativeInstructions: !!nativeToTargetInstructions
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
    const config = this.languageConfig as Record<string, unknown>;
    const language = config[languageCode.toLowerCase()] as Record<string, unknown> | undefined;
    if (!language) {
      return [];
    }
    return Object.keys(language);
  }

  /**
   * Check if a language and difficulty combination is supported
   */
  isSupported(languageCode: LanguageCode, difficulty: DifficultyLevel): boolean {
    const config = this.languageConfig as Record<string, unknown>;
    const language = config[languageCode.toLowerCase()] as Record<string, unknown> | undefined;
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