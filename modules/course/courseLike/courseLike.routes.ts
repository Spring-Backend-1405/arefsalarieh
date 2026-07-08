import express from "express";

import { checkAuthentication, requirePermission } from "../../../middlewares/authMiddleware";
import { validateMiddleware } from "../../../middlewares/validateMiddleware";

import { Actions, Resources } from "../../../constants/permissions";
import { likeCourse } from "./courseLike.controller";

const courseLike = express.Router();

courseLike.post(
  "/add-like",
  checkAuthentication,
  likeCourse,
);


export default courseLike;