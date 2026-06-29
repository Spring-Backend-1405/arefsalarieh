import express from "express";
import { activeQRcode, activeTwoStepVerification, deActiveQRcode, deActiveTwoStepVerification, forgotPasswordHandler, googleAuthCallbackHandler, googleAuthStartHandler, handleLogin, handleLoginSteptwo, handleRefreshToken, handleRegister, qrCodeHandler, resetPasswordHandler, sendVerificationTokenAgain, verifyEmail } from "./auth.controller";
import { loginValidation, registerValidation, verifyEmailValidation, verifySendVerificationTokenAgain } from "./auth.validation";
import { validateMiddleware } from "../../middlewares/validateMiddleware";
import { checkAuthentication } from "../../middlewares/authMiddleware";

const authRouter = express.Router();

authRouter.post("/register",registerValidation ,validateMiddleware , handleRegister);
authRouter.post("/verify-email",verifyEmailValidation ,validateMiddleware , verifyEmail);
authRouter.post("/send-verification-token-again",verifyEmailValidation ,verifySendVerificationTokenAgain , sendVerificationTokenAgain);
authRouter.post("/login",loginValidation ,validateMiddleware , handleLogin);
authRouter.post("/login-step-two" , handleLoginSteptwo);
authRouter.post("/refresh-token", handleRefreshToken); 
authRouter.post("/forget-password", forgotPasswordHandler);
authRouter.post("/reset-password", resetPasswordHandler);
authRouter.put("/active-2fa",checkAuthentication , activeTwoStepVerification);
authRouter.put("/deAactive-2fa",checkAuthentication , deActiveTwoStepVerification);
authRouter.put("/active-qrcode",checkAuthentication , activeQRcode);
authRouter.put("/deAactive-qrcode",checkAuthentication , deActiveQRcode);
authRouter.post("/qrcode" , qrCodeHandler);
authRouter.get("/google-step-one", googleAuthStartHandler);
authRouter.get("/google/callback", googleAuthCallbackHandler);


export default authRouter;
