import { body, param } from "express-validator";

const isValidUUID = (value: string) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

export const addPermissionValidation = [
  body("resource")
    .isString()
    .withMessage("resource must be a string")
    .notEmpty()
    .withMessage("resource is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("resource must be between 2 and 50 characters"),
  body("action")
    .isString()
    .withMessage("action must be a string")
    .notEmpty()
    .withMessage("action is required")
    .isIn(["CREATE", "READ", "UPDATE", "DELETE", "MANAGE"])
    .withMessage("action must be one of: CREATE, READ, UPDATE, DELETE, MANAGE"),
  body("description")
    .optional()
    .isString()
    .withMessage("description must be a string")
    .isLength({ max: 255 })
    .withMessage("description must be at most 255 characters"),
];

export const deletePermissionValidation = [
  param("permissionId")
    .isString()
    .withMessage("permissionId must be a string")
    .notEmpty()
    .withMessage("permissionId is required")
    .custom(isValidUUID)
    .withMessage("permissionId must be a valid UUID"),
];