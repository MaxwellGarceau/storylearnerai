import { PromptConfig, PromptInstructions, PromptBuildContext } from '../types/prompt';
import promptConfigData from './prompts.json';
import { LanguageService } from '../../api/supabase/database/languageService';
import { PromptConfigurationService } from '../../api/supabase/database/promptConfigurationService';
import { LanguagePairPromptService } from '../../api/supabase/database/languagePairPromptService';

class PromptConfigService {
  private config: PromptConfig;
  private languageService: LanguageService;
  private promptConfigurationService: PromptConfigurationService;
  private languagePairPromptService: LanguagePairPromptService;
  private useDatabase: boolean = true;
  private useLanguagePairs: boolean = true;

  constructor() {
    this.config = promptConfigData as PromptConfig;
    this.languageService = new LanguageService();
    this.promptConfigurationService = new PromptConfigurationService();
    this.languagePairPromptService = new LanguagePairPromptService();
  }

  /**
   * Get language-specific prompt instructions for a given difficulty level
   */
  async getLanguageInstructions(languageCode: string, difficulty: string): Promise<PromptInstructions | null> {
    // This method is kept for backward compatibility but now delegates to the new language pair system
    // In the future, this should be deprecated in favor of getLanguagePairInstructions
    return this.getLanguagePairInstructions('en', languageCode, difficulty);
  }

  /**
   * Get language pair-specific prompt instructions for a given from->to language combination
   */
  async getLanguagePairInstructions(fromLanguageCode: string, toLanguageCode: string, difficulty: string): Promise<PromptInstructions | null> {
    if (this.useLanguagePairs && this.useDatabase) {
      try {
        const pairConfig = await this.languagePairPromptService.getLanguagePairPrompt(fromLanguageCode, toLanguageCode, difficulty);
        if (pairConfig) {
          return {
            vocabulary: pairConfig.vocabulary,
            grammar: pairConfig.grammar,
            cultural: pairConfig.cultural,
            style: pairConfig.style,
            examples: pairConfig.examples,
            // Additional language pair specific fields
            grammar_focus: pairConfig.grammar_focus,
            pronunciation_notes: pairConfig.pronunciation_notes,
            common_mistakes: pairConfig.common_mistakes,
            helpful_patterns: pairConfig.helpful_patterns
          };
        }
      } catch (error) {
        console.warn(`Failed to fetch language pair prompt from database for ${fromLanguageCode}->${toLanguageCode}/${difficulty}:`, error);
        // Fall back to single language configuration
      }
    }

    // Fallback to single language configuration
    if (this.useDatabase) {
      try {
        const dbConfig = await this.promptConfigurationService.getPromptConfiguration(toLanguageCode, difficulty);
        if (dbConfig) {
          return {
            vocabulary: dbConfig.vocabulary,
            grammar: dbConfig.grammar,
            cultural: dbConfig.cultural,
            style: dbConfig.style,
            examples: dbConfig.examples
          };
        }
      } catch (error) {
        console.warn(`Failed to fetch prompt configuration from database for ${toLanguageCode}/${difficulty}:`, error);
        // Fall back to JSON configuration
      }
    }

    // Final fallback to JSON configuration
    const language = this.config.languages[toLanguageCode.toLowerCase()];
    if (!language) {
      console.warn(`No prompt configuration found for language: ${toLanguageCode}`);
      return null;
    }

    const difficultyLevel = language[difficulty.toLowerCase() as keyof typeof language];
    if (!difficultyLevel) {
      console.warn(`No prompt configuration found for difficulty: ${difficulty} in language: ${toLanguageCode}`);
      return null;
    }

    return difficultyLevel;
  }

  /**
   * Get the general instructions that apply to all prompts
   */
  getGeneralInstructions(): string[] {
    return this.config.general.instructions;
  }

  /**
   * Get the general template for building prompts
   */
  getTemplate(): string {
    return this.config.general.template;
  }

