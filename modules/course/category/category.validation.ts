import { body, param, query } from "express-validator";

export const addCategoryValidation = [
  body("categoryName")
    .isString()
    .withMessage("categoryName must be a string")
    .notEmpty()
    .withMessage("categoryName is required"),
  body("parentId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("parentId must be a positive integer"),
];

export const getAllCategoriesValidation = [
  query("categoryName")
    .optional()
    .isString()
    .withMessage("categoryName must be a string"),
  query("sortBy")
    .optional()
    .isString()
    .withMessage("sortBy must be a string"),
  query("order")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("order must be asc or desc"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("limit must be a positive integer"),
];

export const getCategoryDetailValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("id must be a positive integer"),
];

export const deleteCategoryValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("id must be a positive integer"),
];