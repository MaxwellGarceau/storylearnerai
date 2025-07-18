export type LLMProvider = 'openai' | 'anthropic' | 'google' | 'gemini' | 'llama' | 'custom';

export interface LLMConfig {
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
export interface OpenAIConfig extends LLMConfig {
  provider: 'openai';
  organization?: string;
}

export interface AnthropicConfig extends LLMConfig {
  provider: 'anthropic';
  version?: string;
}

export interface GoogleConfig extends LLMConfig {
  provider: 'google';
  projectId?: string;
}

export interface GeminiConfig extends LLMConfig {
  provider: 'gemini';
  projectId?: string;
}

export interface LlamaConfig extends LLMConfig {
  provider: 'llama';
  llamaProvider?: 'ollama' | 'groq' | 'together' | 'replicate' | 'custom';
  systemPrompt?: string;
  stopSequences?: string[];
  headers?: Record<string, string>;
}

export interface CustomConfig extends LLMConfig {
  provider: 'custom';
  headers?: Record<string, string>;
}

export type ProviderConfig = OpenAIConfig | AnthropicConfig | GoogleConfig | GeminiConfig | LlamaConfig | CustomConfig; 