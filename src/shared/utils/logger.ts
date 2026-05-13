import { Logger } from '@nestjs/common';

class GlobalLogger {
  private logger = new Logger('BadalinAPI');

  info = (message: string, context?: string) => {
    if (process.env.NODE_ENV !== 'local') this.logger.log(message, context);
  };

  error = (message: string, trace?: string, context?: string) => {
    if (process.env.NODE_ENV !== 'local') this.logger.error(message, trace, context);
  };

  warn = (message: string, context?: string) => {
    if (process.env.NODE_ENV !== 'local') this.logger.warn(message, context);
  };

  debug = (message: string, context?: string) => {
    if (process.env.NODE_ENV !== 'local') this.logger.debug(message, context);
  };

  verbose = (message: string, context?: string) => {
    if (process.env.NODE_ENV !== 'local') this.logger.verbose(message, context);
  };
}

export const globalLogger = new GlobalLogger();
