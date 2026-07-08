import express from "express";
import { checkAuthentication, hasUser, requirePermission } from "../../middlewares/authMiddleware";
import { validateMiddleware } from "../../middlewares/validateMiddleware";
import {
  createCourseHelper,
  createCourseStepOne,
  createCourseStepTwo,
  getAllCourses,
  getCourseDetail,
  updateCourse,
} from "./course.controller";
import {
  getAllCoursesValidation,
  getCourseDetailValidation,
  createCourseStepOneValidation,
  createCourseStepTwoValidation,
  updateCourseValidation,
} from "./course.validation";
import { Actions, Resources } from "../../constants/permissions";

const courseRouter = express.Router();

courseRouter.get(
  "/get-all-courses",
  getAllCoursesValidation,
  hasUser,
  validateMiddleware,
  getAllCourses,
);

courseRouter.get(
  "/get-course-detail/:courseId",
  getCourseDetailValidation,
  hasUser,
  validateMiddleware,
  getCourseDetail,
);

courseRouter.get(
  "/create-course-helper",
  checkAuthentication,
  requirePermission(Resources.COURSE, Actions.READ),
  createCourseHelper,
);

courseRouter.post(
  "/create-course-step-one",
  checkAuthentication,
  requirePermission(Resources.COURSE, Actions.CREATE),
  createCourseStepOneValidation,
  validateMiddleware,
  createCourseStepOne,
);

courseRouter.post(
  "/create-course-step-two",
  checkAuthentication,
  requirePermission(Resources.COURSE, Actions.CREATE),
  createCourseStepTwoValidation,
  validateMiddleware,
  createCourseStepTwo,
);

courseRouter.put(
  "/update-course",
  checkAuthentication,
  requirePermission(Resources.COURSE, Actions.UPDATE),
  updateCourseValidation,
  validateMiddleware,
  updateCourse,
);

export default courseRouter;