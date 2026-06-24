import morgan from "morgan";
import winston from "winston";

const { combine, timestamp, printf, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: "error",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    new winston.transports.File({
      filename: "logs/app.log",
    }),
  ],
});

const morganLogger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    new winston.transports.File({
      filename: "logs/morgan.log", 
    }),
  ],
});

export const morganStream = {
  write: (message: string) => {
    morganLogger.info(message.trim());
  },
};

export const morganMiddleware = morgan("combined", { stream: morganStream });

export default logger;