import express from "express";

import {
  checkAuthentication,
  requirePermission,
} from "../../../middlewares/authMiddleware";
import { validateMiddleware } from "../../../middlewares/validateMiddleware";

import { Actions, Resources } from "../../../constants/permissions";
import { addCourseComment, confirmCourseComment, getCommentReplies, getcourseComments, getcourseCommentsWithPermission, rejectCourseComment } from "./courseComment.controller";

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

courseComment.get(
  "/get-comment-replies/:commentId",
  checkAuthentication,
  getCommentReplies,
);

courseComment.get(
  "/get-course-comment-with-permission/:courseId",
  checkAuthentication,
  requirePermission(Resources.COMMENT , Actions.READ),
  getcourseCommentsWithPermission,
);

courseComment.put(
  "/confirm-course-comment/:commentId",
  checkAuthentication,
  requirePermission(Resources.COMMENT , Actions.CONFIRM),
  confirmCourseComment,
);

courseComment.put(
  "/reject-course-comment/:commentId",
  checkAuthentication,
  requirePermission(Resources.COMMENT , Actions.REJECT),
  rejectCourseComment,
);

export default courseComment;
