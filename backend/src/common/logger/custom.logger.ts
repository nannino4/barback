import { Injectable, LoggerService, ConsoleLogger } from '@nestjs/common';

/**
 * Custom logger with optional request id prefix.
 *
 * This logger is intentionally NOT request-scoped.
 */
@Injectable()
export class CustomLogger implements LoggerService
{
    private readonly logger: ConsoleLogger;

    constructor() { this.logger = new ConsoleLogger(); }

    private formatMessage(message: any, requestId?: string): string
    {
        const messageStr = typeof message === 'string' ? message : JSON.stringify(message);

        const prefix = requestId ? `[${requestId}]` : `[-]`;
        return `${prefix} ${messageStr}`;
    }

    /**
     * Log a 'log' level message
     */
    log(message: any, context?: string, requestId?: string): void
    {
        this.logger.log(this.formatMessage(message, requestId), context);
    }

    /**
     * Log an 'error' level message
     */
    error(message: any, stack?: string, context?: string, requestId?: string): void
    {
        this.logger.error(this.formatMessage(message, requestId), stack, context);
    }

    /**
     * Log a 'warn' level message
     */
    warn(message: any, context?: string, requestId?: string): void
    {
        this.logger.warn(this.formatMessage(message, requestId), context);
    }

    /**
     * Log a 'debug' level message
     */
    debug(message: any, context?: string, requestId?: string): void
    {
        this.logger.debug(this.formatMessage(message, requestId), context);
    }

    /**
     * Log a 'verbose' level message
     */
    verbose(message: any, context?: string, requestId?: string): void
    {
        this.logger.verbose(this.formatMessage(message, requestId), context);
    }
}
