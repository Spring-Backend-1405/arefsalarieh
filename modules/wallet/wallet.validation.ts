import { body, query } from "express-validator";

const isValidUUID = (value: string) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

export const paymentRequestValidation = [
  body("amount")
    .isInt({ min: 1 })
    .withMessage("Amount must be a positive integer"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("callback_url")
    .isURL()
    .withMessage("Callback URL must be a valid URL"),
];

export const paymentResultValidation = [
  query("Authority")
    .isString()
    .notEmpty()
    .withMessage("Authority is required"),
  query("Status")
    .optional()
    .isIn(["OK", "NOK"])
    .withMessage("Status must be OK or NOK"),
];

export const withdrawRequestValidation = [
  body("amount")
    .isInt({ min: 1 })
    .withMessage("Amount must be a positive integer"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("sheba")
    .isString()
    .withMessage("Sheba must be a string")
    .notEmpty()
    .withMessage("Sheba is required")
    .isLength({ min: 24, max: 26 })
    .withMessage("Sheba must be between 24 and 26 characters"),
];

export const confirmWithdrawValidation = [
  body("transActionId")
    .isString()
    .withMessage("transActionId must be a string")
    .notEmpty()
    .withMessage("transActionId is required")
    .custom(isValidUUID)
    .withMessage("transActionId must be a valid UUID"),
];