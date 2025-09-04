import { LoggerConfig } from '@app/logger';
import { getLoggerConfigWithOverrides } from './config';

// Simple browser-compatible logger
class ConsoleWrapper {
  private config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;
    // Remote logging is disabled
  }

  log(level: string, message: string, meta: Record<string, unknown> = {}) {
    const { channel, data, ...rest } = meta;

    // Console logging
    if (this.config.enableConsole) {
      const timestamp = new Date().toISOString();
      let channelStr: string;
      if (typeof channel === 'string' || typeof channel === 'number') {
        channelStr = String(channel);
      } else {
        channelStr = 'general';
      }
      const prefix = `[${timestamp}] [${level.toUpperCase()}] [${channelStr}]`;

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

    // Remote logging is disabled
  }

  close() {
    // No cleanup needed since remote logging is disabled
  }
}

export function createLogger(config?: Partial<LoggerConfig>) {
  const fullConfig = { ...getLoggerConfigWithOverrides(), ...config };
  return new ConsoleWrapper(fullConfig);
}
