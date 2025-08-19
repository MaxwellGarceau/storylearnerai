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

To use the GeminiService, you need to configure it with your Google AI API key and model preferences.

### Environment Variables

Add these environment variables to your `.env` file:

```bash
# Gemini Configuration
LLM_PROVIDER=gemini
LLM_API_KEY=your-google-ai-api-key
LLM_MODEL=gemini-1.5-flash
LLM_MAX_TOKENS=2000
LLM_TEMPERATURE=0.7
```

### Configuration Object

```typescript
import { GeminiConfig } from './src/lib/types/llm';

const config: GeminiConfig = {
  provider: 'gemini',
  apiKey: 'your-google-ai-api-key',
  endpoint: 'https://generativelanguage.googleapis.com/v1beta', // Optional
  model: 'gemini-1.5-flash',
  maxTokens: 2000,
  temperature: 0.7,
  projectId: 'your-project-id', // Optional
};
```

## Usage

### Basic Usage

```typescript
import { GeminiService } from './src/lib/llm/providers/GeminiService';
import { GeminiConfig } from './src/lib/types/llm';
import { logger } from './src/lib/logger';

const config: GeminiConfig = {
  provider: 'gemini',
  apiKey: 'your-google-ai-api-key',
  model: 'gemini-1.5-flash',
  maxTokens: 2000,
  temperature: 0.7,
};

const service = new GeminiService(config);

// Generate a completion
const response = await service.generateCompletion({
  prompt: 'Write a short story about a robot learning to paint.',
  model: 'gemini-1.5-flash',
  temperature: 0.8,
  maxTokens: 500,
});

logger.info('llm', 'Generated completion', { content: response.content });
```

### Using the LLMServiceManager

```typescript
import { LLMServiceManager } from './src/lib/llm/LLMServiceManager';
import { GeminiConfig } from './src/lib/types/llm';
import { logger } from './src/lib/logger';

const config: GeminiConfig = {
  provider: 'gemini',
  apiKey: 'your-google-ai-api-key',
  model: 'gemini-1.5-flash',
  maxTokens: 2000,
  temperature: 0.7,
};

const manager = new LLMServiceManager();
const service = manager.getService(config);

const response = await service.generateCompletion({
  prompt: 'Explain quantum computing in simple terms.',
});

logger.info('llm', 'Generated completion', { content: response.content });
```

## Supported Models

The GeminiService supports various Gemini models:

- `gemini-1.5-flash` - Fast, efficient model for most use cases
- `gemini-1.5-flash-8b` - Smaller, faster variant
- `gemini-1.5-pro` - More capable model for complex tasks
- `gemini-2.0-flash-exp` - Experimental latest model

## Features

### Token Usage Tracking

The service automatically tracks token usage:

```typescript
const response = await service.generateCompletion({
  prompt: 'Write a haiku about technology.',
});

logger.info('llm', 'Token usage', { tokenUsage: response.tokenUsage });
// Output: { promptTokens: 10, completionTokens: 25, totalTokens: 35 }
```

### Health Check

```typescript
const isHealthy = await service.healthCheck();
logger.info('llm', 'Service health check', { isHealthy });
```

### Error Handling

The service provides comprehensive error handling:

```typescript
try {
  const response = await service.generateCompletion({
    prompt: 'Generate content',
  });
} catch (error) {
  if (error.code === 'GEMINI_ERROR') {
    logger.error('llm', 'Gemini API error', { error: error.message });
  } else {
    logger.error('llm', 'Unexpected error', { error });
  }
}
```

## Advanced Configuration

### Custom Parameters

```typescript
const response = await service.generateCompletion({
  prompt: 'Create a detailed character description.',
  model: 'gemini-1.5-pro',
  temperature: 0.9,     // Higher creativity
  maxTokens: 1000,      // Longer responses
});
```

### Model Selection

You can specify different models for different use cases:

```typescript
// For creative writing
const creativeResponse = await service.generateCompletion({
  prompt: 'Write a poem about the ocean.',
  model: 'gemini-1.5-pro',
  temperature: 0.8,
});

// For factual information
const factualResponse = await service.generateCompletion({
  prompt: 'Explain the water cycle.',
  model: 'gemini-1.5-flash',
  temperature: 0.2,
});
```

## API Reference

### GeminiService Methods

#### `generateCompletion(request: LLMRequest): Promise<LLMResponse>`

Generates a text completion using the Gemini API.

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

#### `healthCheck(): Promise<boolean>`

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

const response = await service.generateCompletion({
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

const response = await service.generateCompletion({
  prompt: educationPrompt,
  model: 'gemini-1.5-flash',
  temperature: 0.3,
  maxTokens: 500,
});

logger.info('llm', 'Educational content', { content: response.content });
``` 