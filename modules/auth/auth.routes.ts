import express from "express";
import {
  activeQRcode,
  activeTwoStepVerification,
  deActiveQRcode,
  deActiveTwoStepVerification,
  forgotPasswordHandler,
  googleAuthCallbackHandler,
  googleAuthStartHandler,
  handleLogin,
  handleLoginSteptwo,
  handleRefreshToken,
  handleRegister,
  qrCodeHandler,
  resetPasswordHandler,
  sendVerificationTokenAgain,
  verifyEmail,
} from "./auth.controller";
import {
  loginValidation,
  registerValidation,
  verifyEmailValidation,
  verifySendVerificationTokenAgain,
  loginStepTwoValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  passwordValidation,
  qrCodeValidation,
} from "./auth.validation";
import { validateMiddleware } from "../../middlewares/validateMiddleware";
import { checkAuthentication } from "../../middlewares/authMiddleware";

const authRouter = express.Router();

authRouter.post("/register", registerValidation, validateMiddleware, handleRegister);
authRouter.post("/verify-email", verifyEmailValidation, validateMiddleware, verifyEmail);
authRouter.post("/send-verification-token-again", verifySendVerificationTokenAgain, validateMiddleware, sendVerificationTokenAgain);
authRouter.post("/login", loginValidation, validateMiddleware, handleLogin);
authRouter.post("/login-step-two", loginStepTwoValidation, validateMiddleware, handleLoginSteptwo);
authRouter.post("/refresh-token", handleRefreshToken);
authRouter.post("/forgot-password", forgotPasswordValidation, validateMiddleware, forgotPasswordHandler);
authRouter.post("/reset-password", resetPasswordValidation, validateMiddleware, resetPasswordHandler);
authRouter.put("/active-2fa", checkAuthentication, passwordValidation, validateMiddleware, activeTwoStepVerification);
authRouter.put("/deactive-2fa", checkAuthentication, passwordValidation, validateMiddleware, deActiveTwoStepVerification);
authRouter.put("/active-qrcode", checkAuthentication, passwordValidation, validateMiddleware, activeQRcode);
authRouter.put("/deactive-qrcode", checkAuthentication, passwordValidation, validateMiddleware, deActiveQRcode);
authRouter.post("/qrcode", qrCodeValidation, validateMiddleware, qrCodeHandler);
authRouter.get("/google-step-one", googleAuthStartHandler);
authRouter.get("/google/callback", googleAuthCallbackHandler);

export default authRouter;