import express from "express";
import { checkAuthentication, requirePermission } from "../../../middlewares/authMiddleware";
import { validateMiddleware } from "../../../middlewares/validateMiddleware";
import {
  addNewCourseType,
  deleteCourseType,
  getAllCourseTypes,
} from "./courseType.controller";
import {
  addCourseTypeValidation,
  deleteCourseTypeValidation,
} from "./courseType.validation";
import { Actions, Resources } from "../../../constants/permissions";

const courseTypeRouter = express.Router();

courseTypeRouter.post(
  "/add-new-type",
  checkAuthentication,
  requirePermission(Resources.COURSETYPE, Actions.GENERAL),
  addCourseTypeValidation,
  validateMiddleware,
  addNewCourseType,
);

courseTypeRouter.get(
  "/get-all-types",
  checkAuthentication,
  getAllCourseTypes,
);

courseTypeRouter.delete(
  "/delete/:id",
  checkAuthentication,
  requirePermission(Resources.COURSETYPE, Actions.GENERAL),
  deleteCourseTypeValidation,
  validateMiddleware,
  deleteCourseType,
);

export default courseTypeRouter;