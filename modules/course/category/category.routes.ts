import express from "express";
import {
  addNewCategory,
  deleteCategory,
  getAllCategories,
  getcategoryDetail,
} from "./category.controller";
import { checkAuthentication, requirePermission } from "../../../middlewares/authMiddleware";
import { validateMiddleware } from "../../../middlewares/validateMiddleware";
import {
  addCategoryValidation,
  getAllCategoriesValidation,
  getCategoryDetailValidation,
  deleteCategoryValidation,
} from "./category.validation";
import { Actions, Resources } from "../../../constants/permissions";

const categoryRouter = express.Router();

categoryRouter.post(
  "/add-new-category",
  checkAuthentication,
  requirePermission(Resources.CATEGPRY, Actions.CREATE),
  addCategoryValidation,
  validateMiddleware,
  addNewCategory,
);

categoryRouter.get(
  "/get-all-categories",
  getAllCategoriesValidation,
  validateMiddleware,
  getAllCategories,
);

categoryRouter.get(
  "/detail/:id",
  checkAuthentication,
  requirePermission(Resources.CATEGPRY, Actions.READ),
  getCategoryDetailValidation,
  validateMiddleware,
  getcategoryDetail,
);

categoryRouter.delete(
  "/delete/:id",
  checkAuthentication,
  requirePermission(Resources.CATEGPRY, Actions.DELETE),
  deleteCategoryValidation,
  validateMiddleware,
  deleteCategory,
);

export default categoryRouter;