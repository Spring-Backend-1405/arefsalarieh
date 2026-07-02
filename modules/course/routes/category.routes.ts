import express from "express";
import { addNewCategory, getAllcategories } from "../controllers/category.controller";
import { checkAuthentication } from "../../../middlewares/authMiddleware";


const categoryRouter = express.Router();

categoryRouter.post(
  "/add-new-category",
  checkAuthentication,
  addNewCategory,
);

categoryRouter.get(
  "/get-all-categories",
  checkAuthentication,
  getAllcategories,
);

export default categoryRouter;
