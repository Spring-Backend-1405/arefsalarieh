import express from "express";

import {
  checkAuthentication,
  requirePermission,
} from "../../../middlewares/authMiddleware";
import { validateMiddleware } from "../../../middlewares/validateMiddleware";

import { Actions, Resources } from "../../../constants/permissions";
import {
  addCourseComment,
  confirmCourseCommentWithPermission,
  deleteCourseComment,
  getCommentReplies,
  getCommentRepliesWithPermission,
  getcourseComments,
  getcourseCommentsWithPermission,
  rejectCourseCommentWithPermission,
  updateCommentText,
} from "./courseComment.controller";

import {
  addCourseCommentValidation,
  getCourseCommentsValidation,
  getCommentRepliesValidation,
  updateCommentTextValidation,
  deleteCourseCommentValidation,
  getCourseCommentsWithPermissionValidation,
  getCommentRepliesWithPermissionValidation,
  confirmCourseCommentWithPermissionValidation,
  rejectCourseCommentWithPermissionValidation,
} from "./courseComment.validation";

const courseComment = express.Router();

courseComment.post(
  "/add-course-comment",
  checkAuthentication,
  addCourseCommentValidation,
  validateMiddleware,
  addCourseComment,
);

courseComment.get(
  "/get-course-comment/:courseId",
  checkAuthentication,
  getCourseCommentsValidation,
  validateMiddleware,
  getcourseComments,
);

courseComment.get(
  "/get-comment-replies/:commentId",
  checkAuthentication,
  getCommentRepliesValidation,
  validateMiddleware,
  getCommentReplies,
);

courseComment.put(
  "/update-comment",
  checkAuthentication,
  updateCommentTextValidation,
  validateMiddleware,
  updateCommentText,
);

courseComment.delete(
  "/delete-course-comment/:commentId",
  checkAuthentication,
  deleteCourseCommentValidation,
  validateMiddleware,
  deleteCourseComment,
);

courseComment.get(
  "/get-course-comment-with-permission/:courseId",
  checkAuthentication,
  requirePermission(Resources.COMMENT, Actions.READ),
  getCourseCommentsWithPermissionValidation,
  validateMiddleware,
  getcourseCommentsWithPermission,
);

courseComment.get(
  "/get-comment-replies-with-permission/:commentId",
  checkAuthentication,
  requirePermission(Resources.COMMENT, Actions.READ),
  getCommentRepliesWithPermissionValidation,
  validateMiddleware,
  getCommentRepliesWithPermission,
);

courseComment.put(
  "/confirm-course-comment-with-permission/:commentId",
  checkAuthentication,
  requirePermission(Resources.COMMENT, Actions.CONFIRM),
  confirmCourseCommentWithPermissionValidation,
  validateMiddleware,
  confirmCourseCommentWithPermission,
);

courseComment.put(
  "/reject-course-comment-with-permission/:commentId",
  checkAuthentication,
  requirePermission(Resources.COMMENT, Actions.REJECT),
  rejectCourseCommentWithPermissionValidation,
  validateMiddleware,
  rejectCourseCommentWithPermission,
);

export default courseComment;