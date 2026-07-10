import express from "express";

import {
  checkAuthentication,
  requirePermission,
} from "../../../middlewares/authMiddleware";
import { validateMiddleware } from "../../../middlewares/validateMiddleware";

import { Actions, Resources } from "../../../constants/permissions";
import { addCourseComment } from "./courseComment.controller";

const courseComment = express.Router();

courseComment.post(
  "/add-course-comment",
  checkAuthentication,
  addCourseComment,
);

export default courseComment;
