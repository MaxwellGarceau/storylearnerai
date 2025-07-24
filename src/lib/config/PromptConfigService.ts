import { PromptConfig, PromptInstructions, PromptBuildContext } from '../types/prompt';
import promptConfigData from './prompts.json';
import { LanguageService } from '../../api/supabase/database/languageService';

class PromptConfigService {
  private config: PromptConfig;
  private languageService: LanguageService;

  constructor() {
    this.config = promptConfigData as PromptConfig;
    this.languageService = new LanguageService();
  }

  /**
   * Get language-specific prompt instructions for a given difficulty level
   */
  getLanguageInstructions(languageCode: string, difficulty: string): PromptInstructions | null {
    const language = this.config.languages[languageCode.toLowerCase()];
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
    
    // Get language-specific instructions for the target language
    const languageInstructions = this.getLanguageInstructions(toLanguage, difficulty);
    
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
  getAvailableLanguages(): string[] {
    return Object.keys(this.config.languages);
  }

  /**
   * Get all available difficulty levels for a language
   */
  getAvailableDifficulties(languageCode: string): string[] {
    const language = this.config.languages[languageCode.toLowerCase()];
    if (!language) return [];
    
    return Object.keys(language);
  }

  /**
   * Check if a language and difficulty combination is supported
   */
  isSupported(languageCode: string, difficulty: string): boolean {
    const language = this.config.languages[languageCode.toLowerCase()];
    if (!language) return false;
    
    return difficulty.toLowerCase() in language;
  }
}

export const promptConfigService = new PromptConfigService(); 