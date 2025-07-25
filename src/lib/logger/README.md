# Logging System Documentation

A comprehensive Winston-based logging system for React TypeScript applications with environment-based configuration, channel filtering, and performance monitoring.

## 🚀 Features

- ✅ **Log Levels**: error, warn, info, debug
- ✅ **Channels**: api, auth, ui, prompts, database, llm, translation, performance, security, general
- ✅ **Environment Control**: Development, Production, Test configurations
- ✅ **Multiple Outputs**: Console, File, Remote API
- ✅ **Performance Monitoring**: Timing, memory usage
- ✅ **React Hooks**: Easy integration with React components
- ✅ **TypeScript Support**: Full type safety
- ✅ **Structured Logging**: JSON format for production

## 📦 Installation

The logging system is already installed and configured in this project.

## 🔧 Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Logging Configuration
LOG_ENABLED=true
LOG_LEVEL=info
LOG_CONSOLE=true
LOG_FILE=false
LOG_REMOTE=false
LOG_ENDPOINT=https://logs.storylearnerai.com
```

### Environment-Specific Configurations

#### Development
- **Level**: debug
- **Console**: enabled
- **File**: disabled
- **Remote**: disabled
- **Channels**: all enabled

#### Production
- **Level**: warn
- **Console**: disabled
- **File**: enabled
- **Remote**: enabled
- **Channels**: api, auth, database, llm, translation, performance, security

#### Test
- **Level**: error
- **Console**: disabled
- **File**: disabled
- **Remote**: disabled
- **Channels**: all disabled

## 🎯 Usage

### Direct Logger Usage

```typescript
import { logger } from '@/lib/logger';

// Basic logging
logger.info('general', 'Application started');
logger.debug('api', 'API request initiated', { endpoint: '/api/users' });
logger.warn('auth', 'Login attempt failed', { userId: '123' });
logger.error('database', 'Database connection failed', { error: 'timeout' });

// Performance logging
logger.time('performance', 'api-request');
// ... do work ...
logger.timeEnd('performance', 'api-request', { endpoint: '/api/data' });

// Error logging with stack traces
try {
  throw new Error('Something went wrong');
} catch (error) {
  logger.logError('general', error as Error, { context: 'example' });
}

// API logging
logger.logApiRequest('api', 'GET', '/api/users', { userId: '123' });
logger.logApiResponse('api', 'GET', '/api/users', 200, { users: [] });

// Memory usage
logger.logMemoryUsage('performance');

// Configuration
logger.setLevel('debug');
logger.setUserId('user-123');
logger.setSessionId('session-456');
logger.setRequestId('req-789');
```

### React Hook Usage

```typescript
import { useLogger, useApiLogger, useAuthLogger, useUILogger, usePromptLogger } from '@/lib/logger';

function MyComponent() {
  // Basic logger
  const logger = useLogger();
  
  // Specialized loggers
  const apiLogger = useApiLogger();
  const authLogger = useAuthLogger();
  const uiLogger = useUILogger();
  const promptLogger = usePromptLogger();

  useEffect(() => {
    logger.info('ui', 'Component mounted');
    
    // API logging
    apiLogger.logRequest('GET', '/api/users');
    apiLogger.logResponse('GET', '/api/users', 200);
    
    // Auth logging
    authLogger.logLogin('email', { email: 'user@example.com' });
    
    // UI logging
    uiLogger.logEvent('button_click', { buttonId: 'submit' });
    uiLogger.logPerformance('render', 150);
    
    // Prompt logging
    promptLogger.logPromptBuild({ fromLanguage: 'es', toLanguage: 'en' });
  }, []);

  return <div>My Component</div>;
}
```

### Service Integration

```typescript
import { useApiLogger } from '@/lib/logger';

class ApiService {
  private logger = useApiLogger();

  async fetchUsers() {
    this.logger.time('api', 'fetch-users');
    
    try {
      this.logger.logRequest('GET', '/api/users');
      
      const response = await fetch('/api/users');
      const data = await response.json();
      
      this.logger.logResponse('GET', '/api/users', response.status, { 
        userCount: data.length 
      });
      
      return data;
    } catch (error) {
      this.logger.logError(error as Error, { endpoint: '/api/users' });
      throw error;
    } finally {
      this.logger.timeEnd('api', 'fetch-users');
    }
  }
}
```

## 📊 Log Channels

### Available Channels

- **api**: API requests, responses, and errors
- **auth**: Authentication and authorization events
- **ui**: User interface events and interactions
- **prompts**: Prompt generation and processing
- **database**: Database operations and queries
- **llm**: Language model interactions
- **translation**: Translation operations
- **performance**: Performance monitoring and metrics
- **security**: Security-related events
- **general**: General application logs

### Channel Control

```typescript
// Enable/disable channels
logger.enableChannel('ui');
logger.disableChannel('debug');

