import express from "express";
import { registerValidation } from "../auth/auth.validation";
import {
  addNewPermission,
  deletePermission,
  getAllPermissions,
} from "./permission.controller";
import {
  checkAuthentication,
  requirePermission,
} from "../../middlewares/authMiddleware";
import { Actions, Resources } from "../../constants/permissions";

const permissionRouter = express.Router();

permissionRouter.get(
  "/get-all-permission",
  registerValidation,
  checkAuthentication,
  requirePermission(Resources.PERMISSION, Actions.READ),
  getAllPermissions,
);
permissionRouter.post(
  "/add-new-permission",
  registerValidation,
  checkAuthentication,
  requirePermission(Resources.PERMISSION, Actions.CREATE),
  addNewPermission,
);
permissionRouter.delete(
  "/delete-permission/:permissionId",
  registerValidation,
  checkAuthentication,
  requirePermission(Resources.PERMISSION, Actions.DELETE),
  deletePermission,
);

export default permissionRouter;
