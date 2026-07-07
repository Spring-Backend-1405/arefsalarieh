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

  body("name")
    .isString()
    .withMessage("name must be a string")
    .isLength({ min: 2, max: 40 })
    .withMessage("name must be between 2 and 40 characters"),
];

export const verifyEmailValidation = [
  body("email")
    .isEmail()
    .withMessage("email isnt valid")
    .normalizeEmail()
    .isLength({ min: 6, max: 40 })
    .withMessage("email must be 6 to 40 character"),


  body("code")
    .isString()
    .withMessage("name must be a string")
    .isLength({ min: 6, max: 6 })
    .withMessage("name must be 6 characters"),
];

export const verifySendVerificationTokenAgain = [
  body("email")
    .isEmail()
    .withMessage("email isnt valid")
    .normalizeEmail()
    .isLength({ min: 6, max: 40 })
    .withMessage("email must be 6 to 40 character"),
];

export const loginValidation = [
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


export const loginStepTwoValidation = [
  body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("token").isString().isLength({ min: 6, max: 6 }).withMessage("Token must be 6 characters"),
];

export const forgotPasswordValidation = [
  body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
  body("route").isString().withMessage("Route is required"),
];

export const resetPasswordValidation = [
  body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
  body("token").isString().withMessage("Token is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

export const passwordValidation = [
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

export const qrCodeValidation = [
  body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("code").isString().isLength({ min: 6 }).withMessage("Code is required"),
];