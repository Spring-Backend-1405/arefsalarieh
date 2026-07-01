import express from "express";
import { addNewCategory } from "../controllers/category.controller";
import { checkAuthentication } from "../../../middlewares/authMiddleware";


const categoryRouter = express.Router();

categoryRouter.post(
  "/add-new-category",
  checkAuthentication,
  addNewCategory,
);

export default categoryRouter;
