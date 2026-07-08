import express from "express";
import {
  addNewCategory,
  deleteCategory,
  getAllCategories,
  getcategoryDetail,
} from "./category.controller";
import { checkAuthentication } from "../../../middlewares/authMiddleware";
import { validateMiddleware } from "../../../middlewares/validateMiddleware";
import {
  addCategoryValidation,
  getAllCategoriesValidation,
  getCategoryDetailValidation,
  deleteCategoryValidation,
} from "./category.validation";

const categoryRouter = express.Router();

categoryRouter.post(
  "/add-new-category",
  checkAuthentication,
  addCategoryValidation,
  validateMiddleware,
  addNewCategory,
);

categoryRouter.get(
  "/get-all-categories",
  checkAuthentication,
  getAllCategoriesValidation,
  validateMiddleware,
  getAllCategories,
);

categoryRouter.get(
  "/detail/:id",
  checkAuthentication,
  getCategoryDetailValidation,
  validateMiddleware,
  getcategoryDetail,
);

categoryRouter.delete(
  "/delete/:id",
  checkAuthentication,
  deleteCategoryValidation,
  validateMiddleware,
  deleteCategory,
);

export default categoryRouter;