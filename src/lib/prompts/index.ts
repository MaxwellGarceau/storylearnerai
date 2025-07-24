// Export the main prompt configuration service
export { generalPromptConfigService } from './GeneralPromptConfigService';

// Re-export types for convenience
export type { 
  PromptInstructions, 
  PromptBuildContext, 
  LanguagePromptConfig, 
  GeneralPromptConfig 
} from '../types/prompt'; 