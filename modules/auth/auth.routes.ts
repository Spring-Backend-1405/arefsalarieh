import express from "express";
import { handleLogin, handleRefreshToken, handleRegister } from "./auth.controller";
import { loginValidation, registerValidation } from "./auth.validation";
import { validateMiddleware } from "../../middlewares/validateMiddleware";

const authRouter = express.Router();

authRouter.post("/register",registerValidation ,validateMiddleware , handleRegister);
authRouter.post("/login",loginValidation ,validateMiddleware , handleLogin);
authRouter.post("/refresh-token", handleRefreshToken); 


export default authRouter;
