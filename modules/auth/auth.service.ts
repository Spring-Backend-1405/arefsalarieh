import "dotenv/config";
import { createJwtToken } from "../../utils/tokenHelper";
import type { Response, NextFunction } from "express";
import { env } from "../../config/env";
import { sendEmail } from "../../config/nodemailer.config";
import { OAuth2Client } from "google-auth-library";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "../../utils/emailTemplates";
import { customError } from "../../utils/customError";
import { prisma } from "../../utils/prisma";
import { authenticator } from "otplib";

export const generaterefreshTokenAndSetCookie = (
  res: Response,
  data: { id: string },
) => {
  const refreshToken = createJwtToken(
    {
      id: data.id,
    },
    7 * 24 * 60 * 60 * 1000,
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.envirement === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const sendVerificationEmail = async (email: string): Promise<string> => {
  const verificationToken = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();

  const html = VERIFICATION_EMAIL_TEMPLATE.replace(
    "{verificationCode}",
    verificationToken,
  );

  await sendEmail(email, "Verify your email", html);

  return verificationToken;
};

export const sendVerificationEmailInLogin = async (
  email: string,
) => {
  const loginVerificationToken = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();

  const html = VERIFICATION_EMAIL_TEMPLATE.replace(
    "{verificationCode}",
    loginVerificationToken,
  );

  await sendEmail(email, "Verify your login", html);

  return loginVerificationToken;
};

export const sedLinkForQrCode = async (
  existingUser: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const secret = authenticator.generateSecret();
    const issuer = env.appName;
    const otpAuthUrl = authenticator.keyuri(existingUser.email, issuer, secret);
    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        qrCodeSecret: secret,
        qrCodeSecretExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return res.status(201).json({
      status: true,
      message: "you should confirm wit QR code",
      data: {
        otpAuthUrl,
        secret,
      },
    });
  } catch (error) {
    console.log("Failed to send qr code:", error);
    return next(customError("Failed to send qr code:", 500));
  }
};

export const sendForgotPasswordEmail = async (
  email: string,
  resetURL: string,
) => {
  const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL);

  await sendEmail(email, "reset your pass", html);
};

export function getGoogleClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret) {
    throw new Error("Google client id and secret both are missing");
  }

  return new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri,
  });
}

export const userForResponse = (user: any) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    gender: user.gender,
    isEmailVerified: user.isEmailVerified,
    twoFactorEnabled: user.twoFactorEnabled,
    qrCodeEnabled: user.qrCodeEnabled,
    createdAt: user.createdAt,
  };
};

export const createTokenForResponse = async (
  existingUser: any,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const accessToken = createJwtToken(
      {
        id: existingUser.id,
      },
      24 * 60 * 60 * 1000,
    );

    generaterefreshTokenAndSetCookie(res, {
      id: existingUser.id,
    });

    return accessToken;
  } catch (error) {
    console.log("Failed to createTokenAndResponse", error);
    return next(customError("Failed to createTokenAndResponse", 500));
  }
};
