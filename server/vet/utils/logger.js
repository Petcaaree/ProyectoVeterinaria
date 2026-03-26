import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Formato legible para desarrollo
const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]${stack ? `: ${stack}` : `: ${message}`}${metaStr}`;
});

// Formato JSON estructurado para producción
const prodFormat = combine(
    timestamp(),
    errors({ stack: true }),
    winston.format.json()
);

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

const logger = winston.createLogger({
    level: isTest ? 'error' : (process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug')),
    format: isProduction
        ? prodFormat
        : combine(
            colorize(),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            errors({ stack: true }),
            devFormat
        ),
    defaultMeta: { service: 'petcare-api' },
    transports: [
        new winston.transports.Console()
    ]
});

// En producción, también logueamos errores a archivo
if (isProduction) {
    logger.add(new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5
    }));
    logger.add(new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880,
        maxFiles: 5
    }));
}

export default logger;
