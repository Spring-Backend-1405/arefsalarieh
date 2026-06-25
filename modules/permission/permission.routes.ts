import express from "express";
import { registerValidation } from "../auth/auth.validation";
import { addNewPermission, getAllPermissions } from "./permission.controller";

const permissionRouter = express.Router();

permissionRouter.get("/get-all-permission",registerValidation  , getAllPermissions);
permissionRouter.post("/add-new-permission",registerValidation  , addNewPermission);


export default permissionRouter;
