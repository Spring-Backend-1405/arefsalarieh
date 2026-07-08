import express from "express";
import {
  addPermissionToUser,
  deleteDenyPermissionFromUser,
  deletePermissionFromUser,
  denyPermissionToUser,
  getUserExceptionPermissions,
  getUserPermissions,
} from "./userPermissionException.controller";
import {
  checkAuthentication,
  requirePermission,
} from "../../../middlewares/authMiddleware";
import { validateMiddleware } from "../../../middlewares/validateMiddleware";
import { Actions, Resources } from "../../../constants/permissions";
import {
  getUserPermissionsValidation,
  addPermissionToUserValidation,
  deletePermissionFromUserValidation,
  denyPermissionToUserValidation,
  deleteDenyPermissionFromUserValidation,
} from "./userPermissionException.validation";

const userPermissionException = express.Router();

userPermissionException.get(
  "/get-user-permission/:userId",
  checkAuthentication,
  requirePermission(Resources.USERPERMISSION, Actions.READ),
  getUserPermissionsValidation,
  validateMiddleware,
  getUserPermissions,
);

userPermissionException.get(
  "/get-user-exeption-permission/:userId",
  checkAuthentication,
  requirePermission(Resources.USERPERMISSION, Actions.READ),
  getUserPermissionsValidation,
  validateMiddleware,
  getUserExceptionPermissions,
);

userPermissionException.post(
  "/add-permission-to-user",
  checkAuthentication,
  requirePermission(Resources.USERPERMISSION, Actions.CREATE),
  addPermissionToUserValidation,
  validateMiddleware,
  addPermissionToUser,
);
userPermissionException.delete(
  "/delete-permission-from-user",
  checkAuthentication,
  requirePermission(Resources.USERPERMISSION, Actions.DELETE),
  deletePermissionFromUserValidation,
  validateMiddleware,
  deletePermissionFromUser,
);

userPermissionException.post(
  "/deny-permission-to-user",
  checkAuthentication,
  requirePermission(Resources.USERPERMISSION, Actions.CREATE),
  denyPermissionToUserValidation,
  validateMiddleware,
  denyPermissionToUser,
);
userPermissionException.delete(
  "/delete-deny-permission-from-user",
  checkAuthentication,
  requirePermission(Resources.USERPERMISSION, Actions.DELETE),
  deleteDenyPermissionFromUserValidation,
  validateMiddleware,
  deleteDenyPermissionFromUser,
);

export default userPermissionException;