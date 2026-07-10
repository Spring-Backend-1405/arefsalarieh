import { body, param } from "express-validator";

const isValidUUID = (value: string) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

export const addCourseCommentValidation = [
  body("courseId")
    .isString()
    .withMessage("courseId must be a string")
    .notEmpty()
    .withMessage("courseId is required")
    .custom(isValidUUID)
    .withMessage("courseId must be a valid UUID"),
  body("parentId")
    .optional()
    .isString()
    .withMessage("parentId must be a string")
    .custom(isValidUUID)
    .withMessage("parentId must be a valid UUID"),
  body("text")
    .isString()
    .withMessage("text must be a string")
    .notEmpty()
    .withMessage("text is required")
    .isLength({ max: 2000 })
    .withMessage("text cannot exceed 2000 characters"),
];

export const getCourseCommentsValidation = [
  param("courseId")
    .isString()
    .withMessage("courseId must be a string")
    .notEmpty()
    .withMessage("courseId is required")
    .custom(isValidUUID)
    .withMessage("courseId must be a valid UUID"),
];

export const getCommentRepliesValidation = [
  param("commentId")
    .isString()
    .withMessage("commentId must be a string")
    .notEmpty()
    .withMessage("commentId is required")
    .custom(isValidUUID)
    .withMessage("commentId must be a valid UUID"),
];

export const updateCommentTextValidation = [
  body("commentId")
    .isString()
    .withMessage("commentId must be a string")
    .notEmpty()
    .withMessage("commentId is required")
    .custom(isValidUUID)
    .withMessage("commentId must be a valid UUID"),
  body("text")
    .isString()
    .withMessage("text must be a string")
    .notEmpty()
    .withMessage("text is required")
    .isLength({ max: 2000 })
    .withMessage("text cannot exceed 2000 characters"),
];

export const deleteCourseCommentValidation = [
  param("commentId")
    .isString()
    .withMessage("commentId must be a string")
    .notEmpty()
    .withMessage("commentId is required")
    .custom(isValidUUID)
    .withMessage("commentId must be a valid UUID"),
];

export const getCourseCommentsWithPermissionValidation = getCourseCommentsValidation;

export const getCommentRepliesWithPermissionValidation = getCommentRepliesValidation;

export const confirmCourseCommentWithPermissionValidation = [
  param("commentId")
    .isString()
    .withMessage("commentId must be a string")
    .notEmpty()
    .withMessage("commentId is required")
    .custom(isValidUUID)
    .withMessage("commentId must be a valid UUID"),
];

export const rejectCourseCommentWithPermissionValidation = confirmCourseCommentWithPermissionValidation;