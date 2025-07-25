import { logger } from './logger';
import { useLogger, useApiLogger, useAuthLogger, useUILogger, usePromptLogger } from './useLogger';

// ============================================================================
// DIRECT LOGGER USAGE EXAMPLES
// ============================================================================

export function directLoggerExamples() {
  // Basic logging
  logger.info('general', 'Application started');
  logger.debug('api', 'API request initiated', { endpoint: '/api/users' });
  logger.warn('auth', 'Login attempt failed', { userId: '123', reason: 'invalid_password' });
  logger.error('database', 'Database connection failed', { error: 'Connection timeout' });

  // Performance logging
  logger.time('performance', 'api-request');
  // ... do some work ...
  logger.timeEnd('performance', 'api-request', { endpoint: '/api/data' });

  // Error logging with stack traces
  try {
    throw new Error('Something went wrong');
  } catch (error) {
    logger.logError('general', error as Error, { context: 'example function' });
  }

  // API logging
  logger.logApiRequest('api', 'GET', '/api/users', { userId: '123' });
  logger.logApiResponse('api', 'GET', '/api/users', 200, { users: [] });

  // Memory usage logging
  logger.logMemoryUsage('performance');

  // Channel control
  logger.enableChannel('ui');
  logger.disableChannel('debug');
  console.log('UI channel enabled:', logger.isChannelEnabled('ui'));

  // Configuration
  logger.setLevel('debug');
  logger.setUserId('user-123');
  logger.setSessionId('session-456');
  logger.setRequestId('req-789');
}

// ============================================================================
// REACT HOOK USAGE EXAMPLES
// ============================================================================

export function ReactComponentExample() {
  // Basic logger hook
  const logger = useLogger();
  
  logger.info('ui', 'Component mounted');
  logger.debug('ui', 'Component state updated', { state: 'loading' });

  // Specialized hooks
  const apiLogger = useApiLogger();
  const authLogger = useAuthLogger();
  const uiLogger = useUILogger();
  const promptLogger = usePromptLogger();

  // API logging
  apiLogger.logRequest('GET', '/api/users');
  apiLogger.logResponse('GET', '/api/users', 200);

  // Auth logging
  authLogger.logLogin('email', { email: 'user@example.com' });
  authLogger.logLogout();

  // UI logging
  uiLogger.logEvent('button_click', { buttonId: 'submit' });
  uiLogger.logPerformance('render', 150);

  // Prompt logging
  promptLogger.logPromptBuild({ fromLanguage: 'es', toLanguage: 'en' });
  promptLogger.logPromptPerformance('build', 25);

  return null;
}

// ============================================================================
// INTEGRATION EXAMPLES
// ============================================================================

export class ApiService {
  private logger = useApiLogger();

  async fetchUsers() {
    this.logger.time('api', 'fetch-users');
    
    try {
      this.logger.logRequest('GET', '/api/users');
      
      const response = await fetch('/api/users');
      const data = await response.json();
      
      this.logger.logResponse('GET', '/api/users', response.status, { userCount: data.length });
      
      return data;
    } catch (error) {
      this.logger.logError(error as Error, { endpoint: '/api/users' });
      throw error;
    } finally {
      this.logger.timeEnd('api', 'fetch-users');
    }
  }
}

export class AuthService {
  private logger = useAuthLogger();

  async login(email: string, password: string) {
    this.logger.time('auth', 'login-attempt');
    
    try {
      this.logger.logLogin('email', { email });
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        this.logger.info('auth', 'Login successful', { email });
        return await response.json();
      } else {
        this.logger.warn('auth', 'Login failed', { email, status: response.status });
        throw new Error('Login failed');
      }
    } catch (error) {
      this.logger.logError(error as Error, { email });
      throw error;
    } finally {
      this.logger.timeEnd('auth', 'login-attempt');
    }
  }

  logout() {
    this.logger.logLogout();
    // ... logout logic
  }
}

export class PromptService {
  private logger = usePromptLogger();

  buildPrompt(context: any) {
    this.logger.time('prompts', 'build-prompt');
    
    try {
      this.logger.logPromptBuild(context);
      
      // ... prompt building logic
      const prompt = 'Generated prompt';
      
      this.logger.info('prompts', 'Prompt built successfully', { 
        promptLength: prompt.length,
        context 
      });
      
      return prompt;
    } catch (error) {
      this.logger.logPromptError(error as Error, { context });
      throw error;
    } finally {
      this.logger.timeEnd('prompts', 'build-prompt');
    }
  }
}

// ============================================================================
// ENVIRONMENT CONFIGURATION EXAMPLES
// ============================================================================

export function environmentExamples() {
  // Development environment (verbose logging)
  // LOG_ENABLED=true
  // LOG_LEVEL=debug
  // LOG_CONSOLE=true
  // LOG_FILE=false
  // LOG_REMOTE=false

  // Production environment (minimal logging)
  // LOG_ENABLED=true
  // LOG_LEVEL=warn
  // LOG_CONSOLE=false
  // LOG_FILE=true
  // LOG_REMOTE=true
  // LOG_ENDPOINT=https://logs.storylearnerai.com

  // Test environment (no logging)
  // LOG_ENABLED=false
  // LOG_LEVEL=error
  // LOG_CONSOLE=false
  // LOG_FILE=false
  // LOG_REMOTE=false
}

// ============================================================================
// CHANNEL USAGE EXAMPLES
// ============================================================================

export function channelExamples() {
  // API channel - for all API-related logs
  logger.info('api', 'API request started', { endpoint: '/api/data' });
  logger.error('api', 'API request failed', { endpoint: '/api/data', status: 500 });

  // Auth channel - for authentication and authorization
  logger.info('auth', 'User logged in', { userId: '123' });
  logger.warn('auth', 'Failed login attempt', { email: 'user@example.com' });

  // UI channel - for user interface events
  logger.info('ui', 'Button clicked', { buttonId: 'submit' });
  logger.debug('ui', 'Component rendered', { component: 'UserList' });

  // Prompts channel - for prompt generation and processing
  logger.info('prompts', 'Prompt built', { fromLanguage: 'es', toLanguage: 'en' });
  logger.debug('prompts', 'Prompt template loaded', { template: 'general' });

  // Database channel - for database operations
  logger.info('database', 'Query executed', { query: 'SELECT * FROM users' });
  logger.error('database', 'Database connection failed', { error: 'timeout' });

  // LLM channel - for language model interactions
  logger.info('llm', 'LLM request sent', { model: 'gpt-4', tokens: 1000 });
  logger.debug('llm', 'LLM response received', { responseTime: 2500 });

  // Translation channel - for translation operations
  logger.info('translation', 'Translation completed', { from: 'es', to: 'en' });
  logger.debug('translation', 'Translation quality check', { score: 0.95 });

  // Performance channel - for performance monitoring
  logger.info('performance', 'Memory usage', { used: '50MB', total: '100MB' });
  logger.debug('performance', 'Function execution time', { function: 'buildPrompt', time: 25 });

  // Security channel - for security-related events
  logger.warn('security', 'Suspicious activity detected', { ip: '192.168.1.1' });
  logger.error('security', 'Authentication bypass attempt', { userId: '123' });

  // General channel - for general application logs
  logger.info('general', 'Application started');
  logger.debug('general', 'Configuration loaded', { config: 'production' });
} 