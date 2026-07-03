import express from "express";
import { checkAuthentication } from "../../../middlewares/authMiddleware";
import { addNewCourseType } from "../controllers/courseType.controller";


const courseTypeRouter = express.Router();

courseTypeRouter.post(
  "/add-new-type",
  checkAuthentication,
  addNewCourseType,
);



export default courseTypeRouter;
