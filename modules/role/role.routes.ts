import express from "express";
import { validateMiddleware } from "../../middlewares/validateMiddleware";
import { registerValidation } from "../auth/auth.validation";
import { getAllRoles } from "./role.controller";


const roleRouter = express.Router();

roleRouter.get("/get-all-roules",registerValidation   , getAllRoles);



export default roleRouter;
