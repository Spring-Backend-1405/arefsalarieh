import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../utils/prisma";
import { customError } from "../../utils/customError";
import { findUser } from "./user.servece";

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as any;

    const { id } = authReq.user;

    const existingUser = await findUser({ id });

    if (!existingUser) {
      return next(customError("User not found", 404));
    }

    res.status(200).json({
      status: true,
      data: existingUser,
    });
  } catch (error) {
    console.log("error in getUserProfile = ", error);
    next(error);
  }
};
