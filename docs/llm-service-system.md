# LLM Service System Documentation

## Overview

The LLM Service System provides a unified interface for interacting with multiple Large Language Model providers. It's designed to be extensible, type-safe, and easy to use while abstracting away the complexities of different API formats.

## Architecture

### Core Components

1. **Abstract Base Class (`LLMService`)**
   - Defines the contract for all LLM providers
   - Provides common functionality like error handling and response processing
   - Abstract methods: `generateCompletion()`, `healthCheck()`

2. **Provider Implementations**
   - `OpenAIService`: OpenAI GPT models
   - `AnthropicService`: Anthropic Claude models
   - `LlamaService`: Meta Llama models via various providers (Ollama, Groq, Together AI, Replicate)
   - `CustomService`: Generic implementation for custom APIs

3. **Service Factory (`LLMServiceFactory`)**
   - Creates appropriate service instances based on provider configuration
   - Provides metadata about available providers

4. **Service Manager (`LLMServiceManager`)**
   - Singleton that manages the active LLM service
   - Handles environment configuration
   - Provides easy access to LLM functionality

5. **Environment Configuration (`EnvironmentConfig`)**
   - Parses and validates environment variables
   - Provides type-safe configuration objects

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
const provider = llmServiceManager.getProvider(); // e.g., 'openai'
const model = llmServiceManager.getModel(); // e.g., 'gpt-4o-mini'
const config = llmServiceManager.getConfig(); // Full configuration
```

### Dynamic Provider Switching

```typescript
// Switch to a different provider at runtime
const newConfig = {
  provider: 'anthropic',
  apiKey: 'your-claude-api-key',
  endpoint: 'https://api.anthropic.com/v1',
  model: 'claude-3-haiku-20240307',
  maxTokens: 2000,
  temperature: 0.7,
  version: '2023-06-01',
};

llmServiceManager.reinitialize(newConfig);
```

## Environment Configuration

### Required Variables

```bash
VITE_LLM_PROVIDER=openai|anthropic|google|llama|custom
VITE_LLM_API_KEY=your-api-key
VITE_LLM_ENDPOINT=https://api.provider.com/v1
VITE_LLM_MODEL=model-name
VITE_LLM_MAX_TOKENS=2000
VITE_LLM_TEMPERATURE=0.7
```

### Provider-Specific Configuration

#### OpenAI

```bash
VITE_LLM_PROVIDER=openai
VITE_LLM_API_KEY=sk-...
VITE_LLM_ENDPOINT=https://api.openai.com/v1
VITE_LLM_MODEL=gpt-4o-mini
VITE_OPENAI_ORGANIZATION=org-... # Optional
```

#### Anthropic

```bash
VITE_LLM_PROVIDER=anthropic
VITE_LLM_API_KEY=sk-ant-...
VITE_LLM_ENDPOINT=https://api.anthropic.com/v1
VITE_LLM_MODEL=claude-3-haiku-20240307
VITE_ANTHROPIC_VERSION=2023-06-01 # Optional
```

#### Meta Llama

```bash
VITE_LLM_PROVIDER=llama
VITE_LLM_API_KEY=your-llama-api-key # or "none" for Ollama
VITE_LLM_ENDPOINT=http://localhost:11434
VITE_LLM_MODEL=llama3.1:8b
VITE_LLAMA_PROVIDER=ollama # ollama|groq|together|replicate|custom
VITE_LLAMA_SYSTEM_PROMPT=You are a helpful assistant. # Optional
VITE_LLAMA_STOP_SEQUENCES=["<|end|>", "<|stop|>"] # Optional JSON array
VITE_LLAMA_HEADERS={"X-Custom-Header": "value"} # Optional JSON
```

##### Llama Provider Options:

- **ollama**: Local deployment (http://localhost:11434)
- **groq**: Groq cloud API (https://api.groq.com/openai/v1)
- **together**: Together AI (https://api.together.xyz/v1)
- **replicate**: Replicate (https://api.replicate.com/v1)
- **custom**: Custom endpoint with OpenAI-compatible format

#### Custom

```bash
VITE_LLM_PROVIDER=custom
VITE_LLM_API_KEY=your-custom-key
VITE_LLM_ENDPOINT=https://your-api.com/v1
VITE_LLM_MODEL=your-model
VITE_CUSTOM_HEADERS={"X-Custom-Header": "value"} # Optional JSON
```

## Adding New Providers

### Step 1: Create Provider Configuration Type

```typescript
// In src/lib/types/llm.ts
export interface NewProviderConfig extends LLMConfig {
  provider: 'newprovider';
  customParam?: string;
}

// Update union type
export type ProviderConfig =
  | OpenAIConfig
  | AnthropicConfig
  | GeminiConfig
  | CustomConfig
  | NewProviderConfig;
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
      // ... existing cases
      case 'llama':
        return new LlamaService(config as any);
      case 'newprovider':
        return new NewProviderService(config as any);
      // ... rest of cases
    }
  }

  static getAvailableProviders(): string[] {
    return ['openai', 'anthropic', 'gemini', 'llama', 'custom', 'newprovider'];
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
      // ... existing cases
      case 'llama':
        return {
          ...baseConfig,
          provider: 'llama',
          llamaProvider: import.meta.env.VITE_LLAMA_PROVIDER || 'ollama',
          systemPrompt: import.meta.env.VITE_LLAMA_SYSTEM_PROMPT,
          stopSequences: this.parseStopSequences(
            import.meta.env.VITE_LLAMA_STOP_SEQUENCES
          ),
          headers: this.parseCustomHeaders(import.meta.env.VITE_LLAMA_HEADERS),
        };
      case 'newprovider':
        return {
          ...baseConfig,
          provider: 'newprovider',
          customParam: import.meta.env.VITE_NEWPROVIDER_CUSTOM_PARAM,
        };
      // ... rest of cases
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
