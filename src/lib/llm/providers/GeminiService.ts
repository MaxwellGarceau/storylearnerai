import { LLMService } from '../LLMService';
import {
  LLMRequest,
  LLMResponse,
  GeminiConfig,
} from '../../../types/llm/providers';
import { logger } from '../../../lib/logger';
import { GoogleGenAI } from '@google/genai';

export class GeminiService extends LLMService {
  private genAI: GoogleGenAI;

  constructor(config: GeminiConfig) {
    super(config);
    this.genAI = new GoogleGenAI({ apiKey: config.apiKey });
  }

  async generateCompletion(request: LLMRequest): Promise<LLMResponse> {
    try {
      const geminiConfig = this.config;
      const model = request.model ?? geminiConfig.model;

      logger.debug('llm', 'Sending Gemini API request', {
        model,
        promptLength: request.prompt.length,
        maxTokens: request.maxTokens ?? geminiConfig.maxTokens,
        temperature: request.temperature ?? geminiConfig.temperature,
      });

      const response = await this.genAI.models.generateContent({
        model: model,
        contents: [{ text: request.prompt }],
        config: {
          temperature: request.temperature ?? geminiConfig.temperature,
          maxOutputTokens: request.maxTokens ?? geminiConfig.maxTokens,
          responseMimeType: 'application/json',
        },
      });

      const content = response.text ?? '';
      const usage = response.usageMetadata;

      logger.info('llm', 'Received Gemini API response', {
        model,
        contentLength: content.length,
        promptTokens: usage?.promptTokenCount ?? 0,
        completionTokens: usage?.candidatesTokenCount ?? 0,
        totalTokens: usage?.totalTokenCount ?? 0,
      });

      // Log raw response for debugging JSON format
      logger.debug('llm', 'Raw Gemini response content', {
        contentPreview: content.substring(0, 500),
        isValidJson: this.isValidJson(content),
      });

      return {
        content,
        tokenUsage: usage
          ? {
              promptTokens: usage.promptTokenCount ?? 0,
              completionTokens: usage.candidatesTokenCount ?? 0,
              totalTokens: usage.totalTokenCount ?? 0,
            }
          : undefined,
        model: model,
        provider: 'gemini',
      };
    } catch (error) {
      logger.error('llm', 'Gemini API error', { error });
      throw error instanceof Error && 'provider' in error
        ? error
        : new Error(
            error instanceof Error ? error.message : 'Gemini API request failed'
          );
    }
  }

  private isValidJson(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const geminiConfig = this.config;
      const model = geminiConfig.model;

      const response = await this.genAI.models.generateContent({
        model: model,
        contents: [{ text: 'ping' }],
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
