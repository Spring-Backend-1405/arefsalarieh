import express from "express";
import {
  addPermissionToRole,
  deletePermissionfromRole,
  getAllPermissionsRoles,
  getAllRolesPermissions,
  getSinglePermissionRoles,
  getSingleRolePermissions,
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
  getAllRolesPermissions,
);
rolePermissionRouter.get(
  "/get-single-role-Permission/:roleId",
  checkAuthentication,
  requirePermission(Resources.ROLEPERMISSION, Actions.READ),
  getSingleRolePermissions,
);
rolePermissionRouter.get(
  "/get-all-Permission-role",
  checkAuthentication,
  requirePermission(Resources.ROLEPERMISSION, Actions.READ),
  getAllPermissionsRoles,
);

rolePermissionRouter.get(
  "/get-single-Permission-roles/:permissionId",
  checkAuthentication,
  requirePermission(Resources.ROLEPERMISSION, Actions.READ),
  getSinglePermissionRoles,
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
