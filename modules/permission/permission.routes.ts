import express from "express";
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
  checkAuthentication,
  requirePermission(Resources.PERMISSION, Actions.READ),
  getAllPermissions,
);
permissionRouter.post(
  "/add-new-permission",
  checkAuthentication,
  requirePermission(Resources.PERMISSION, Actions.CREATE),
  addNewPermission,
);
permissionRouter.delete(
  "/delete-permission/:permissionId",
  checkAuthentication,
  requirePermission(Resources.PERMISSION, Actions.DELETE),
  deletePermission,
);

export default permissionRouter;
