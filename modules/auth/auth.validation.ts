import { body } from "express-validator";

export const registerValidation = [
  body("email")
    .isEmail()
    .withMessage("email isnt valid")
    .normalizeEmail()
    .isLength({ min: 6, max: 40 })
    .withMessage("email must be 6 to 40 character"),

  body("password")
    .isLength({ min: 6, max: 40 })
    .withMessage("password must be 6 to 40 character"),
];
