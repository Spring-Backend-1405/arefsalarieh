import { body, param, query } from "express-validator";

const isValidUUID = (value: string) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

export const updateProfileValidation = [
  body("email")
    .optional()
    .isEmail()
    .withMessage("Email must be a valid email address")
    .normalizeEmail()
    .isLength({ min: 6, max: 40 })
    .withMessage("Email must be between 6 and 40 characters"),
  body("name")
    .isString()
    .withMessage("name must be a string")
    .isLength({ min: 2, max: 40 })
    .withMessage("name must be between 2 and 40 characters"),
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

export const getAllUsersValidation = [
  query("search").optional().isString().withMessage("search must be a string"),
  query("name").optional().isString().withMessage("name must be a string"),
  query("email").optional().isString().withMessage("email must be a string"),
  query("gender")
    .optional()
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("gender must be MALE, FEMALE, or OTHER"),
  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  query("isDelete")
    .optional()
    .isBoolean()
    .withMessage("isDelete must be a boolean"),
  query("country").optional().isString().withMessage("country must be a string"),
  query("state").optional().isString().withMessage("state must be a string"),
  query("city").optional().isString().withMessage("city must be a string"),
  query("sortBy")
    .optional()
    .isIn(["name", "email", "gender", "createdAt", "isActive"])
    .withMessage("sortBy must be one of: name, email, gender, createdAt, isActive"),
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

export const imageIdValidation = [
  param("imageId")
    .isString()
    .withMessage("imageId must be a string")
    .notEmpty()
    .withMessage("imageId is required")
    .custom(isValidUUID)
    .withMessage("imageId must be a valid UUID"),
];