import express from "express";

import { checkAuthentication, requirePermission } from "../../../middlewares/authMiddleware";
import { validateMiddleware } from "../../../middlewares/validateMiddleware";

import { Actions, Resources } from "../../../constants/permissions";
import { deleteCourseDisLike, deleteCourseLike, disLikeCourse, likeCourse } from "./courseLike.controller";

const courseLike = express.Router();

courseLike.post(
  "/add-like/:courseId",
  checkAuthentication,
  likeCourse,
);

courseLike.delete(
  "/delete-like/:courseId",
  checkAuthentication,
  deleteCourseLike,
);

courseLike.post(
  "/disLike/:courseId",
  checkAuthentication,
  disLikeCourse,
);

courseLike.delete(
  "/delete-disLike/:courseId",
  checkAuthentication,
  deleteCourseDisLike,
);


export default courseLike;