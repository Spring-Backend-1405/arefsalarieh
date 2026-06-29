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

export const sendVerificationEmail = async (
  email: string,
  text = "Verify your email",
): Promise<string> => {
  const verificationToken = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();

  const html = VERIFICATION_EMAIL_TEMPLATE.replace(
    "{verificationCode}",
    verificationToken,
  );

  await sendEmail(email, text, html);

  return verificationToken;
};

export const sendVerificationEmailInLogin = async (
  normalizedEmail: string,
  res: Response,
  next: NextFunction,
) => {
  let verificationToken: string;
  try {
    verificationToken = await sendVerificationEmail(
      normalizedEmail,
      "login verify code",
    );

    const updateUser = await prisma.user.update({
      where: {
        email: normalizedEmail,
      },
      data: {
        twoFactorSecret: verificationToken,
        twoFactorSecretExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    return res.status(201).json({
      status: true,
      message: "check your email",
    });
  } catch (emailError) {
    console.error("Failed to send 2fa email:", emailError);
    return next(customError("Failed to send 2fa email", 500));
  }
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
    console.error("Failed to send qr code:", error);
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
