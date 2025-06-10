import winston from 'winston';

// Environment-based log level
const getLogLevel = (): string => {
  if (process.env.NODE_ENV === 'production') return 'error';
  if (process.env.NODE_ENV === 'staging') return 'warn';
  return 'debug';
};

// Custom format for development
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, stack, service, ...meta }) => {
    const servicePrefix = service ? `[${service}] ` : '';
    const metaInfo = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${servicePrefix}${message}${stack ? `\n${stack}` : ''}${metaInfo}`;
  })
);

// Production format (JSON for log aggregation)
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create the main logger
const logger = winston.createLogger({
  level: getLogLevel(),
  format: process.env.NODE_ENV === 'production' ? productionFormat : developmentFormat,
  defaultMeta: {
    service: 'pipecd',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true
    }),
    
    // File transports for production
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 10485760, // 10MB
        maxFiles: 5
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 10485760, // 10MB
        maxFiles: 5
      })
    ] : [])
  ]
});

// Service-specific logger creator
export const createServiceLogger = (serviceName: string) => {
  return logger.child({ service: serviceName });
};

// Specialized loggers for different domains
export const loggers = {
  ai: createServiceLogger('ai-agent'),
  deals: createServiceLogger('deals'),
  leads: createServiceLogger('leads'),
  graphql: createServiceLogger('graphql'),
  inngest: createServiceLogger('inngest'),
  wfm: createServiceLogger('wfm'),
  auth: createServiceLogger('auth'),
  mcp: createServiceLogger('mcp'),
  general: logger
};

// Performance logging helper
export const logPerformance = (operation: string, startTime: number, metadata?: any) => {
  const duration = Date.now() - startTime;
  const perfLogger = createServiceLogger('performance');
  
  if (duration > 1000) {
    perfLogger.warn('Slow operation detected', {
      operation,
      duration: `${duration}ms`,
      ...metadata
    });
  } else {
    perfLogger.debug('Operation completed', {
      operation,
      duration: `${duration}ms`,
      ...metadata
    });
  }
};

// Error tracking helper
export const logError = (error: Error, context?: any, serviceName?: string) => {
  const errorLogger = serviceName ? createServiceLogger(serviceName) : logger;
  
  errorLogger.error('Error occurred', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context
  });
};

// Migration helper for gradual console.* replacement
export const migrateConsole = {
  log: (message: string, meta?: any, service?: string) => {
    const targetLogger = service ? createServiceLogger(service) : logger;
    targetLogger.info(message, meta);
  },
  error: (message: string, error?: Error | any, meta?: any, service?: string) => {
    const targetLogger = service ? createServiceLogger(service) : logger;
    if (error instanceof Error) {
      logError(error, { ...meta, originalMessage: message }, service);
    } else {
      targetLogger.error(message, { error, ...meta });
    }
  },
  warn: (message: string, meta?: any, service?: string) => {
    const targetLogger = service ? createServiceLogger(service) : logger;
    targetLogger.warn(message, meta);
  },
  debug: (message: string, meta?: any, service?: string) => {
    const targetLogger = service ? createServiceLogger(service) : logger;
    targetLogger.debug(message, meta);
  }
};

export default logger; 