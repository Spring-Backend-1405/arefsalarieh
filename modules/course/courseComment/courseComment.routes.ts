import express from "express";

import {
  checkAuthentication,
  requirePermission,
} from "../../../middlewares/authMiddleware";
import { validateMiddleware } from "../../../middlewares/validateMiddleware";

import { Actions, Resources } from "../../../constants/permissions";
import { addCourseComment, confirmCourseCommentWithPermission, deleteCourseComment, getCommentReplies, getCommentRepliesWithPermission, getcourseComments, getcourseCommentsWithPermission, rejectCourseCommentWithPermission, updateCommentText } from "./courseComment.controller";

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

courseComment.put(
  "/update-comment",
  checkAuthentication,
  updateCommentText,
);

courseComment.delete(
  "/delete-course-comment/:commentId",
  checkAuthentication,
  deleteCourseComment,
);

courseComment.get(
  "/get-course-comment-with-permission/:courseId",
  checkAuthentication,
  requirePermission(Resources.COMMENT , Actions.READ),
  getcourseCommentsWithPermission,
);

courseComment.get(
  "/get-comment-replies-with-permission/:commentId",
  checkAuthentication,
  getCommentRepliesWithPermission,
);

courseComment.put(
  "/confirm-course-comment-with-permission/:commentId",
  checkAuthentication,
  requirePermission(Resources.COMMENT , Actions.CONFIRM),
  confirmCourseCommentWithPermission,
);

courseComment.put(
  "/reject-course-comment-with-permission/:commentId",
  checkAuthentication,
  requirePermission(Resources.COMMENT , Actions.REJECT),
  rejectCourseCommentWithPermission,
);

export default courseComment;
