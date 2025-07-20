import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LlamaService } from '../providers/LlamaService';
import { LlamaConfig } from '../../types/llm';

// Mock fetch globally
global.fetch = vi.fn();

describe('LlamaService', () => {
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
      const mockResponse = {
        message: {
          content: 'Hello! How can I help you today?',
        },
        model: 'llama3.1:8b',
        prompt_eval_count: 10,
        eval_count: 15,
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await service.generateCompletion({
        prompt: 'Hello, world!',
      });

      expect(result).toEqual({
        content: 'Hello! How can I help you today?',
        model: 'llama3.1:8b',
        provider: 'llama',
        tokenUsage: {
          promptTokens: 10,
          completionTokens: 15,
          totalTokens: 25,
        },
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/chat',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('llama3.1:8b'),
        })
      );
    });

    it('should perform health check using tags endpoint', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
      } as Response);

      const result = await service.healthCheck();

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:11434/tags',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });
  });

  describe('Groq Provider', () => {
    beforeEach(() => {
      const config: LlamaConfig = {
        provider: 'llama',
        apiKey: 'gsk_test_key',
        endpoint: 'https://api.groq.com/openai/v1',
        model: 'llama3-8b-8192',
        maxTokens: 2000,
        temperature: 0.7,
        llamaProvider: 'groq',
      };
      service = new LlamaService(config);
    });

    it('should generate completion with Groq format', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Hello from Groq!',
            },
          },
        ],
        model: 'llama3-8b-8192',
        usage: {
          prompt_tokens: 8,
          completion_tokens: 12,
          total_tokens: 20,
        },
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await service.generateCompletion({
        prompt: 'Hello, Groq!',
      });

      expect(result).toEqual({
        content: 'Hello from Groq!',
        model: 'llama3-8b-8192',
        provider: 'llama',
        tokenUsage: {
          promptTokens: 8,
          completionTokens: 12,
          totalTokens: 20,
        },
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://api.groq.com/openai/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer gsk_test_key',
          }),
        })
      );
    });
  });

  describe('Together AI Provider', () => {
    beforeEach(() => {
      const config: LlamaConfig = {
        provider: 'llama',
        apiKey: 'together_test_key',
        endpoint: 'https://api.together.xyz/v1',
        model: 'meta-llama/Llama-2-7b-chat-hf',
        maxTokens: 2000,
        temperature: 0.7,
        llamaProvider: 'together',
        stopSequences: ['<|end|>'],
      };
      service = new LlamaService(config);
    });

    it('should generate completion with Together format', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Hello from Together AI!',
            },
          },
        ],
        model: 'meta-llama/Llama-2-7b-chat-hf',
        usage: {
          prompt_tokens: 15,
          completion_tokens: 20,
          total_tokens: 35,
        },
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await service.generateCompletion({
        prompt: 'Hello, Together AI!',
      });

      expect(result).toEqual({
        content: 'Hello from Together AI!',
        model: 'meta-llama/Llama-2-7b-chat-hf',
        provider: 'llama',
        tokenUsage: {
          promptTokens: 15,
          completionTokens: 20,
          totalTokens: 35,
        },
      });

      const requestBody = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
      expect(requestBody.stop).toEqual(['<|end|>']);
    });
  });

  describe('Replicate Provider', () => {
    beforeEach(() => {
      const config: LlamaConfig = {
        provider: 'llama',
        apiKey: 'r8_test_key',
        endpoint: 'https://api.replicate.com/v1',
        model: 'meta/llama-2-7b-chat',
        maxTokens: 2000,
        temperature: 0.7,
        llamaProvider: 'replicate',
      };
      service = new LlamaService(config);
    });

    it('should generate completion with Replicate format', async () => {
      const mockResponse = {
        output: ['Hello from Replicate!'],
        metrics: {
          predict_time: 2.5,
        },
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await service.generateCompletion({
        prompt: 'Hello, Replicate!',
      });

      expect(result).toEqual({
        content: 'Hello from Replicate!',
        model: 'meta/llama-2-7b-chat',
        provider: 'llama',
        tokenUsage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://api.replicate.com/v1/predictions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Token r8_test_key',
          }),
        })
      );
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      const config: LlamaConfig = {
        provider: 'llama',
        apiKey: 'test_key',
        endpoint: 'http://localhost:11434',
        model: 'llama3.1:8b',
        maxTokens: 2000,
        temperature: 0.7,
        llamaProvider: 'ollama',
      };
      service = new LlamaService(config);
    });

    it('should handle API errors', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error',
      } as Response);

      await expect(service.generateCompletion({
        prompt: 'Test prompt',
      })).rejects.toThrow('API request failed: 500 Internal Server Error. Server error');
    });

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      await expect(service.generateCompletion({
        prompt: 'Test prompt',
      })).rejects.toThrow('Network error');
    });

    it('should return false for failed health check', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Connection failed'));

      const result = await service.healthCheck();
      expect(result).toBe(false);
    });
  });
}); 