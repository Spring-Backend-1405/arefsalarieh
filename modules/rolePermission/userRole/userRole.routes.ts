import express from "express";
import {
  checkAuthentication,
  requirePermission,
} from "../../../middlewares/authMiddleware";
import { addRoleToUser } from "./userRole.controller";


const userRoleRouter = express.Router();

userRoleRouter.post("/add-role-to-user", checkAuthentication, addRoleToUser);



export default userRoleRouter;
