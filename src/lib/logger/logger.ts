import { Logger, LogLevel, LogChannel, LogEntry, LoggerConfig } from './types';
import { createLogger } from './createLogger';
import { getLoggerConfigWithOverrides } from './config';

class AppLogger implements Logger {
  private browserLogger: ReturnType<typeof createLogger>;
  private config: LoggerConfig;
  private channels: Map<LogChannel, boolean>;
  private timers: Map<string, number> = new Map();
  private userId?: string;
  private sessionId?: string;
  private requestId?: string;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = { ...getLoggerConfigWithOverrides(), ...config };
    this.browserLogger = createLogger(this.config);
    this.channels = new Map(Object.entries(this.config.channels) as [LogChannel, boolean][]);
    
    // Generate session ID if not provided
    if (!this.sessionId) {
      this.sessionId = this.generateSessionId();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: LogLevel, channel: LogChannel): boolean {
    if (!this.config.enabled) return false;
    
    // Check if channel is enabled
    if (!this.channels.get(channel)) return false;
    
    // Check log level
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex <= currentLevelIndex;
  }

  private createLogEntry(level: LogLevel, channel: LogChannel, message: string, data?: unknown): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      channel,
      message,
      data,
      userId: this.userId,
      sessionId: this.sessionId,
      requestId: this.requestId,
    };
  }

  private log(level: LogLevel, channel: LogChannel, message: string, data?: unknown): void {
    if (!this.shouldLog(level, channel)) return;

    const logEntry = this.createLogEntry(level, channel, message, data);
    
    this.browserLogger.log(level, logEntry.message, {
      channel: logEntry.channel,
      data: logEntry.data,
      userId: logEntry.userId,
      sessionId: logEntry.sessionId,
      requestId: logEntry.requestId,
      timestamp: logEntry.timestamp,
    });
  }

  // Main logging methods
  error(channel: LogChannel, message: string, data?: unknown): void {
    this.log('error', channel, message, data);
  }

  warn(channel: LogChannel, message: string, data?: unknown): void {
    this.log('warn', channel, message, data);
  }

  info(channel: LogChannel, message: string, data?: unknown): void {
    this.log('info', channel, message, data);
  }

  debug(channel: LogChannel, message: string, data?: unknown): void {
    this.log('debug', channel, message, data);
  }

  // Performance logging methods
  time(channel: LogChannel, label: string): void {
    const timerKey = `${channel}:${label}`;
    this.timers.set(timerKey, performance.now());
    this.debug(channel, `Timer started: ${label}`);
  }

  timeEnd(channel: LogChannel, label: string, data?: unknown): void {
    const timerKey = `${channel}:${label}`;
    const startTime = this.timers.get(timerKey);
    
    if (startTime) {
      const duration = performance.now() - startTime;
      this.timers.delete(timerKey);
      
      const logEntry = this.createLogEntry('info', channel, `Timer ended: ${label}`, data);
      logEntry.performance = { duration };
      
      this.browserLogger.log('info', logEntry.message, {
        channel: logEntry.channel,
        data: logEntry.data,
        userId: logEntry.userId,
        sessionId: logEntry.sessionId,
        requestId: logEntry.requestId,
        timestamp: logEntry.timestamp,
        performance: logEntry.performance,
      });
    } else {
      this.warn(channel, `Timer not found: ${label}`);
    }
  }

  // Channel control methods
  enableChannel(channel: LogChannel): void {
    this.channels.set(channel, true);
    this.debug('general', `Channel enabled: ${channel}`);
  }

  disableChannel(channel: LogChannel): void {
    this.channels.set(channel, false);
    this.debug('general', `Channel disabled: ${channel}`);
  }

  isChannelEnabled(channel: LogChannel): boolean {
    return this.channels.get(channel) || false;
  }

  // Configuration methods
  setLevel(level: LogLevel): void {
    this.config.level = level;
    this.info('general', `Log level changed to: ${level}`);
  }

  setUserId(userId: string): void {
    this.userId = userId;
    this.info('general', `User ID set: ${userId}`);
  }

  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
    this.info('general', `Session ID set: ${sessionId}`);
  }

  // Additional utility methods
  setRequestId(requestId?: string): void {
    this.requestId = requestId || this.generateRequestId();
    this.debug('general', `Request ID set: ${this.requestId}`);
  }

  // Memory usage logging
  logMemoryUsage(channel: LogChannel = 'performance'): void {
    if ('memory' in performance) {
      const memory = (performance as Performance & { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      this.info(channel, 'Memory usage', {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB',
      });
    }
  }

  // Error logging with stack trace
  logError(channel: LogChannel, error: Error, context?: unknown): void {
    this.error(channel, error.message, {
      stack: error.stack,
      name: error.name,
      context,
    });
  }

  // API request logging
  logApiRequest(channel: LogChannel, method: string, url: string, data?: unknown): void {
    this.info(channel, `API Request: ${method} ${url}`, data);
  }

  logApiResponse(channel: LogChannel, method: string, url: string, status: number, data?: unknown): void {
    const level = status >= 400 ? 'error' : 'info';
    this[level](channel, `API Response: ${method} ${url} - ${status}`, data);
  }
}

// Create and export the default logger instance
export const logger = new AppLogger(); 