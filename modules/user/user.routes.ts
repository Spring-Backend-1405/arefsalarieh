import express from "express";
import { validateMiddleware } from "../../middlewares/validateMiddleware";
import {
  changeMainImage,
  deleteUserImage,
  getAllUsers,
  getUserImageById,
  getUserProfile,
  updateProfile,
  uploadProfileImages,
} from "./user.controller";
import {
  checkAuthentication,
  requirePermission,
} from "../../middlewares/authMiddleware";
import {
  updateProfileValidation,
  getAllUsersValidation,
  imageIdValidation,
} from "./user.validation";
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
  getAllUsersValidation,
  validateMiddleware,
  getAllUsers,
);

userRouter.post(
  "/upload-profile-images",
  checkAuthentication,
  upload.array("files", 5),
  uploadProfileImages,
);

userRouter.get(
  "/image/:imageId",
  checkAuthentication,
  imageIdValidation,
  validateMiddleware,
  getUserImageById,
);

userRouter.put(
  "/change-main-image/:imageId",
  checkAuthentication,
  imageIdValidation,
  validateMiddleware,
  changeMainImage,
);

userRouter.delete(
  "/delete-user-image/:imageId",
  checkAuthentication,
  imageIdValidation,
  validateMiddleware,
  deleteUserImage,
);

export default userRouter;