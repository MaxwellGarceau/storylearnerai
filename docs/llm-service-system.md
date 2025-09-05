# LLM Service System Documentation

## Overview

The LLM Service System provides a unified interface for interacting with a configured Large Language Model provider. The current implementation supports Google Gemini via the official `@google/genai` SDK.

## Architecture

### Core Components

1. **Abstract Base Class (`LLMService`)**: Defines `generateCompletion()` and `healthCheck()`
2. **Provider Implementation (`GeminiService`)**: Uses `@google/genai` to call Gemini models
3. **Service Factory (`LLMServiceFactory`)**: Returns a provider implementation (currently `gemini` only)
4. **Service Manager (`LLMServiceManager`)**: Singleton that reads env config and delegates calls
5. **Environment Configuration (`EnvironmentConfig`)**: Validates and exposes `VITE_LLM_*` variables

## Usage

### Basic Usage

```typescript
import { llmServiceManager } from '@/lib/llm/LLMServiceManager';
import { logger } from '@/lib/logger';

// Generate text completion
const response = await llmServiceManager.generateCompletion({
  prompt: 'Translate this text to English: Hola mundo',
  maxTokens: 1000,
  temperature: 0.7,
});

logger.info('llm', 'Generated text', { content: response.content });
logger.info('llm', 'Response details', {
  provider: response.provider,
  model: response.model,
});
```

### Health Check

```typescript
const isHealthy = await llmServiceManager.healthCheck();
if (!isHealthy) {
  logger.error('llm', 'LLM service is not available');
}
```

### Provider Information

```typescript
const provider = llmServiceManager.getProvider(); // 'gemini'
const model = llmServiceManager.getModel(); // e.g., 'gemini-2.5-flash-lite'
const config = llmServiceManager.getConfig(); // Full configuration
```

### Provider Switching

The factory currently supports only `gemini`. `LLMServiceManager.reinitialize()` is available for future multi‑provider support.

## Environment Configuration

### Required Variables

```bash
VITE_LLM_PROVIDER=gemini
VITE_LLM_API_KEY=your-gemini-api-key
VITE_LLM_ENDPOINT=https://generativelanguage.googleapis.com/v1beta
VITE_LLM_MODEL=gemini-2.5-flash-lite
VITE_LLM_MAX_TOKENS=2000
VITE_LLM_TEMPERATURE=0.7
VITE_GEMINI_PROJECT_ID=your-project-id # Optional
```

### Provider-Specific Configuration

Only Gemini is currently implemented.

## Adding New Providers

### Step 1: Create Provider Configuration Type

```typescript
// In src/lib/types/llm.ts
export interface NewProviderConfig extends LLMConfig {
  provider: 'newprovider';
  customParam?: string;
}

// Update union type
export type ProviderConfig = GeminiConfig | NewProviderConfig;
```

### Step 2: Create Provider Service

```typescript
// In src/lib/llm/providers/NewProviderService.ts
import { LLMService } from '../LLMService';
import { LLMRequest, LLMResponse, NewProviderConfig } from '../../types/llm';

export class NewProviderService extends LLMService {
  constructor(config: NewProviderConfig) {
    super(config);
  }

  async generateCompletion(request: LLMRequest): Promise<LLMResponse> {
    const providerConfig = this.config as NewProviderConfig;

    // Implement API call logic here
    const response = await fetch(`${providerConfig.endpoint}/completions`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({
        // Provider-specific request format
      }),
    });

    const data = await this.handleResponse(response);

    return {
      content: data.text, // Map to provider response format
      model: data.model,
      provider: 'newprovider',
      // ... other fields
    };
  }

  async healthCheck(): Promise<boolean> {
    // Implement health check logic
    return true;
  }
}
```

### Step 3: Update Factory

```typescript
// In src/lib/llm/LLMServiceFactory.ts
import { NewProviderService } from './providers/NewProviderService';

export class LLMServiceFactory {
  static createService(config: ProviderConfig): LLMService {
    switch (config.provider) {
      case 'gemini':
        return new GeminiService(config as any);
      case 'newprovider':
        return new NewProviderService(config as any);
    }
  }

  static getAvailableProviders(): string[] {
    return ['gemini', 'newprovider'];
  }
}
```

### Step 4: Update Environment Configuration

```typescript
// In src/lib/config/env.ts
export class EnvironmentConfig {
  static getLLMConfig(): ProviderConfig {
    // ... existing code
    switch (provider) {
      case 'gemini':
        return { ...baseConfig, provider: 'gemini' };
      case 'newprovider':
        return { ...baseConfig, provider: 'newprovider' };
    }
  }
}
```

## Error Handling

### Standard Error Format

```typescript
interface LLMError {
  message: string;
  code: string;
  provider: LLMProvider;
  statusCode?: number;
}
```

### Common Error Codes

- `API_ERROR`: HTTP request failed
- `PARSE_ERROR`: Response parsing failed
- `OPENAI_ERROR`: OpenAI-specific error
- `ANTHROPIC_ERROR`: Anthropic-specific error
- `LLAMA_ERROR`: Llama provider-specific error
- `CUSTOM_ERROR`: Custom provider error

### Error Handling Example

```typescript
try {
  const response = await llmServiceManager.generateCompletion({
    prompt: 'Hello world',
  });
} catch (error) {
  if (error.provider === 'openai' && error.statusCode === 429) {
    // Handle rate limiting
  } else if (error.code === 'API_ERROR') {
    // Handle general API errors
  }
}
```

## Testing

### Mocking in Tests

```typescript
import { vi } from 'vitest';
import { EnvironmentConfig } from '@/lib/config/env';

vi.mock('@/lib/config/env', () => ({
  EnvironmentConfig: {
    getLLMConfig: vi.fn().mockReturnValue({
      provider: 'openai',
      apiKey: 'test-key',
      endpoint: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini',
      maxTokens: 1000,
      temperature: 0.7,
    }),
  },
}));
```

### Integration Testing

```typescript
describe('LLM Service Integration', () => {
  it('should handle real API calls', async () => {
    // Only run if API key is available
    if (!process.env.VITE_LLM_API_KEY) {
      return;
    }

    const response = await llmServiceManager.generateCompletion({
      prompt: 'Say hello',
      maxTokens: 10,
    });

    expect(response.content).toBeDefined();
    expect(response.provider).toBe('openai');
  });
});
```

## Best Practices

1. **Always handle errors gracefully**
2. **Use environment variables for configuration**
3. **Implement proper health checks**
4. **Log API usage for monitoring**
5. **Use appropriate token limits**
6. **Implement retry logic for transient failures**
7. **Cache responses when appropriate**
8. **Monitor API costs and usage**

## Future Enhancements

- **Streaming support** for real-time responses
- **Multi-model orchestration** for complex workflows
- **Response caching** for improved performance
- **Usage analytics** for monitoring and optimization
- **Automatic failover** between providers
- **UI component** for provider selection
