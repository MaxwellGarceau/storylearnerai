import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LlamaService } from '../providers/LlamaService';
import { LlamaConfig } from '../../types/llm';

// Create a proper mock for fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper function to create proper Response mock
const createMockResponse = (data: any, options: { ok?: boolean; status?: number; statusText?: string } = {}) => {
  const response = {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    statusText: options.statusText ?? 'OK',
    json: async () => data,
    text: async () => JSON.stringify(data),
    clone: () => response,
    headers: new Map(),
    body: null,
    bodyUsed: false,
    redirected: false,
    type: 'basic' as ResponseType,
    url: '',
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    bytes: async () => new Uint8Array(),
    formData: async () => new FormData(),
  };
  return response as unknown as Response;
};

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

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

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
      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      const result = await service.healthCheck();
      expect(result).toBe(true);
    });
  });

  describe('Groq Provider', () => {
    beforeEach(() => {
      const config: LlamaConfig = {
        provider: 'llama',
        apiKey: 'test-api-key',
        endpoint: 'https://api.groq.com/openai/v1',
        model: 'llama3-8b-8192',
        maxTokens: 2000,
        temperature: 0.7,
        llamaProvider: 'groq',
        systemPrompt: 'You are a helpful assistant.',
      };
      service = new LlamaService(config);
    });

    it('should generate completion with Groq format', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Hello! How can I help you today?',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25,
        },
        model: 'llama3-8b-8192',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

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
      expect(result.model).toBe('llama3-8b-8192');
      expect(result.provider).toBe('llama');
    });
  });

  describe('Together AI Provider', () => {
    beforeEach(() => {
      const config: LlamaConfig = {
        provider: 'llama',
        apiKey: 'test-api-key',
        endpoint: 'https://api.together.xyz/v1',
        model: 'meta-llama/Llama-2-7b-chat-hf',
        maxTokens: 2000,
        temperature: 0.7,
        llamaProvider: 'together',
        systemPrompt: 'You are a helpful assistant.',
      };
      service = new LlamaService(config);
    });

    it('should generate completion with Together format', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Hello! How can I help you today?',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25,
        },
        model: 'meta-llama/Llama-2-7b-chat-hf',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

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
      expect(result.model).toBe('meta-llama/Llama-2-7b-chat-hf');
      expect(result.provider).toBe('llama');
    });
  });

  describe('Replicate Provider', () => {
    beforeEach(() => {
      const config: LlamaConfig = {
        provider: 'llama',
        apiKey: 'test-api-key',
        endpoint: 'https://api.replicate.com/v1',
        model: 'meta/llama-2-7b-chat',
        maxTokens: 2000,
        temperature: 0.7,
        llamaProvider: 'replicate',
        systemPrompt: 'You are a helpful assistant.',
      };
      service = new LlamaService(config);
    });

    it('should generate completion with Replicate format', async () => {
      const mockResponse = {
        output: ['Hello! How can I help you today?'],
        status: 'succeeded',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await service.generateCompletion({
        prompt: 'Hello',
        maxTokens: 100,
        temperature: 0.7,
      });

      expect(result.content).toBe('Hello! How can I help you today?');
      expect(result.model).toBe('meta/llama-2-7b-chat');
      expect(result.provider).toBe('llama');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      const config: LlamaConfig = {
        provider: 'llama',
        apiKey: 'test-api-key',
        endpoint: 'https://api.groq.com/openai/v1',
        model: 'llama3-8b-8192',
        maxTokens: 2000,
        temperature: 0.7,
        llamaProvider: 'groq',
        systemPrompt: 'You are a helpful assistant.',
      };
      service = new LlamaService(config);
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({}, {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      }));

      await expect(service.generateCompletion({
        prompt: 'Hello',
        maxTokens: 100,
        temperature: 0.7,
      })).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.generateCompletion({
        prompt: 'Hello',
        maxTokens: 100,
        temperature: 0.7,
      })).rejects.toThrow('Network error');
    });

    it('should return false for failed health check', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await service.healthCheck();
      expect(result).toBe(false);
    });
  });
}); 