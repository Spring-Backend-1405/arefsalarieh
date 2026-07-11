import express from "express";
import { validateMiddleware } from "../../middlewares/validateMiddleware";
import {
  checkAuthentication,
  requirePermission,
} from "../../middlewares/authMiddleware";

import { Actions, Resources } from "../../constants/permissions";
import { reserveCourse } from "./enrollment.controller";

const enrollmentRouter = express.Router();


enrollmentRouter.post(
  "/reserve-course/:courseId",
  checkAuthentication,
  requirePermission(Resources.COURSE, Actions.ENROLL),
  reserveCourse,
);





export default enrollmentRouter;