import express from "express";
import {
  addNewPermission,
  deletePermission,
  getAllPermissions,
  getResourcesAndActions,
} from "./permission.controller";
import {
  checkAuthentication,
  requirePermission,
} from "../../../middlewares/authMiddleware";
import { validateMiddleware } from "../../../middlewares/validateMiddleware";
import { Actions, Resources } from "../../../constants/permissions";
import {
  addPermissionValidation,
  deletePermissionValidation,
} from "./permission.validation";

const permissionRouter = express.Router();

permissionRouter.get(
  "/get-all-permission",
  checkAuthentication,
  requirePermission(Resources.PERMISSION, Actions.READ),
  getAllPermissions,
);

permissionRouter.get(
  "/get-resources-and-actions",
  checkAuthentication,
  requirePermission(Resources.PERMISSION, Actions.READ),
  getResourcesAndActions,
);

permissionRouter.post(
  "/add-new-permission",
  checkAuthentication,
  requirePermission(Resources.PERMISSION, Actions.CREATE),
  addPermissionValidation,
  validateMiddleware,
  addNewPermission,
);
permissionRouter.delete(
  "/delete-permission/:permissionId",
  checkAuthentication,
  requirePermission(Resources.PERMISSION, Actions.DELETE),
  deletePermissionValidation,
  validateMiddleware,
  deletePermission,
);

export default permissionRouter;