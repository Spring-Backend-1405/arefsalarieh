import express from "express";
import { validateMiddleware } from "../../middlewares/validateMiddleware";
import {
  checkAuthentication,
  requirePermission,
} from "../../middlewares/authMiddleware";

import { Actions, Resources } from "../../constants/permissions";
import { getAllReserves, reserveCourse } from "./enrollment.controller";

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






export default enrollmentRouter;