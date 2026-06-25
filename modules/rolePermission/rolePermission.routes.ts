import express from "express";
import { validateMiddleware } from "../../middlewares/validateMiddleware";
import { registerValidation } from "../auth/auth.validation";
import { addPermissionToRole, deletePermissionfromRole, getAllRolePermission, getSingleRolePermission } from "./rolePermission.controller";

const rolePermissionRouter = express.Router();

rolePermissionRouter.get("/get-all-role-Permission",registerValidation  , getAllRolePermission);
rolePermissionRouter.get("/get-single-role-Permission/:roleId",registerValidation  , getSingleRolePermission);
rolePermissionRouter.post("/add-permission-to-role",registerValidation  , addPermissionToRole);
rolePermissionRouter.delete("/delete-permission-from-role",registerValidation  , deletePermissionfromRole);


export default rolePermissionRouter;
