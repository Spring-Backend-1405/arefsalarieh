import express from "express";
import { checkAuthentication } from "../../middlewares/authMiddleware";
import { createCourseHelper, createCourseStepOne, createCourseStepTwo, getAllCourses, getCourseDetail, updateCourse } from "./course.controller";


const courseRouter = express.Router();




courseRouter.get(
  "/get-all-courses",
  getAllCourses,
);

courseRouter.get(
  "/get-course-detail/:courseId",
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
  createCourseStepOne,
);

courseRouter.post(
  "/create-course-step-two",
  checkAuthentication,
  createCourseStepTwo,
);

courseRouter.put(
  "/update-course",
  checkAuthentication,
  updateCourse,
);

export default courseRouter;
