import winston from 'winston';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => (process.env.NODE_ENV === 'dev' ? 'debug' : 'http');

const logger = winston.createLogger({
  level: level(),
  levels,
  defaultMeta: {
    service: 'promptflow',
    app: 'promptflow',
  },
  transports: [new winston.transports.Console()],
  exitOnError: false,
});

const logWithLevel =
  (logLevel: 'info' | 'error' | 'warn' | 'debug' | 'http') =>
  (...args: unknown[]) => {
    const message = args
      .map((arg) =>
        typeof arg === 'object' && arg !== null
          ? JSON.stringify(arg)
          : String(arg)
      )
      .join(' ');
    logger.log(logLevel, message);
  };

export const customLogger = {
  info: logWithLevel('info'),
  error: logWithLevel('error'),
  warn: logWithLevel('warn'),
  debug: logWithLevel('debug'),
  http: logWithLevel('http'),
};

export const httpLogger = (req: any, res: any, next: any) => {
  const start = Date.now();

  if (!req.url.includes('/api/')) {
    next();
    return;
  }

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      responseTime: duration,
      ...(req.user && { user: req.user.email ?? 'Guest' }),
    };

    if (res.statusCode >= 400) {
      customLogger.error('HTTP Request Failed', logData);
    } else {
      customLogger.http('HTTP Request', logData);
    }
  });

  next();
};

export { logger };
