import express from "express";
import { checkAuthentication } from "../../../middlewares/authMiddleware";
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

const courseTypeRouter = express.Router();

courseTypeRouter.post(
  "/add-new-type",
  checkAuthentication,
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
  deleteCourseTypeValidation,
  validateMiddleware,
  deleteCourseType,
);

export default courseTypeRouter;