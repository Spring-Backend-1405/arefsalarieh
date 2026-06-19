import { CustomError } from "../utils/customError.js";

const errorMiddleware = (error, req, res, next) => {
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