// Check channel status
console.log('UI channel enabled:', logger.isChannelEnabled('ui'));
```

## 🔍 Log Levels

### Level Hierarchy

1. **error**: Critical errors that need immediate attention
2. **warn**: Warning conditions that should be investigated
3. **info**: General information about application flow
4. **debug**: Detailed debugging information

### Level Control

```typescript
// Set log level
logger.setLevel('debug');

// Check current level
console.log('Current level:', logger.config.level);
```

## 📤 Output Destinations

### Console Output (Development)
- Colored, formatted logs
- Timestamp, level, channel, message
- User, session, and request IDs
- Performance metrics

### File Output (Production)
- JSON structured logs
- Log rotation (10MB files, 10 files max)
- Separate error and combined logs
- Only available in Node.js environment

### Remote Output (Production)
- Batched HTTP requests
- Automatic retry on failure
- Fallback to console on error
- Configurable endpoint

## 🎛️ Advanced Features

### Performance Monitoring

```typescript
// Timing operations
logger.time('performance', 'database-query');
const result = await database.query('SELECT * FROM users');
logger.timeEnd('performance', 'database-query', { rowCount: result.length });

// Memory usage
logger.logMemoryUsage('performance');
```

### Error Handling

```typescript
// Error with context
try {
  throw new Error('API call failed');
} catch (error) {
  logger.logError('api', error as Error, { 
    endpoint: '/api/users',
    userId: '123',
    timestamp: new Date().toISOString()
  });
}
```

### Request Tracking

```typescript
// Set request context
logger.setRequestId('req-123');
logger.setUserId('user-456');
logger.setSessionId('session-789');

// All subsequent logs will include this context
logger.info('api', 'Processing request');
```

## 🧪 Testing

### Test Environment

In test environment, logging is disabled by default to avoid noise:

```typescript
// Test environment configuration
const testConfig = {
  enabled: false,
  level: 'error',
  channels: { /* all disabled */ },
  environment: 'test',
  enableConsole: false,
  enableFile: false,
  enableRemote: false,
};
```

### Mocking in Tests

```typescript
import { vi } from 'vitest';
import { logger } from '@/lib/logger';

// Mock logger in tests
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    time: vi.fn(),
    timeEnd: vi.fn(),
  },
}));
```

## 🔧 Customization

### Custom Transports

```typescript
import winston from 'winston';

// Custom transport example
class CustomTransport extends winston.Transport {
  log(info: any, callback: () => void) {
    // Custom logging logic
    console.log('Custom:', info);
    callback();
  }
}

// Add to logger
winstonLogger.add(new CustomTransport());
```

### Custom Formats

```typescript
import winston from 'winston';

const customFormat = winston.format.printf(({ timestamp, level, message, channel }) => {
  return `${timestamp} [${level.toUpperCase()}] [${channel}] ${message}`;
});
```

## 📈 Monitoring and Analytics

### Production Monitoring

- **Error Tracking**: All errors are logged with full context
- **Performance Metrics**: Timing and memory usage tracking
- **User Behavior**: UI events and user interactions
- **API Performance**: Request/response times and success rates

### Log Analysis

```typescript
// Example log entry structure
{
  timestamp: "2024-01-15T10:30:00.000Z",
  level: "info",
  channel: "api",
  message: "API request completed",
  data: { endpoint: "/api/users", status: 200 },
  userId: "user-123",
  sessionId: "session-456",
  requestId: "req-789",
  performance: { duration: 150 }
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Logs not appearing**: Check `LOG_ENABLED` and channel settings
2. **Performance impact**: Disable debug logging in production
3. **Remote logging failures**: Check network connectivity and endpoint
4. **File logging not working**: Only available in Node.js environment

### Debug Mode

```typescript
// Enable debug mode for troubleshooting
logger.setLevel('debug');
logger.enableChannel('general');

// Check logger configuration
console.log('Logger config:', logger.config);
```

## 📚 API Reference

### Logger Methods

- `logger.error(channel, message, data?)`
- `logger.warn(channel, message, data?)`
- `logger.info(channel, message, data?)`
- `logger.debug(channel, message, data?)`
- `logger.time(channel, label)`
- `logger.timeEnd(channel, label, data?)`
- `logger.logError(channel, error, context?)`
- `logger.logApiRequest(channel, method, url, data?)`
- `logger.logApiResponse(channel, method, url, status, data?)`
- `logger.logMemoryUsage(channel?)`

### Configuration Methods

- `logger.setLevel(level)`
- `logger.setUserId(userId)`
- `logger.setSessionId(sessionId)`
- `logger.setRequestId(requestId)`
- `logger.enableChannel(channel)`
- `logger.disableChannel(channel)`
- `logger.isChannelEnabled(channel)`

### React Hooks

- `useLogger()`: Basic logger hook
- `useApiLogger()`: API-specific logger hook
- `useAuthLogger()`: Authentication logger hook
- `useUILogger()`: UI events logger hook
- `usePromptLogger()`: Prompt processing logger hook 