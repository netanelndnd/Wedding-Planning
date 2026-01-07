/**
 * Centralized Logging Service
 *
 * Log Levels:
 * - ERROR: Errors that prevent operations from completing
 * - WARN: Warnings about potential issues
 * - INFO: Important business events (CRUD operations, auth events)
 * - DEBUG: Detailed debugging info (development only)
 *
 * Usage:
 * ```typescript
 * import { logger } from '@/lib/logger';
 *
 * logger.info('User logged in', { userId: 'abc123' });
 * logger.error('Failed to create task', { error: err.message, coupleId });
 * logger.debug('Query result', { count: tasks.length });
 * ```
 */

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

type LogContext = Record<string, unknown>;

interface LogMessage {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Format log message with timestamp and context
   */
  private formatMessage(level: LogLevel, message: string, context?: LogContext): LogMessage {
    return {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Output log to console with appropriate styling
   */
  private output(logMessage: LogMessage): void {
    const { level, message, context, timestamp } = logMessage;

    // In production, we might want to send logs to a service
    // For now, we use console with color coding

    const prefix = `[${timestamp}] [${level}]`;
    const fullMessage = context ? `${prefix} ${message}` : `${prefix} ${message}`;

    switch (level) {
      case LogLevel.ERROR:
        console.error(fullMessage, context || '');
        break;
      case LogLevel.WARN:
        console.warn(fullMessage, context || '');
        break;
      case LogLevel.INFO:
        console.info(fullMessage, context || '');
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(fullMessage, context || '');
        }
        break;
    }
  }

  /**
   * Log ERROR level message
   * Use for: Errors that prevent operations from completing
   */
  error(message: string, context?: LogContext): void {
    this.output(this.formatMessage(LogLevel.ERROR, message, context));
  }

  /**
   * Log WARN level message
   * Use for: Warnings about potential issues that don't prevent operation
   */
  warn(message: string, context?: LogContext): void {
    this.output(this.formatMessage(LogLevel.WARN, message, context));
  }

  /**
   * Log INFO level message
   * Use for: Important business events (CRUD ops, auth events, state changes)
   */
  info(message: string, context?: LogContext): void {
    this.output(this.formatMessage(LogLevel.INFO, message, context));
  }

  /**
   * Log DEBUG level message (development only)
   * Use for: Detailed debugging information during development
   */
  debug(message: string, context?: LogContext): void {
    this.output(this.formatMessage(LogLevel.DEBUG, message, context));
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for external use
export type { LogContext };
