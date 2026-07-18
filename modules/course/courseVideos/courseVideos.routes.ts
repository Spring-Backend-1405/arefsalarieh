import express from "express";
import { checkAuthentication } from "../../../middlewares/authMiddleware";
import { getStreamCourseVideo, uploadCourseVideo } from "./courseVideos.controller";


const courseVideoRouter = express.Router();

courseVideoRouter.use(
  "/upload",
  checkAuthentication,
  uploadCourseVideo
);

courseVideoRouter.get("/stream/:fileId", getStreamCourseVideo);


export default courseVideoRouter