import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../utils/prisma";
import { customError } from "../../utils/customError";
import { comparePassword, hashPassword } from "../../utils/hashPassword";
import { createJwtToken } from "../../utils/tokenHelper";
import { generaterefreshTokenAndSetCookie } from "./auth.service";

export const handleRegister = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (existingUser) {
      return next(customError("email already exist", 400));
    }

    const hashedPass = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPass,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      status: true,
      message: "User registered successfully",
      data: userWithoutPassword,
    });
  } catch (error) {
    console.log("error in handleRegister = ", error);
    next(error);
  }
};

export const handleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!existingUser) {
      return next(customError("user doesnt exist", 400));
    }

    const checkPassword = await comparePassword(
      password,
      existingUser.password,
    );

    if (!checkPassword) {
      return next(customError("password is wrong", 404));
    }

    const accessToken = createJwtToken(
      {
        id: existingUser.id,
        role: existingUser.role,
      },
     24 * 60 * 60 * 1000,
    );

    generaterefreshTokenAndSetCookie(res, {
      id: existingUser.id,
      role: existingUser.role,
    });

    res.status(201).json({
      message : 'login succes',
      data :{
        id : existingUser.id,
        email : existingUser.email,
        role : existingUser.role,
        accessToken
      }
    })
  } catch (error) {
    console.log("error in handleLogin = ", error);
    next(error);
  }
};
