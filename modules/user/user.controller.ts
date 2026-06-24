import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../utils/prisma";
import { customError } from "../../utils/customError";
import {
  checkEmail,
  createUpdateUserData,
  findUser,
  handleUpdateUser,
} from "./user.servece";

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

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as any;
    const { id } = authReq.user;
    const { email } = req.body;

    if (email) {
      const existingUserForEmail = await checkEmail(email, id);
      if (existingUserForEmail) {
        throw customError("Email is already in use", 400);
      }
    }

    const { userUpdateData, profileUpdateData } = createUpdateUserData(req);

    const updatedUser = await handleUpdateUser(
      id,
      userUpdateData,
      profileUpdateData,
    );

    res.status(201).json({
      status: true,
      data: updatedUser,
    });
  } catch (error) {
    console.log("error in updateProfile = ", error);
    next(error);
  }
};
