import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LlamaService } from '../providers/LlamaService';
import { LlamaConfig } from '../../../types/llm/providers';
import { http, HttpResponse } from 'msw';
import { server } from '../../../__tests__/mocks/supabaseMock';

// Disabled: LlamaService tests - only Gemini is actively used
describe.skip('LlamaService', () => {
  let service: LlamaService;
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Ollama Provider', () => {
    beforeEach(() => {
      const config: LlamaConfig = {
        provider: 'llama',
        apiKey: 'none',
        endpoint: 'http://localhost:11434',
        model: 'llama3.1:8b',
        maxTokens: 2000,
        temperature: 0.7,
        llamaProvider: 'ollama',
        systemPrompt: 'You are a helpful assistant.',
      };
      service = new LlamaService(config);
    });

    it('should generate completion with Ollama format', async () => {
      const result = await service.generateCompletion({
        prompt: 'Hello',
        maxTokens: 100,
        temperature: 0.7,
      });

      expect(result.content).toBe('Hello! How can I help you today?');
      expect(result.tokenUsage).toEqual({
        promptTokens: 10,
        completionTokens: 15,
        totalTokens: 25,
      });
      expect(result.model).toBe('llama3.1:8b');
      expect(result.provider).toBe('llama');
    });

    it('should perform health check using tags endpoint', async () => {
      const result = await service.healthCheck();
      expect(result).toBe(true);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      const config: LlamaConfig = {
        provider: 'llama',
        apiKey: 'none',
        endpoint: 'http://localhost:11434',
        model: 'llama3.1:8b',
        maxTokens: 2000,
        temperature: 0.7,
        llamaProvider: 'ollama',
        systemPrompt: 'You are a helpful assistant.',
      };
      service = new LlamaService(config);
    });

    it('should handle API errors', async () => {
      server.use(
        http.post('http://localhost:11434/api/chat', () => {
          return new HttpResponse(null, { status: 500 });
        }),
      );

      await expect(service.generateCompletion({
        prompt: 'Hello',
        maxTokens: 100,
        temperature: 0.7,
      })).rejects.toThrow('API request failed: 500 Internal Server Error.');
    });

    it('should handle network errors', async () => {
      server.use(
        http.post('http://localhost:11434/api/chat', () => {
          return HttpResponse.error()
        }),
      );

      await expect(service.generateCompletion({
        prompt: 'Hello',
        maxTokens: 100,
        temperature: 0.7,
      })).rejects.toThrow('Failed to fetch');
    });

    it('should return false for failed health check', async () => {
      server.use(
        http.post('http://localhost:11434/api/tags', () => {
          return HttpResponse.error()
        }),
      )
      const result = await service.healthCheck();
      expect(result).toBe(false);
    });
  });
}); 