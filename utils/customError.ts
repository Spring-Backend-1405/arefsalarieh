export class CustomError extends Error {
  statusCode: number;
  constructor(message = "internal error", statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "CustomError";
  }
}

export const customError = (message = "internal error", statusCode = 500) => {
  throw new CustomError(message, statusCode);
};