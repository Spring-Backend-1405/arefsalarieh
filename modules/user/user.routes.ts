import express from "express";
import { validateMiddleware } from "../../middlewares/validateMiddleware";
import { getAllUsers, getUserProfile, updateProfile, uploadProfileImages } from "./user.controller";
import {
  checkAuthentication,
  requirePermission,
} from "../../middlewares/authMiddleware";
import { updateProfileValidation } from "./user.validation";
import { Actions, Resources } from "../../constants/permissions";
import upload from "../../middlewares/upload";

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

userRouter.post(
  "/upload-profile-images",
  checkAuthentication,
  upload.array("files", 5),
  uploadProfileImages,
);

export default userRouter;
