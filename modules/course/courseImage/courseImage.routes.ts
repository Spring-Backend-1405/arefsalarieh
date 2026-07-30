import express from "express";
import {
  checkAuthentication,
  requirePermission,
} from "../../../middlewares/authMiddleware";
import uploadCourse from "../../../middlewares/uploadCourse";
import { changeCourseMainImage, deleteCourseImage, uploadCourseImages } from "./courseImage.controller";
import { Actions, Resources } from "../../../constants/permissions";

const courseImageRouter = express.Router();

courseImageRouter.post(
  "/upload/:courseId",
  checkAuthentication,
  requirePermission(Resources.COURSE, Actions.CREATE),
  uploadCourse.array("files", 5),
  uploadCourseImages,
);


courseImageRouter.put(
  "/change-main-image",
  checkAuthentication,
  requirePermission(Resources.COURSE, Actions.UPDATE),
  changeCourseMainImage,
);

courseImageRouter.delete(
  "/delete",
  checkAuthentication,
  deleteCourseImage,
);

export default courseImageRouter;
