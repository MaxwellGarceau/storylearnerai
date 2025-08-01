import { LoggerConfig, LogEntry } from './types';
import { getLoggerConfigWithOverrides } from './config';
import { LogLevel, LogChannel } from './types';

// Simple browser-compatible logger
class ConsoleWrapper {
  private config: LoggerConfig;
  private queue: LogEntry[] = [];
  private batchSize = 10;
  private flushInterval = 5000;
  private flushTimer?: NodeJS.Timeout;

  constructor(config: LoggerConfig) {
    this.config = config;
    if (config.enableRemote) {
      this.startFlushTimer();
    }
  }

  log(level: string, message: string, meta: Record<string, unknown> = {}) {
    const { channel, data, userId, sessionId, requestId, performance, ...rest } = meta;
    
    // Console logging
    if (this.config.enableConsole) {
      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] [${level.toUpperCase()}] [${channel ?? 'general'}]`;
      
      switch (level) {
        case 'error':
          console.error(prefix, message, data ?? rest);
          break;
        case 'warn':
          console.warn(prefix, message, data ?? rest);
          break;
        case 'info':
          console.info(prefix, message, data ?? rest);
          break;
        case 'debug':
          console.debug(prefix, message, data ?? rest);
          break;
        default:
          console.log(prefix, message, data ?? rest);
      }
    }

    // Remote logging
    if (this.config.enableRemote && channel) {
      const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: level as LogLevel,
        channel: channel as LogChannel,
        message,
        data,
        userId: userId as string,
        sessionId: sessionId as string,
        requestId: requestId as string,
        performance: performance as { duration?: number; memory?: number; } | undefined,
      };

      this.queue.push(logEntry);

      if (this.queue.length >= this.batchSize) {
        void this.flush();
      }
    }
  }

  private startFlushTimer() {
    this.flushTimer = setInterval(() => {
      if (this.queue.length > 0) {
        void this.flush();
      }
    }, this.flushInterval);
  }

  private async flush() {
    if (this.queue.length === 0 || !this.config.remoteEndpoint) return;

    const logs = [...this.queue];
    this.queue = [];

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs }),
      });
    } catch (error) {
      console.error('Remote logging failed:', error);
      logs.forEach(log => {
        console.log(`[REMOTE FAILED] [${log.level.toUpperCase()}] [${log.channel}]`, log.message, log.data);
      });
    }
  }

  close() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    void this.flush();
  }
}

export function createLogger(config?: Partial<LoggerConfig>) {
  const fullConfig = { ...getLoggerConfigWithOverrides(), ...config };
  return new ConsoleWrapper(fullConfig);
} 