import express from "express";
import { getAllRoles } from "./role.controller";
import { checkAuthentication, requirePermission } from "../../middlewares/authMiddleware";
import { Actions, Resources } from "../../constants/permissions";

const roleRouter = express.Router();

roleRouter.get(
  "/get-all-roules",
  checkAuthentication,
  requirePermission(Resources.ROLE, Actions.READ),
  getAllRoles,
);

export default roleRouter;