  /**
   * Build the complete prompt using the template and context
   */
  async buildPrompt(context: PromptBuildContext): Promise<string> {
    const { fromLanguage, toLanguage, difficulty, text } = context;
    
    // Get general instructions
    const generalInstructions = this.getGeneralInstructions();
    
    // Get language pair-specific instructions
    const languageInstructions = await this.getLanguagePairInstructions(fromLanguage, toLanguage, difficulty);
    
    // Build the instructions string
    const instructionsText = generalInstructions.map(inst => `- ${inst}`).join('\n');
    
    // Build language-specific instructions
    let languageInstructionsText = '';
    if (languageInstructions) {
      const langInstructions = [];
      if (languageInstructions.vocabulary) langInstructions.push(`Vocabulary: ${languageInstructions.vocabulary}`);
      if (languageInstructions.grammar) langInstructions.push(`Grammar: ${languageInstructions.grammar}`);
      if (languageInstructions.cultural) langInstructions.push(`Cultural: ${languageInstructions.cultural}`);
      if (languageInstructions.style) langInstructions.push(`Style: ${languageInstructions.style}`);
      if (languageInstructions.examples) langInstructions.push(`Examples: ${languageInstructions.examples}`);
      
      // Add language pair specific instructions if available
      if (languageInstructions.grammar_focus) langInstructions.push(`Grammar Focus: ${languageInstructions.grammar_focus}`);
      if (languageInstructions.pronunciation_notes) langInstructions.push(`Pronunciation: ${languageInstructions.pronunciation_notes}`);
      if (languageInstructions.common_mistakes) langInstructions.push(`Common Mistakes: ${languageInstructions.common_mistakes}`);
      if (languageInstructions.helpful_patterns) langInstructions.push(`Helpful Patterns: ${languageInstructions.helpful_patterns}`);
      
      languageInstructionsText = langInstructions.join('\n');
    } else {
      // Fallback if no specific language instructions found
      languageInstructionsText = `Adapt the translation for ${difficulty.toUpperCase()} CEFR level complexity.`;
    }

    // Get language names asynchronously
    const fromLanguageName = await this.getLanguageName(fromLanguage);
    const toLanguageName = await this.getLanguageName(toLanguage);

    // Build the complete prompt using the template
    let prompt = this.getTemplate()
      .replace('{fromLanguage}', fromLanguageName)
      .replace('{toLanguage}', toLanguageName)
      .replace('{difficulty}', difficulty.toUpperCase())
      .replace('{instructions}', instructionsText)
      .replace('{languageInstructions}', languageInstructionsText)
      .replace('{text}', text);

    // Replace any remaining placeholders
    prompt = prompt.replace(/{fromLanguage}/g, fromLanguageName);
    prompt = prompt.replace(/{toLanguage}/g, toLanguageName);

    return prompt;
  }

  /**
   * Get full language name from language code
   */
  private async getLanguageName(languageCode: string): Promise<string> {
    try {
      return await this.languageService.getLanguageName(languageCode);
    } catch (error) {
      console.warn(`Failed to fetch language name for code: ${languageCode}`, error);
      return languageCode; // Fallback to code if fetch fails
    }
  }

  /**
   * Get all available languages in the config
   */
  async getAvailableLanguages(): Promise<string[]> {
    if (this.useDatabase) {
      try {
        return await this.promptConfigurationService.getAvailableLanguageCodes();
      } catch (error) {
        console.warn('Failed to fetch available languages from database, falling back to JSON:', error);
      }
    }
    
    return Object.keys(this.config.languages);
  }

  /**
   * Get all available difficulty levels for a language
   */
  async getAvailableDifficulties(languageCode: string): Promise<string[]> {
    if (this.useDatabase) {
      try {
        return await this.promptConfigurationService.getAvailableDifficultyCodes(languageCode);
      } catch (error) {
        console.warn(`Failed to fetch available difficulties for ${languageCode} from database, falling back to JSON:`, error);
      }
    }
    
    const language = this.config.languages[languageCode.toLowerCase()];
    if (!language) return [];
    
    return Object.keys(language);
  }

  /**
   * Check if a language and difficulty combination is supported
   */
  async isSupported(languageCode: string, difficulty: string): Promise<boolean> {
    if (this.useDatabase) {
      try {
        return await this.promptConfigurationService.hasPromptConfiguration(languageCode, difficulty);
      } catch (error) {
        console.warn(`Failed to check support for ${languageCode}/${difficulty} in database, falling back to JSON:`, error);
      }
    }
    
    const language = this.config.languages[languageCode.toLowerCase()];
    if (!language) return false;
    
    return difficulty.toLowerCase() in language;
  }
}

export const promptConfigService = new PromptConfigService(); 