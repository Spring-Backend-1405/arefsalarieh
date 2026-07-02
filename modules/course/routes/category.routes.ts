import express from "express";
import { addNewCategory, deleteCategory, getAllCategories } from "../controllers/category.controller";
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
  getAllCategories,
);

categoryRouter.delete(
  "/delete/:id",
  checkAuthentication,
  deleteCategory,
);

export default categoryRouter;
