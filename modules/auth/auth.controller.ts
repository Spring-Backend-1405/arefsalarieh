import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../utils/prisma";
import { customError } from "../../utils/customError";
import { comparePassword, hashPassword } from "../../utils/hashPassword";
import { checkJwtToken, createJwtToken } from "../../utils/tokenHelper";
import { generaterefreshTokenAndSetCookie } from "./auth.service";
// import { capitalizeFirstLetter } from "../../utils/capitalize";

export const handleRegister = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let { email, password , name } = req.body;

    // name = capitalizeFirstLetter(name)

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
        name
      },
    });

    console.log(user)

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
      where: { email },
      include : {
        roles : {
          include :{
            role : true
          }
        }
      }
    });

    if (!existingUser) {
      return next(customError("User doesn't exist", 400));
    }

    const checkPassword = await comparePassword(
      password,
      existingUser.password,
    );
    if (!checkPassword) {
      return next(customError("Password is wrong", 404));
    }

    const accessToken = createJwtToken(
      {
        id: existingUser.id,
      },
      24 * 60 * 60,
    );

    generaterefreshTokenAndSetCookie(res, {
      id: existingUser.id,
    });

    res.status(200).json({
      status: true,
      message: "Login successful",
      data: {
        id: existingUser.id,
        email: existingUser.email,
        accessToken,
        roles : existingUser.roles
      },
    });
  } catch (error) {
    console.log("error in handleLogin = ", error);
    next(error);
  }
};

export const handleRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return next(customError("No refresh token provided", 401));
    }

    const decoded = checkJwtToken(refreshToken);
    if (!decoded) {
      return next(customError("Invalid refresh token", 401));
    }
    const authUser = decoded as { id: string; role: string };

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
    });
    if (!user) {
      return next(customError("User doesn't exist", 401));
    }

    const newAccessToken = createJwtToken({ id: user.id }, 7 * 24 * 60 * 60);

    res.status(200).json({
      status: true,
      message: "Access token refreshed",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    console.log("error in handleRefreshToken = ", error);
    next(error);
  }
};
