import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiService } from '../providers/GeminiService';
import { GeminiConfig } from '../../../types/llm/providers';

// Mock the @google/genai module
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn(),
    },
  })),
}));

describe('GeminiService', () => {
  let service: GeminiService;
  let mockGenerateContent: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    const config: GeminiConfig = {
      provider: 'gemini',
      apiKey: 'test-api-key',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta',
      model: 'gemini-1.5-flash',
      maxTokens: 2000,
      temperature: 0.7,
      projectId: 'test-project',
    };
    
    service = new GeminiService(config);
    mockGenerateContent = (service as unknown as { genAI: { models: { generateContent: ReturnType<typeof vi.fn> } } }).genAI.models.generateContent;
  });

  it('should generate completion with Gemini format', async () => {
    const mockResponse = {
      text: 'Hello! How can I help you today?',
      usageMetadata: {
        promptTokenCount: 10,
        candidatesTokenCount: 15,
        totalTokenCount: 25,
      },
    };

    mockGenerateContent.mockResolvedValueOnce(mockResponse);

    const request = {
      prompt: 'Hello',
      model: 'gemini-1.5-flash',
      temperature: 0.7,
      maxTokens: 100,
    };

    const result = await service.generateCompletion(request);

    expect(mockGenerateContent).toHaveBeenCalledWith({
      model: 'gemini-1.5-flash',
      contents: 'Hello',
      config: {
        temperature: 0.7,
        maxOutputTokens: 100,
      },
    });

    expect(result).toEqual({
      content: 'Hello! How can I help you today?',
      tokenUsage: {
        promptTokens: 10,
        completionTokens: 15,
        totalTokens: 25,
      },
      model: 'gemini-1.5-flash',
      provider: 'gemini',
    });
  });

  it('should handle API errors', async () => {
    const mockError = new Error('API Error');
    mockGenerateContent.mockRejectedValueOnce(mockError);

    const request = {
      prompt: 'Hello',
      model: 'gemini-1.5-flash',
    };

    await expect(service.generateCompletion(request)).rejects.toThrow('API Error');
  });

  it('should use default model from config', async () => {
    const mockResponse = {
      text: 'Response text',
      usageMetadata: {
        promptTokenCount: 5,
        candidatesTokenCount: 10,
        totalTokenCount: 15,
      },
    };

    mockGenerateContent.mockResolvedValueOnce(mockResponse);

    const request = {
      prompt: 'Hello',
      // No model specified, should use config default
    };

    const result = await service.generateCompletion(request);

    expect(mockGenerateContent).toHaveBeenCalledWith({
      model: 'gemini-1.5-flash', // Should use config default
      contents: 'Hello',
      config: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    });

    expect(result.model).toBe('gemini-1.5-flash');
  });

  it('should use request parameters over config defaults', async () => {
    const mockResponse = {
      text: 'Response text',
      usageMetadata: {
        promptTokenCount: 5,
        candidatesTokenCount: 10,
        totalTokenCount: 15,
      },
    };

    mockGenerateContent.mockResolvedValueOnce(mockResponse);

    const request = {
      prompt: 'Hello',
      model: 'gemini-1.5-pro',
      temperature: 0.9,
      maxTokens: 500,
    };

    await service.generateCompletion(request);

    expect(mockGenerateContent).toHaveBeenCalledWith({
      model: 'gemini-1.5-pro',
      contents: 'Hello',
      config: {
        temperature: 0.9,
        maxOutputTokens: 500,
      },
    });
  });

  it('should handle missing usage metadata', async () => {
    const mockResponse = {
      text: 'Response text',
      // No usageMetadata
    };

    mockGenerateContent.mockResolvedValueOnce(mockResponse);

    const request = {
      prompt: 'Hello',
    };

    const result = await service.generateCompletion(request);

    expect(result.tokenUsage).toBeUndefined();
  });

  it('should handle empty response text', async () => {
    const mockResponse = {
      text: '',
      usageMetadata: {
        promptTokenCount: 5,
        candidatesTokenCount: 0,
        totalTokenCount: 5,
      },
    };

    mockGenerateContent.mockResolvedValueOnce(mockResponse);

    const request = {
      prompt: 'Hello',
    };

    const result = await service.generateCompletion(request);

    expect(result.content).toBe('');
  });

  it('should pass health check when generateContent returns text', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: 'pong',
    });

    const isHealthy = await service.healthCheck();

    expect(isHealthy).toBe(true);
    expect(mockGenerateContent).toHaveBeenCalledWith({
      model: 'gemini-1.5-flash',
      contents: 'ping',
      config: {
        temperature: 0,
        maxOutputTokens: 1,
      },
    });
  });

  it('should fail health check when generateContent throws error', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Health check failed'));

    const isHealthy = await service.healthCheck();

    expect(isHealthy).toBe(false);
  });
}); 