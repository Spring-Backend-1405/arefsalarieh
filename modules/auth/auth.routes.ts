import express from "express";
import { handleLogin, handleRefreshToken, handleRegister, sendVerificationTokenAgain, verifyEmail } from "./auth.controller";
import { loginValidation, registerValidation, verifyEmailValidation, verifySendVerificationTokenAgain } from "./auth.validation";
import { validateMiddleware } from "../../middlewares/validateMiddleware";

const authRouter = express.Router();

authRouter.post("/register",registerValidation ,validateMiddleware , handleRegister);
authRouter.post("/verify-email",verifyEmailValidation ,validateMiddleware , verifyEmail);
authRouter.post("/send-verification-token-again",verifyEmailValidation ,verifySendVerificationTokenAgain , sendVerificationTokenAgain);
authRouter.post("/login",loginValidation ,validateMiddleware , handleLogin);
authRouter.post("/refresh-token", handleRefreshToken); 


export default authRouter;
