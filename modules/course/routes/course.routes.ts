import express from "express";
import { checkAuthentication } from "../../../middlewares/authMiddleware";
import { createCourseHelper, createCourseStepOne } from "../controllers/course.controller";


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





export default courseRouter;
