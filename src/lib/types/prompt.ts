// Types for the LLM prompt configuration system

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt';
export type DifficultyLevel = 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2';

export interface PromptInstructions {
  // Language-specific instructions for translation
  vocabulary?: string;
  grammar?: string;
  cultural?: string;
  style?: string;
  examples?: string;
  // Language pair specific fields
  grammar_focus?: string;
  pronunciation_notes?: string;
  common_mistakes?: string;
  helpful_patterns?: string;
}

export interface DifficultyPrompts {
  a1: PromptInstructions;
  a2: PromptInstructions;
  b1: PromptInstructions;
  b2: PromptInstructions;
  c1?: PromptInstructions; // Optional for future expansion
  c2?: PromptInstructions; // Optional for future expansion
}

export interface LanguagePrompts {
  [languageCode: string]: DifficultyPrompts;
}

export interface GeneralPromptConfig {
  instructions: string[];
  template: string;
}

export interface LanguagePromptConfig {
  [languageCode: string]: DifficultyPrompts;
}

export interface PromptConfig {
  general: GeneralPromptConfig;
  languages: LanguagePrompts;
}

export interface PromptBuildContext {
  fromLanguage: string;
  toLanguage: string;
  difficulty: string;
  text: string;
} 