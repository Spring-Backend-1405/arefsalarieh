import { body } from "express-validator";

const isValidUUID = (value: string) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

export const addRoleToUserValidation = [
  body("userId")
    .isString()
    .withMessage("userId must be a string")
    .notEmpty()
    .withMessage("userId is required")
    .custom(isValidUUID)
    .withMessage("userId must be a valid UUID"),
  body("roleId")
    .isString()
    .withMessage("roleId must be a string")
    .notEmpty()
    .withMessage("roleId is required")
    .custom(isValidUUID)
    .withMessage("roleId must be a valid UUID"),
];