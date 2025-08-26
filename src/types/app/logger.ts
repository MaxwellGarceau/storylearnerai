export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export type LogChannel =
  | 'api'
  | 'auth'
  | 'ui'
  | 'prompts'
  | 'database'
  | 'llm'
  | 'translation'
  | 'performance'
  | 'security'
  | 'general'
  | 'walkthrough'
  | 'dictionary'
  | 'dictionary-hook'
  | 'api-manager';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  channel: LogChannel;
  message: string;
  data?: unknown;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  performance?: {
    duration?: number;
    memory?: number;
  };
}

export interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  channels: Partial<Record<LogChannel, boolean>>;
  environment: 'development' | 'production' | 'test';
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxFileSize?: number;
  maxFiles?: number;
  userId?: string;
  sessionId?: string;
}

export interface Logger {
  error(channel: LogChannel, message: string, data?: unknown): void;
  warn(channel: LogChannel, message: string, data?: unknown): void;
  info(channel: LogChannel, message: string, data?: unknown): void;
  debug(channel: LogChannel, message: string, data?: unknown): void;

  // Performance logging
  time(channel: LogChannel, label: string): void;
  timeEnd(channel: LogChannel, label: string, data?: unknown): void;

  // Channel control
  enableChannel(channel: LogChannel): void;
  disableChannel(channel: LogChannel): void;
  isChannelEnabled(channel: LogChannel): boolean;

  // Configuration
  setLevel(level: LogLevel): void;
  setUserId(userId: string): void;
  setSessionId(sessionId: string): void;
}
