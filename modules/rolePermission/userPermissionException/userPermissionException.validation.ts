import { body, param } from "express-validator";

const isValidUUID = (value: string) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

export const getUserPermissionsValidation = [
  param("userId")
    .isString()
    .withMessage("userId must be a string")
    .notEmpty()
    .withMessage("userId is required")
    .custom(isValidUUID)
    .withMessage("userId must be a valid UUID"),
];

export const addPermissionToUserValidation = [
  body("userId")
    .isString()
    .withMessage("userId must be a string")
    .notEmpty()
    .withMessage("userId is required")
    .custom(isValidUUID)
    .withMessage("userId must be a valid UUID"),
  body("permissionId")
    .isString()
    .withMessage("permissionId must be a string")
    .notEmpty()
    .withMessage("permissionId is required")
    .custom(isValidUUID)
    .withMessage("permissionId must be a valid UUID"),
];

export const deletePermissionFromUserValidation = addPermissionToUserValidation;
export const denyPermissionToUserValidation = addPermissionToUserValidation;
export const deleteDenyPermissionFromUserValidation = addPermissionToUserValidation;