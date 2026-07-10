import express from "express";

import {
  checkAuthentication,
  requirePermission,
} from "../../../middlewares/authMiddleware";
import { validateMiddleware } from "../../../middlewares/validateMiddleware";

import { Actions, Resources } from "../../../constants/permissions";
import { addCourseComment, confirmCourseComment, getcourseComments, rejectCourseComment } from "./courseComment.controller";

const courseComment = express.Router();

courseComment.post(
  "/add-course-comment",
  checkAuthentication,
  addCourseComment,
);

courseComment.get(
  "/get-course-comment/:courseId",
  checkAuthentication,
  getcourseComments,
);

courseComment.put(
  "/confirm-course-comment/:commentId",
  checkAuthentication,
  confirmCourseComment,
);

courseComment.put(
  "/reject-course-comment/:commentId",
  checkAuthentication,
  rejectCourseComment,
);

export default courseComment;
