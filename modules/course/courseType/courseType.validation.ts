import { body, param } from "express-validator";

export const addCourseTypeValidation = [
  body("typeName")
    .isString()
    .withMessage("typeName must be a string")
    .notEmpty()
    .withMessage("typeName is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("typeName must be between 2 and 50 characters"),
];

export const deleteCourseTypeValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("id must be a positive integer"),
];