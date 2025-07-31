// Types for the LLM prompt configuration system

export type LanguageCode = 'en' | 'es';
export type DifficultyLevel = 'a1' | 'a2' | 'b1' | 'b2';
export type DifficultyLevelDisplay = 'A1' | 'A2' | 'B1' | 'B2';

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

export interface NativeToTargetInstructions {
  description: string;
  grammar_focus: {
    [key: string]: string;
  };
  vocabulary_focus: {
    [key: string]: string;
  };
  phonetics_support_in_text?: {
    [key: string]: string;
  };
}

export interface NativeToTargetDifficultyPrompts {
  a1: NativeToTargetInstructions;
  a2: NativeToTargetInstructions;
  b1: NativeToTargetInstructions;
  b2: NativeToTargetInstructions;
}

export type NativeToTargetConfig = {
  [K in LanguageCode]: NativeToTargetDifficultyPrompts;
};

export type NativeToTargetLanguageConfig = {
  [K in LanguageCode]: NativeToTargetConfig;
};

export interface DifficultyPrompts {
  a1: PromptInstructions;
  a2: PromptInstructions;
  b1: PromptInstructions;
  b2: PromptInstructions;
}

export type LanguagePrompts = {
  [K in LanguageCode]: DifficultyPrompts;
};

export interface GeneralPromptConfig {
  instructions: string[];
}

export interface TemplateConfig {
  template: string;
}

export type LanguagePromptConfig = {
  [K in LanguageCode]: DifficultyPrompts;
};

export interface PromptConfig {
  general: GeneralPromptConfig;
  languages: LanguagePrompts;
}

export interface PromptBuildContext {
  fromLanguage: LanguageCode;
  toLanguage: LanguageCode;
  difficulty: DifficultyLevel;
  text: string;
  nativeLanguage?: LanguageCode; // Optional: user's native language for enhanced customization
} 