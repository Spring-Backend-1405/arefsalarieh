import express from "express";
import { checkAuthentication } from "../../../middlewares/authMiddleware";
import { addNewCourseType, deleteCourseType, getAllCourseTypes } from "../controllers/courseType.controller";


const courseTypeRouter = express.Router();

courseTypeRouter.post(
  "/add-new-type",
  checkAuthentication,
  addNewCourseType,
);

courseTypeRouter.get(
  "/get-all-types",
  checkAuthentication,
  getAllCourseTypes,
);

courseTypeRouter.delete(
  "/delete/:id",
  checkAuthentication,
  deleteCourseType,
);

export default courseTypeRouter;
