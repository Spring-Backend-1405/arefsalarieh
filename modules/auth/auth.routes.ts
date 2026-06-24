import express from "express";
import { handleRegister } from "./auth.controller";
import { registerValidation } from "./auth.validation";
import { validateMiddleware } from "../../middlewares/validateMiddleware";

const authRouter = express.Router();

authRouter.post("/register",registerValidation ,validateMiddleware , handleRegister);

export default authRouter;
