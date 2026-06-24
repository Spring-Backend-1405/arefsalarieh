// middlewares/errorHandler.ts
import type { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/customError";
import logger from "../utils/logger";

const errorMiddleware = (
  error: CustomError | Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(error);
  let statusCode = 500;
  let message = "Internal Server Error";

  if (error instanceof CustomError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  res.status(statusCode).json({
    status: statusCode,
    message: message,
  });
};

export default errorMiddleware;
