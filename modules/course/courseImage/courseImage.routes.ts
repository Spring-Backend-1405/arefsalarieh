import express from "express";
import {
  checkAuthentication,
  requirePermission,
} from "../../../middlewares/authMiddleware";
import uploadCourse from "../../../middlewares/uploadCourse";
import { uploadCourseImages } from "./courseImage.controller";
import { Actions, Resources } from "../../../constants/permissions";

const courseImageRouter = express.Router();

courseImageRouter.post(
  "/upload/:courseId",
  checkAuthentication,
  requirePermission(Resources.COURSE, Actions.CREATE),
  uploadCourse.array("files", 5),
  uploadCourseImages,
);

export default courseImageRouter;
