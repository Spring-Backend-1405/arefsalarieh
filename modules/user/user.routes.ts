import express from "express";

import { validateMiddleware } from "../../middlewares/validateMiddleware";
import { getUserProfile } from "./user.controller";
import { checkAuthentication } from "../../middlewares/authMiddleware";

const userRouter = express.Router();

userRouter.get('/profile' ,checkAuthentication , getUserProfile)



export default userRouter;
