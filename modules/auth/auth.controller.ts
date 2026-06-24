import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../utils/prisma";
import { customError } from "../../utils/customError";
import { hashPassword } from "../../utils/hashPassword";

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
