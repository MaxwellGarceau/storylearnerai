import { PromptConfig, PromptInstructions, PromptBuildContext } from '../types/prompt';
import promptConfigData from './prompts.json';

class PromptConfigService {
  private config: PromptConfig;

  constructor() {
    this.config = promptConfigData as PromptConfig;
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
  buildPrompt(context: PromptBuildContext): string {
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

    // Build the complete prompt using the template
    let prompt = this.getTemplate()
      .replace('{fromLanguage}', this.getLanguageName(fromLanguage))
      .replace('{toLanguage}', this.getLanguageName(toLanguage))
      .replace('{difficulty}', difficulty.toUpperCase())
      .replace('{instructions}', instructionsText)
      .replace('{languageInstructions}', languageInstructionsText)
      .replace('{text}', text);

    // Replace any remaining placeholders
    prompt = prompt.replace(/{fromLanguage}/g, this.getLanguageName(fromLanguage));
    prompt = prompt.replace(/{toLanguage}/g, this.getLanguageName(toLanguage));

    return prompt;
  }

  /**
   * Get full language name from language code
   */
  private getLanguageName(languageCode: string): string {
    const languageNames: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese'
    };

    return languageNames[languageCode.toLowerCase()] || languageCode;
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