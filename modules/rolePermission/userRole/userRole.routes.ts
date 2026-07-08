// modules/rolePermission/userRole/userRole.routes.ts
import express from "express";
import {
  checkAuthentication,
  requirePermission,
} from "../../../middlewares/authMiddleware";
import { validateMiddleware } from "../../../middlewares/validateMiddleware";
import { addRoleToUser } from "./userRole.controller";
import { addRoleToUserValidation } from "./userRole.validation";

const userRoleRouter = express.Router();

userRoleRouter.post(
  "/add-role-to-user",
  checkAuthentication,
  addRoleToUserValidation,
  validateMiddleware,
  addRoleToUser,
);

export default userRoleRouter;