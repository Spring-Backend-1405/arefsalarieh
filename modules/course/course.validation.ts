import { body, param, query } from "express-validator";

const isValidUUID = (value: string) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

export const getAllCoursesValidation = [
  query("search").optional().isString().withMessage("search must be a string"),
  query("typeId").optional().isInt({ min: 1 }).withMessage("typeId must be a positive integer"),
  query("level")
    .optional()
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("level must be beginner, intermediate, or advanced"),
  query("minPrice").optional().isInt({ min: 0 }).withMessage("minPrice must be a positive integer"),
  query("maxPrice").optional().isInt({ min: 0 }).withMessage("maxPrice must be a positive integer"),
  query("sortBy")
    .optional()
    .isIn(["title", "createdAt", "totalStudent", "duration", "price", "discountPrice"])
    .withMessage("sortBy must be title, createdAt, totalStudent, duration, price, or discountPrice"),
  query("order").optional().isIn(["asc", "desc"]).withMessage("order must be asc or desc"),
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit").optional().isInt({ min: 1 }).withMessage("limit must be a positive integer"),
  query("courseCategoryIdsArray")
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) {
        return value.every((v) => Number.isInteger(v) && v > 0);
      }
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) && parsed.every((v) => Number.isInteger(v) && v > 0);
        } catch {
          return false;
        }
      }
      return false;
    })
    .withMessage("courseCategoryIdsArray must be an array of positive integers or a valid JSON string"),
  query("count").optional().isInt({ min: 1 }).withMessage("count must be a positive integer"),
];

export const getCourseDetailValidation = [
  param("courseId")
    .isString()
    .withMessage("courseId must be a string")
    .custom(isValidUUID)
    .withMessage("courseId must be a valid UUID"),
];

export const createCourseStepOneValidation = [
  body("title")
    .isString()
    .withMessage("title must be a string")
    .notEmpty()
    .withMessage("title is required"),
  body("shortDescription")
    .isString()
    .withMessage("shortDescription must be a string")
    .notEmpty()
    .withMessage("shortDescription is required"),
  body("isFree")
    .optional()
    .isBoolean()
    .withMessage("isFree must be a boolean"),
  body("level")
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("level must be beginner, intermediate, or advanced"),
  body("teacherId")
    .isString()
    .withMessage("teacherId must be a string")
    .notEmpty()
    .withMessage("teacherId is required")
    .custom(isValidUUID)
    .withMessage("teacherId must be a valid UUID"),
  body("typeId")
    .isInt({ min: 1 })
    .withMessage("typeId must be a positive integer"),
];

export const createCourseStepTwoValidation = [
  body("courseId")
    .isString()
    .withMessage("courseId must be a string")
    .notEmpty()
    .withMessage("courseId is required")
    .custom(isValidUUID)
    .withMessage("courseId must be a valid UUID"),
  body("courseCategoryIdsArray")
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) {
        return value.every((v) => Number.isInteger(v) && v > 0);
      }
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) && parsed.every((v) => Number.isInteger(v) && v > 0);
        } catch {
          return false;
        }
      }
      return false;
    })
    .withMessage("courseCategoryIdsArray must be an array of positive integers or a valid JSON string"),
  body("price")
    .isInt({ min: 1 })
    .withMessage("price must be a positive integer"),
  body("fullDescription")
    .isString()
    .withMessage("fullDescription must be a string")
    .notEmpty()
    .withMessage("fullDescription is required"),
  body("language")
    .optional()
    .isString()
    .withMessage("language must be a string"),
  body("certificateAvailable")
    .optional()
    .isBoolean()
    .withMessage("certificateAvailable must be a boolean"),
  body("capacity")
    .isInt({ min: 1 })
    .withMessage("capacity must be a positive integer"),
  body("slug")
    .optional()
    .isString()
    .withMessage("slug must be a string"),
  body("duration")
    .optional()
    .isString()
    .withMessage("duration must be a string"),
  body("status")
    .optional()
    .isIn(["draft", "published", "archived"])
    .withMessage("status must be draft, published, or archived"),
];

export const updateCourseValidation = [
  body("courseId")
    .isString()
    .withMessage("courseId must be a string")
    .notEmpty()
    .withMessage("courseId is required")
    .custom(isValidUUID)
    .withMessage("courseId must be a valid UUID"),
  body("title")
    .optional()
    .isString()
    .withMessage("title must be a string"),
  body("shortDescription")
    .optional()
    .isString()
    .withMessage("shortDescription must be a string"),
  body("isFree")
    .optional()
    .isBoolean()
    .withMessage("isFree must be a boolean"),
  body("level")
    .optional()
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("level must be beginner, intermediate, or advanced"),
  body("teacherId")
    .optional()
    .isString()
    .withMessage("teacherId must be a string")
    .custom(isValidUUID)
    .withMessage("teacherId must be a valid UUID"),
  body("typeId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("typeId must be a positive integer"),
  body("courseCategoryIdsArray")
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) {
        return value.every((v) => Number.isInteger(v) && v > 0);
      }
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) && parsed.every((v) => Number.isInteger(v) && v > 0);
        } catch {
          return false;
        }
      }
      return false;
    })
    .withMessage("courseCategoryIdsArray must be an array of positive integers or a valid JSON string"),
  body("price")
    .optional()
    .isInt({ min: 1 })
    .withMessage("price must be a positive integer"),
  body("fullDescription")
    .optional()
    .isString()
    .withMessage("fullDescription must be a string"),
  body("language")
    .optional()
    .isString()
    .withMessage("language must be a string"),
  body("certificateAvailable")
    .optional()
    .isBoolean()
    .withMessage("certificateAvailable must be a boolean"),
  body("capacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("capacity must be a positive integer"),
  body("slug")
    .optional()
    .isString()
    .withMessage("slug must be a string"),
  body("duration")
    .optional()
    .isString()
    .withMessage("duration must be a string"),
  body("status")
    .optional()
    .isIn(["draft", "published", "archived"])
    .withMessage("status must be draft, published, or archived"),
];