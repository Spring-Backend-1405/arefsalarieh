import express from "express";
import {
  addPermissionToUser,
  deleteDenyPermissionFromUser,
  deletePermissionFromUser,
  denyPermissionToUser,
  getUserPermissions,
} from "./userPermissionException.controller";
import {
  checkAuthentication,
  requirePermission,
} from "../../middlewares/authMiddleware";
import { Actions, Resources } from "../../constants/permissions";

const userPermissionException = express.Router();

userPermissionException.get(
  "/get-user-permission/:userId",
  checkAuthentication,
  requirePermission(Resources.USERPERMISSION, Actions.READ),
  getUserPermissions,
);

userPermissionException.post(
  "/add-permission-to-user",
  checkAuthentication,
  requirePermission(Resources.USERPERMISSION, Actions.CREATE),
  addPermissionToUser,
);
userPermissionException.delete(
  "/delete-permission-from-user",
  checkAuthentication,
  requirePermission(Resources.USERPERMISSION, Actions.DELETE),
  deletePermissionFromUser,
);

userPermissionException.post(
  "/deny-permission-to-user",
  checkAuthentication,
  requirePermission(Resources.USERPERMISSION, Actions.CREATE),
  denyPermissionToUser,
);
userPermissionException.delete(
  "/delete-deny-permission-from-user",
  checkAuthentication,
  requirePermission(Resources.USERPERMISSION, Actions.DELETE),
  deleteDenyPermissionFromUser,
);

export default userPermissionException;
