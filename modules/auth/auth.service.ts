import  "dotenv/config";
import { createJwtToken } from "../../utils/tokenHelper";
import type { Response, NextFunction } from "express";
import { env } from "../../config/env";
import { sendEmail } from "../../config/nodemailer.config";
import { OAuth2Client } from "google-auth-library";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "../../utils/emailTemplates";

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