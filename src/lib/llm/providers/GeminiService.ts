import { LLMService } from '../LLMService';
import { LLMRequest, LLMResponse, GeminiConfig } from '../../types/llm';
import { logger } from '../../../logger';
import { GoogleGenAI } from '@google/genai';

export class GeminiService extends LLMService {
  private genAI: GoogleGenAI;

  constructor(config: GeminiConfig) {
    super(config);
    this.genAI = new GoogleGenAI({ apiKey: config.apiKey });
  }

  async generateCompletion(request: LLMRequest): Promise<LLMResponse> {
    try {
      const geminiConfig = this.config as GeminiConfig;
      const model = request.model || geminiConfig.model;
      
      const response = await this.genAI.models.generateContent({
        model: model,
        contents: request.prompt,
        config: {
          temperature: request.temperature || geminiConfig.temperature,
          maxOutputTokens: request.maxTokens || geminiConfig.maxTokens,
        },
      });

      const content = response.text || '';
      const usage = response.usageMetadata;

      return {
        content,
        tokenUsage: usage ? {
          promptTokens: usage.promptTokenCount || 0,
          completionTokens: usage.candidatesTokenCount || 0,
          totalTokens: usage.totalTokenCount || 0,
        } : undefined,
        model: model,
        provider: 'gemini',
      };
    } catch (error) {
      logger.error('llm', 'Gemini API error', { error });
      throw error instanceof Error && 'provider' in error
        ? error
        : this.createError(
          error instanceof Error ? error.message : 'Gemini API request failed',
          'GEMINI_ERROR'
        );
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const geminiConfig = this.config as GeminiConfig;
      const model = geminiConfig.model;
      
      const response = await this.genAI.models.generateContent({
        model: model,
        contents: 'ping',
        config: {
          temperature: 0,
          maxOutputTokens: 1,
        },
      });

      return response.text !== undefined;
    } catch (error) {
      logger.error('llm', 'Gemini health check failed', { error });
      return false;
    }
  }
} 