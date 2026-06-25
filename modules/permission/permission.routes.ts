import express from "express";
import { registerValidation } from "../auth/auth.validation";
import { addNewPermission, deletePermission, getAllPermissions } from "./permission.controller";



const permissionRouter = express.Router();

permissionRouter.get("/get-all-permission",registerValidation  , getAllPermissions);
permissionRouter.post("/add-new-permission",registerValidation ,   addNewPermission);
permissionRouter.delete("/delete-permission/:permissionId",registerValidation ,   deletePermission);

export default permissionRouter;
