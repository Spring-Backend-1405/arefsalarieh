import express from "express";
import { activeTwoStepVerification, forgotPasswordHandler, handleLogin, handleRefreshToken, handleRegister, resetPasswordHandler, sendVerificationTokenAgain, verifyEmail } from "./auth.controller";
import { loginValidation, registerValidation, verifyEmailValidation, verifySendVerificationTokenAgain } from "./auth.validation";
import { validateMiddleware } from "../../middlewares/validateMiddleware";
import { checkAuthentication } from "../../middlewares/authMiddleware";

const authRouter = express.Router();

authRouter.post("/register",registerValidation ,validateMiddleware , handleRegister);
authRouter.post("/verify-email",verifyEmailValidation ,validateMiddleware , verifyEmail);
authRouter.post("/send-verification-token-again",verifyEmailValidation ,verifySendVerificationTokenAgain , sendVerificationTokenAgain);
authRouter.post("/login",loginValidation ,validateMiddleware , handleLogin);
authRouter.post("/refresh-token", handleRefreshToken); 
authRouter.post("/forget-password", forgotPasswordHandler);
authRouter.post("/reset-password", resetPasswordHandler);
authRouter.post("/active-2fa",checkAuthentication , activeTwoStepVerification);



export default authRouter;
