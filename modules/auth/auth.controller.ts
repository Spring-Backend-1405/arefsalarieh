import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../utils/prisma";
import { customError } from "../../utils/customError";
import { comparePassword, hashPassword } from "../../utils/hashPassword";
import { checkJwtToken, createJwtToken } from "../../utils/tokenHelper";
import {
  generaterefreshTokenAndSetCookie,
  sendForgotPasswordEmail,
  sendVerificationEmail,
} from "./auth.service";
import crypto from "crypto";

export const handleRegister = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let { email, password, name } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return next(customError("email already exist", 400));
    }

    let verificationToken: string;
    try {
      verificationToken = await sendVerificationEmail(normalizedEmail);
      console.log("email sent");
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return next(customError("Failed to send verification email", 500));
    }

    const hashedPass = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPass,
        name,
        verificationToken,
        verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const userForRespons = {
      id: user.id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      isEmailVerified: user.isEmailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      status: true,
      message: "User registered successfully. Please verify your email.",
      data: userForRespons,
    });
  } catch (error) {
    console.log("error in handleRegister = ", error);
    next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, code } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return next(customError("email doesn't exist", 400));
    }

    if (user.isEmailVerified) {
      return next(customError("you alredy verified your email", 400));
    }

    if (user.verificationToken !== code) {
      return next(customError("your verification Token is wrong", 400));
    }

    if (
      user.verificationTokenExpiresAt &&
      new Date(Date.now()) > user.verificationTokenExpiresAt
    ) {
      return next(customError("your verification Token has expired", 400));
    }

    const updatedUser = await prisma.user.update({
      where: {
        email: normalizedEmail,
      },
      data: {
        verificationToken: null,
        verificationTokenExpiresAt: null,
        isEmailVerified: true,
      },
    });

    const userForRespons = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      gender: updatedUser.gender,
      isEmailVerified: updatedUser.isEmailVerified,
      twoFactorEnabled: updatedUser.twoFactorEnabled,
      createdAt: updatedUser.createdAt,
    };

    res.status(201).json({
      status: true,
      message: "email verified successfully",
      data: userForRespons,
    });
  } catch (error) {
    console.log("error in verifyEmail = ", error);
    next(error);
  }
};

export const sendVerificationTokenAgain = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return next(customError("email doesn't exist", 400));
    }

    if (user.isEmailVerified) {
      return next(customError("you alredy verified your email", 400));
    }

    if (
      user.verificationTokenExpiresAt &&
      new Date(Date.now()) < user.verificationTokenExpiresAt
    ) {
      return next(
        customError(
          "your verification Token that has sent is still valid",
          400,
        ),
      );
    }

    let verificationToken: string;
    try {
      verificationToken = await sendVerificationEmail(normalizedEmail);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return next(customError("Failed to send verification email", 500));
    }

    const updatedUser = await prisma.user.update({
      where: {
        email: normalizedEmail,
      },
      data: {
        verificationToken,
        verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    res.status(201).json({
      status: true,
      message:
        "If an account with this email exists, we will send you a reset link",
    });
  } catch (error) {
    console.log("error in verifyEmail = ", error);
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

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findFirst({
      where: { email: normalizedEmail },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!existingUser) {
      return next(customError("User doesn't exist", 400));
    }

    if (!existingUser.isEmailVerified) {
      return next(customError("you havent verified your email", 400));
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
      24 * 60 * 60 * 1000,
    );

    generaterefreshTokenAndSetCookie(res, {
      id: existingUser.id,
    });

    const userForRespons = {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      gender: existingUser.gender,
      isEmailVerified: existingUser.isEmailVerified,
      twoFactorEnabled: existingUser.twoFactorEnabled,
      createdAt: existingUser.createdAt,
    };

    res.status(200).json({
      status: true,
      message: "Login successful",
      data: {
        ...userForRespons,
        accessToken,
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

export async function forgotPasswordHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, route } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return next(customError("User doesn't exist", 400));
    }

    const rawToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const updatedUser = await prisma.user.update({
      where: {
        email: normalizedEmail,
      },
      data: {
        resetPasswordToken: tokenHash,
        resetPasswordExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const resetUrl = `${route}?token=${rawToken}`;

    try {
      await sendForgotPasswordEmail(normalizedEmail, resetUrl);
      console.log("email sent");
    } catch (emailError) {
      console.error("Failed to send forget pss email:", emailError);
      return next(customError("Failed to send forget pss email", 500));
    }

    res.json({
      message: 'a link will send to your email',
      
    });
  } catch (error) {
    console.log("error in forgotPasswordHandler = ", error);
    next(error);
  }
}

export async function resetPasswordHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, token, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return next(customError("User doesn't exist", 400));
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    if (tokenHash !== user.resetPasswordToken) {
      return next(customError("token is wrong", 400));
    }

    if (
      user.resetPasswordExpires &&
      new Date(Date.now()) > user.resetPasswordExpires
    ) {
      return next(customError("your reset password Token has expired", 400));
    }

    const hashedPass = await hashPassword(password);

    const updatedUser = await prisma.user.update({
      where: {
        email: normalizedEmail,
      },
      data: {
        resetPasswordToken: null,
        resetPasswordExpires: null,
        password: hashedPass,
      },
    });

    const userForRespons = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      gender: updatedUser.gender,
      isEmailVerified: updatedUser.isEmailVerified,
      twoFactorEnabled: updatedUser.twoFactorEnabled,
      createdAt: updatedUser.createdAt,
    };

    res.status(201).json({
      status: true,
      message: "password changed successfully",
      data: userForRespons,
    });
  } catch (error) {
    console.log("error in forgotPasswordHandler = ", error);
    next(error);
  }
}
