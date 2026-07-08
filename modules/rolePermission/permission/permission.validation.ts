import { body, param } from "express-validator";
import { Resources, Actions } from "../../../constants/permissions";

const isValidUUID = (value: string) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

const validResources = Object.values(Resources);
const validActions = Object.values(Actions);

export const addPermissionValidation = [
  body("resource")
    .isString()
    .withMessage("resource must be a string")
    .notEmpty()
    .withMessage("resource is required")
    .isIn(validResources)
    .withMessage(`resource must be one of: ${validResources.join(", ")}`),
  body("action")
    .isString()
    .withMessage("action must be a string")
    .notEmpty()
    .withMessage("action is required")
    .isIn(validActions)
    .withMessage(`action must be one of: ${validActions.join(", ")}`),
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