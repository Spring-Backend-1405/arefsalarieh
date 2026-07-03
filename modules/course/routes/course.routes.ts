import express from "express";
import { checkAuthentication } from "../../../middlewares/authMiddleware";
import { createCourseHelper } from "../controllers/course.controller";


const courseRouter = express.Router();


courseRouter.get(
  "/create-course-helper",
  checkAuthentication,
  createCourseHelper,
);





export default courseRouter;
