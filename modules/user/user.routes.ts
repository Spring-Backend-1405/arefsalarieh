import express from "express";
import { validateMiddleware } from "../../middlewares/validateMiddleware";
import { getAllUsers, getUserProfile, updateProfile } from "./user.controller";
import {
  checkAuthentication,
  requirePermission,
} from "../../middlewares/authMiddleware";
import { updateProfileValidation } from "./user.validation";
import { Actions, Resources } from "../../constants/permissions";

const userRouter = express.Router();

userRouter.get("/profile", checkAuthentication, getUserProfile);

userRouter.put(
  "/update-profile",
  checkAuthentication,
  updateProfileValidation,
  validateMiddleware,
  updateProfile,
);

userRouter.get(
  "/all-users",
  checkAuthentication,
  requirePermission(Resources.USER, Actions.READ),
  getAllUsers,
);

export default userRouter;
