# Gemini LLM Service

This document explains how to use the GeminiService in the Story Learner AI application.

## Overview

The GeminiService provides integration with Google's Gemini AI models using the official `@google/genai` SDK. It supports text generation with configurable parameters like temperature, max tokens, and model selection.

## Installation

The GeminiService uses the official Google GenAI SDK which is already installed in the project:

```bash
npm install @google/genai
```

## Configuration

To use Gemini, configure env vars (the app reads them via `EnvironmentConfig`).

### Environment Variables

Add these environment variables to your `.env` file (see `env.example`):

```bash
# Gemini Configuration
VITE_LLM_PROVIDER=gemini
VITE_LLM_API_KEY=your-google-ai-api-key
VITE_LLM_ENDPOINT=https://generativelanguage.googleapis.com/v1beta
VITE_LLM_MODEL=gemini-2.5-flash-lite
VITE_LLM_MAX_TOKENS=2000
VITE_LLM_TEMPERATURE=0.7
VITE_GEMINI_PROJECT_ID=your-project-id # Optional
```

The manager builds the config at runtime; no manual wiring is required.

## Usage

### Basic Usage

```typescript
import { llmServiceManager } from '@/lib/llm/LLMServiceManager';
import { logger } from '@/lib/logger';

const response = await llmServiceManager.generateCompletion({
  prompt: 'Write a short story about a robot learning to paint.',
  temperature: 0.8,
  maxTokens: 500,
});

logger.info('llm', 'Generated completion', { content: response.content });
```

### Health Check

```typescript
const isHealthy = await llmServiceManager.healthCheck();
```

## Supported Models

Any text generation model supported by `@google/genai` and your key (e.g., `gemini-2.5-flash-lite`, `gemini-1.5-pro`).

## Features

### Token Usage Tracking

The service automatically tracks token usage:

```typescript
const response = await llmServiceManager.generateCompletion({
  prompt: 'Write a haiku about technology.',
});

logger.info('llm', 'Token usage', { tokenUsage: response.tokenUsage });
// Output: { promptTokens: 10, completionTokens: 25, totalTokens: 35 }
```

### Provider and Model

Use `llmServiceManager.getProvider()` and `llmServiceManager.getModel()` for display.

### Error Handling

The service provides comprehensive error handling:

```typescript
try {
  const response = await llmServiceManager.generateCompletion({ prompt: 'Generate content' });
} catch (error) {
  const err = error as { code?: string; message?: string };
  if (err.code === 'GEMINI_ERROR') {
    logger.error('llm', 'Gemini API error', { error: err.message });
  } else {
    logger.error('llm', 'Unexpected error', { error });
  }
}
```

## Advanced Configuration

### Custom Parameters

```typescript
const response = await llmServiceManager.generateCompletion({
  prompt: 'Create a detailed character description.',
  model: 'gemini-1.5-pro',
  temperature: 0.9, // Higher creativity
  maxTokens: 1000, // Longer responses
});
```

### Model Selection

You can specify different models for different use cases:

```typescript
// For creative writing
const creativeResponse = await llmServiceManager.generateCompletion({
  prompt: 'Write a poem about the ocean.',
  model: 'gemini-1.5-pro',
  temperature: 0.8,
});

// For factual information
const factualResponse = await llmServiceManager.generateCompletion({
  prompt: 'Explain the water cycle.',
  model: 'gemini-1.5-flash',
  temperature: 0.2,
});
```

## API Reference

### API Reference

#### `llmServiceManager.generateCompletion(request: LLMRequest): Promise<LLMResponse>`

Generates a text completion using the configured Gemini model.

**Parameters:**

- `request.prompt` (string): The input prompt
- `request.model` (string, optional): Model to use (defaults to config model)
- `request.temperature` (number, optional): Sampling temperature (0.0-2.0)
- `request.maxTokens` (number, optional): Maximum tokens to generate

**Returns:** Promise resolving to an `LLMResponse` object with:

- `content` (string): Generated text
- `tokenUsage` (object): Token usage statistics
- `model` (string): Model used
- `provider` (string): Always 'gemini'

#### `llmServiceManager.healthCheck(): Promise<boolean>`

Checks if the service is healthy and can make API calls.

**Returns:** Promise resolving to `true` if healthy, `false` otherwise.

## Getting API Keys

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your environment variables or configuration

## Rate Limits and Quotas

Be aware of Gemini API rate limits:

- Free tier: 15 requests per minute
- Paid tier: Higher limits based on your plan

## Security Best Practices

1. Never expose your API key in client-side code
2. Use environment variables for API keys
3. Implement rate limiting in your application
4. Monitor API usage and costs

## Troubleshooting

### Common Issues

1. **Invalid API Key**: Ensure your API key is correct and has proper permissions
2. **Model Not Found**: Check that the model name is supported
3. **Rate Limit Exceeded**: Implement retry logic with exponential backoff
4. **Network Errors**: Check your internet connection and firewall settings

### Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
const service = new GeminiService({
  ...config,
  debug: true, // Enable debug logging
});
```

## Examples

### Story Generation

```typescript
import { logger } from './src/lib/logger';

const storyPrompt = `
Write a short story about a time traveler who discovers that changing the past 
has unexpected consequences. The story should be engaging and thought-provoking.
`;

const response = await llmServiceManager.generateCompletion({
  prompt: storyPrompt,
  model: 'gemini-1.5-pro',
  temperature: 0.8,
  maxTokens: 1000,
});

logger.info('llm', 'Generated story', { content: response.content });
```

### Educational Content

```typescript
import { logger } from './src/lib/logger';

const educationPrompt = `
Explain the concept of photosynthesis in a way that a 10-year-old would understand.
Use simple language and relatable examples.
`;

const response = await llmServiceManager.generateCompletion({
  prompt: educationPrompt,
  model: 'gemini-1.5-flash',
  temperature: 0.3,
  maxTokens: 500,
});

logger.info('llm', 'Educational content', { content: response.content });
```
