import { Logger, createLogger, format, transports } from 'winston';

enum WinstonLogLevel {
    INFO = 'info',
    ERROR = 'error',
    WARN = 'warn',
    VERBOSE = 'verbose',
    DEBUG = 'debug',
}

export class AppLogger {
    logger: Logger;

    constructor() {
        const { combine, timestamp, label, printf } = format;

        const colors = {
            info: '\x1b[32m', // Green
            error: '\x1b[31m', // Red
            warn: '\x1b[33m', // Yellow
            verbose: '\x1b[34m', // Blue
            debug: '\x1b[35m', // Magenta
            reset: '\x1b[0m', // Reset to default color
        };

        const customLoggerFormat = printf(({ level, message, label, timestamp }) => {
            const color = colors[level as keyof typeof colors] || colors.reset;
            return `${color}${timestamp} [${label}] ${level}: ${message}${colors.reset}`;
        });

        this.logger = createLogger({
            format: combine(label({ label: 'AppLog' }), timestamp(), customLoggerFormat),
            transports: [
                new transports.Console(),
                new transports.File({
                    filename: 'AppLogger.log',
                    format: combine(
                        label({ label: 'AppLog' }),
                        timestamp(),
                        printf(({ level, message, label, timestamp }) => {
                            return `${timestamp} [${label}] ${level}: ${message}`;
                        })
                    ), // No colors for file logs
                }),
            ],
        });
    }

    log(message: string | object) {
        this.logger.log(WinstonLogLevel.INFO, message);
    }

    error(message: string | object) {
        this.logger.log(WinstonLogLevel.ERROR, message);
    }

    warn(message: string | object) {
        this.logger.log(WinstonLogLevel.WARN, message);
    }

    debug(message: string | object) {
        this.logger.log(WinstonLogLevel.DEBUG, message);
    }

    verbose(message: string | object) {
        this.logger.log(WinstonLogLevel.VERBOSE, message);
    }
}
