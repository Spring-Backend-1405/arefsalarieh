import { body } from "express-validator";

export const updateProfileValidation = [
  body("email")
    .optional()
    .isEmail()
    .withMessage("Email must be a valid email address")
    .normalizeEmail()
    .isLength({ min: 6, max: 40 })
    .withMessage("Email must be between 6 and 40 characters"),

  body("gender")
    .optional()
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("Gender must be one of: MALE, FEMALE, OTHER"),

  body("phone")
    .optional()
    .isString()
    .withMessage("Phone must be a string")
    .isLength({ max: 20 })
    .withMessage("Phone must be at most 20 characters"),

  body("country")
    .optional()
    .isString()
    .withMessage("Country must be a string")
    .isLength({ max: 100 })
    .withMessage("Country must be at most 100 characters"),

  body("state")
    .optional()
    .isString()
    .withMessage("State must be a string")
    .isLength({ max: 100 })
    .withMessage("State must be at most 100 characters"),

  body("city")
    .optional()
    .isString()
    .withMessage("City must be a string")
    .isLength({ max: 100 })
    .withMessage("City must be at most 100 characters"),

  body("address")
    .optional()
    .isString()
    .withMessage("Address must be a string")
    .isLength({ max: 255 })
    .withMessage("Address must be at most 255 characters"),

  body("avatar")
    .optional()
    .isString()
    .withMessage("Avatar must be a string (URL or path)")
    .isLength({ max: 255 })
    .withMessage("Avatar must be at most 255 characters"),

  body("bio")
    .optional()
    .isString()
    .withMessage("Bio must be a string")
    .isLength({ max: 500 })
    .withMessage("Bio must be at most 500 characters"),
];