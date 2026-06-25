import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../utils/prisma";
import { customError } from "../../utils/customError";

export const getAllRoles = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
  } catch (error) {
        console.log("error in getAllRoles = ", error);
    next(error);
  }
};
