import express from "express";
import { validateMiddleware } from "../../middlewares/validateMiddleware";
import { getAllUsers, getUserProfile, updateProfile } from "./user.controller";
import { checkAuthentication } from "../../middlewares/authMiddleware";
import { updateProfileValidation } from "./user.validation";

const userRouter = express.Router();

userRouter.get("/profile", checkAuthentication, getUserProfile);

userRouter.put(
  "/update-profile",
  checkAuthentication,
  updateProfileValidation, 
  validateMiddleware, 
  updateProfile,
);

userRouter.get("/all-users", checkAuthentication, getAllUsers);

export default userRouter;
