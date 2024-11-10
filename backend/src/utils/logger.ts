import winston from "winston";
import { Format } from "logform";

export class Logger {
  private logger: winston.Logger;

  constructor(service: string) {
    const customFormat: Format = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(
        ({ timestamp, level, message, service, ...meta }) => {
          return JSON.stringify({
            timestamp,
            service,
            level,
            message,
            ...meta,
          });
        }
      )
    );

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: customFormat,
      defaultMeta: { service },
      transports: [
        new winston.transports.Console({
          format: winston.format.colorize({ all: true }),
        }),
        new winston.transports.File({
          filename: "logs/error.log",
          level: "error",
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: "logs/combined.log",
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
    });
  }

  info(message: string, meta?: Record<string, any>): void {
    this.logger.info(message, meta);
  }

  error(message: string, meta?: Record<string, any>): void {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: Record<string, any>): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: Record<string, any>): void {
    this.logger.debug(message, meta);
  }
}
