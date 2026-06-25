import express from "express";
import {
  addPermissionToRole,
  deletePermissionfromRole,
  getAllRolePermission,
  getSingleRolePermission,
} from "./rolePermission.controller";
import {
  checkAuthentication,
  requirePermission,
} from "../../middlewares/authMiddleware";
import { Resources, Actions, Roles } from "../../constants/permissions";

const rolePermissionRouter = express.Router();

rolePermissionRouter.get(
  "/get-all-role-Permission",
  checkAuthentication,
  requirePermission(Resources.ROLEPERMISSION, Actions.READ),
  getAllRolePermission,
);
rolePermissionRouter.get(
  "/get-single-role-Permission/:roleId",
  checkAuthentication,
  requirePermission(Resources.ROLEPERMISSION, Actions.READ),
  getSingleRolePermission,
);
rolePermissionRouter.post(
  "/add-permission-to-role",
  checkAuthentication,
  requirePermission(Resources.ROLEPERMISSION, Actions.CREATE),
  addPermissionToRole,
);
rolePermissionRouter.delete(
  "/delete-permission-from-role",
  checkAuthentication,
  requirePermission(Resources.ROLEPERMISSION, Actions.DELETE),
  deletePermissionfromRole,
);

export default rolePermissionRouter;
