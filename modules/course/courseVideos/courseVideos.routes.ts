import express from "express";
import { checkAuthentication, requirePermission } from "../../../middlewares/authMiddleware";
import { deleteCourseVideo, getStreamCourseVideo, updateCourseVideoSession, uploadCourseVideo } from "./courseVideos.controller";
import { Actions, Resources } from "../../../constants/permissions";


const courseVideoRouter = express.Router();

courseVideoRouter.use(
  "/upload",
  checkAuthentication,
  requirePermission(Resources.VIDEO, Actions.CREATE),
  uploadCourseVideo
);

courseVideoRouter.get("/stream/:fileId", getStreamCourseVideo);

courseVideoRouter.delete("/:fileId", checkAuthentication,requirePermission(Resources.VIDEO, Actions.DELETE), deleteCourseVideo);

courseVideoRouter.put("/update-session", checkAuthentication,requirePermission(Resources.VIDEO, Actions.UPDATE), updateCourseVideoSession);




export default courseVideoRouter