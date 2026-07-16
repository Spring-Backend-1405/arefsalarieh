import express from "express";
import { checkAuthentication } from "../../../middlewares/authMiddleware";
import { uploadCourseVideo } from "./courseVideos.controller";


const courseVideoRouter = express.Router();

courseVideoRouter.use(
  "/upload",
  checkAuthentication,
  uploadCourseVideo

);

export default courseVideoRouter