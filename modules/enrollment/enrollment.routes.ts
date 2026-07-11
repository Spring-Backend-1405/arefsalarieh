import express from "express";
import { validateMiddleware } from "../../middlewares/validateMiddleware";
import {
  checkAuthentication,
  requirePermission,
} from "../../middlewares/authMiddleware";

import { Actions, Resources } from "../../constants/permissions";
import { confirmCourseReserve, finalizedEnrollment, getAllReserves, getMyCourseReserves, rejectCourseReserve, reserveCourse } from "./enrollment.controller";

const enrollmentRouter = express.Router();


enrollmentRouter.post(
  "/reserve-course/:courseId",
  checkAuthentication,
  requirePermission(Resources.COURSE, Actions.ENROLL),
  reserveCourse,
);

enrollmentRouter.get(
  "/get-all-reserves",
  checkAuthentication,
  requirePermission(Resources.RESERVE, Actions.READ),
  getAllReserves,
);

enrollmentRouter.post(
  "/confirm-course-reserve/:reserveId",
  checkAuthentication,
  requirePermission(Resources.RESERVE, Actions.CONFIRM),
  confirmCourseReserve,
);

enrollmentRouter.post(
  "/reject-course-reserve/:reserveId",
  checkAuthentication,
  requirePermission(Resources.RESERVE, Actions.REJECT),
  rejectCourseReserve,
);

enrollmentRouter.get(
  "/get-my-course-reserves",
  checkAuthentication,
  getMyCourseReserves,
);

enrollmentRouter.post(
  "/finalized-enrollment/:reserveId",
  checkAuthentication,
  finalizedEnrollment,
);


export default enrollmentRouter;