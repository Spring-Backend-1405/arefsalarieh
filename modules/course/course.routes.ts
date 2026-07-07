import express from "express";
import { checkAuthentication } from "../../middlewares/authMiddleware";
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

const courseRouter = express.Router();

courseRouter.get(
  "/get-all-courses",
  getAllCoursesValidation,
  validateMiddleware,
  getAllCourses,
);

courseRouter.get(
  "/get-course-detail/:courseId",
  getCourseDetailValidation,
  validateMiddleware,
  getCourseDetail,
);

courseRouter.get(
  "/create-course-helper",
  checkAuthentication,
  createCourseHelper,
);

courseRouter.post(
  "/create-course-step-one",
  checkAuthentication,
  createCourseStepOneValidation,
  validateMiddleware,
  createCourseStepOne,
);

courseRouter.post(
  "/create-course-step-two",
  checkAuthentication,
  createCourseStepTwoValidation,
  validateMiddleware,
  createCourseStepTwo,
);

courseRouter.put(
  "/update-course",
  checkAuthentication,
  updateCourseValidation,
  validateMiddleware,
  updateCourse,
);

export default courseRouter;