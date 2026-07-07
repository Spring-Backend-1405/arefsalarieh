import express from "express";
import { checkAuthentication } from "../../../middlewares/authMiddleware";
import { createCourseHelper, createCourseStepOne, createCourseStepTwo, getAllCourses } from "../controllers/course.controller";


const courseRouter = express.Router();


courseRouter.get(
  "/create-course-helper",
  checkAuthentication,
  createCourseHelper,
);


courseRouter.post(
  "/create-course-step-one",
  checkAuthentication,
  createCourseStepOne,
);

courseRouter.post(
  "/create-course-step-two",
  checkAuthentication,
  createCourseStepTwo,
);

courseRouter.get(
  "/get-all-courses",
  checkAuthentication,
  getAllCourses,
);

export default courseRouter;
