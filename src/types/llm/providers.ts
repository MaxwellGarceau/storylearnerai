export type LLMProvider = 'gemini';

interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  endpoint: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface LLMRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface LLMResponse {
  content: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: LLMProvider;
}

export interface LLMError {
  message: string;
  code: string;
  provider: LLMProvider;
  statusCode?: number;
}

// Provider-specific configuration interfaces
export interface GeminiConfig extends LLMConfig {
  provider: 'gemini';
  projectId?: string;
}

export type ProviderConfig = GeminiConfig;
