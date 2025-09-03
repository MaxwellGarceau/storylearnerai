import { LoggerConfig, LogLevel } from '@app/logger';

// Browser-safe environment detection
const getEnvironment = (): string => {
  // In browser, we can't access process.env directly
  // We'll use import.meta.env for Vite or fallback to development
  if (typeof window !== 'undefined') {
    // Browser environment
    return 'development'; // Default to development in browser
  }

  // Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV ?? 'development';
  }

  return 'development';
};

const isProduction = getEnvironment() === 'production';
const isTest = getEnvironment() === 'test';

// Environment-specific configurations
const developmentConfig: LoggerConfig = {
  enabled: true,
  level: 'debug',
  channels: {
    api: true,
    auth: true,
    ui: true,
    prompts: true,
    database: true,
    llm: true,
    translation: true,
    performance: true,
    security: true,
    general: true,
  },
  enableConsole: true,
};

const productionConfig: LoggerConfig = {
  enabled: true,
  level: 'warn',
  channels: {
    api: true,
    auth: true,
    ui: false,
    prompts: false,
    database: true,
    llm: true,
    translation: true,
    performance: true,
    security: true,
    general: false,
  },
  enableConsole: false,
};

const testConfig: LoggerConfig = {
  enabled: false,
  level: 'error',
  channels: {
    api: false,
    auth: false,
    ui: false,
    prompts: false,
    database: false,
    llm: false,
    translation: false,
    performance: false,
    security: false,
    general: false,
  },
  enableConsole: false,
};

// Browser-safe environment variable access
const getEnvVar = (key: string, defaultValue?: string): string | undefined => {
  if (typeof window !== 'undefined') {
    // In browser, we can't access process.env
    // For now, return default values
    return defaultValue;
  }

  // Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] ?? defaultValue;
  }

  return defaultValue;
};

// Get configuration based on environment
function getLoggerConfig(): LoggerConfig {
  if (isTest) return testConfig;
  if (isProduction) return productionConfig;
  return developmentConfig;
}

// Override configuration with environment variables
export function getLoggerConfigWithOverrides(): LoggerConfig {
  const baseConfig = getLoggerConfig();

  return {
    ...baseConfig,
    enabled: getEnvVar('LOG_ENABLED')
      ? getEnvVar('LOG_ENABLED') === 'true'
      : baseConfig.enabled,
    level: (getEnvVar('LOG_LEVEL') as LogLevel) || baseConfig.level,
    enableConsole: getEnvVar('LOG_CONSOLE')
      ? getEnvVar('LOG_CONSOLE') === 'true'
      : baseConfig.enableConsole,
  };
}
