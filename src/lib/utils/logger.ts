/**
 * Logger utility for the application
 * In development: logs to console
 * In production: can be extended to send to monitoring service (e.g., Sentry, LogRocket)
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
    private isDevelopment = process.env.NODE_ENV === 'development';

    private log(level: LogLevel, message: string, data?: unknown) {
        if (!this.isDevelopment && level === 'debug') {
            return; // Skip debug logs in production
        }

        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

        switch (level) {
            case 'error':
                console.error(prefix, message, data || '');
                break;
            case 'warn':
                console.warn(prefix, message, data || '');
                break;
            case 'info':
            case 'debug':
                if (this.isDevelopment) {
                    console.log(prefix, message, data || '');
                }
                break;
        }
    }

    info(message: string, data?: unknown) {
        this.log('info', message, data);
    }

    warn(message: string, data?: unknown) {
        this.log('warn', message, data);
    }

    error(message: string, data?: unknown) {
        this.log('error', message, data);
    }

    debug(message: string, data?: unknown) {
        this.log('debug', message, data);
    }
}

export const logger = new Logger();
