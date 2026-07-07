import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../../utils/prisma";
import { customError } from "../../../utils/customError";
import {
  handleOrder,
  handlePagination,
  handleSearch,
  SortFieldMap,
} from "../../../utils/searchHelper";
import {
  categoryFilter,
  priceFilter,
  whereFilter,
} from "../services/course.service";
import { findCourses, selectedFields } from "../services/courseType.service";

export const createCourseHelper = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const obj = {
      CourseCategory:
        "use /category/get-all-categories to get all CourseCategory to use",
      courseType: "use /courseType/get-all-types to get all courseType to use",
      CourseStatus: 'one of "draft" , "published" , "archived" ',
      CourseLevel: 'one of "beginner" , "intermediate" , "advanced" ',
    };
    res.status(200).json({
      message: true,
      data: obj,
    });
  } catch (error) {
    console.log("error in createCourseHelper = ", error);
    next(error);
  }
};

export const createCourseStepOne = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, shortDescription, isFree, level, teacherId, typeId } =
      req.body;

    const levelList = ["beginner", "intermediate", "advanced"];

    if (level && !levelList.includes(level)) {
      return next(
        customError(
          "level shoul be in ['beginner' , 'intermediate' , 'advanced']",
          400,
        ),
      );
    }

    const existingType = await prisma.courseType.findFirst({
      where: {
        id: Number(typeId),
      },
    });

    if (!existingType) {
      return next(customError("typeId not found", 400));
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        id: String(teacherId),
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!existingUser) {
      return next(customError("user not found", 400));
    }

    const isTeacher = existingUser.roles.some((item) => {
      return item.role.name === "teacher";
    });

    if (!isTeacher) {
      return next(customError("this user is not teacher", 400));
    }

    const createCourse = await prisma.course.create({
      data: {
        title,
        shortDescription,
        isFree: Boolean(isFree),
        level,
        teacherId,
        typeId: Number(typeId),
      },
    });

    res.status(201).json({
      message: "create Course Step One done",
      data: createCourse,
    });
  } catch (error) {
    console.log("error in createCourseStepOne = ", error);
    next(error);
  }
};

export const createCourseStepTwo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      courseId,
      courseCategoryIdsArray,
      price,
      fullDescription,
      language,
      certificateAvailable,
      capacity,
      slug,
      duration,
      status,
    } = req.body;

    if (!courseId) {
      return next(customError("courseId is required", 400));
    }
    if (!price || typeof price !== "number" || price <= 0) {
      return next(customError("price must be a positive number", 400));
    }
    if (!capacity || typeof capacity !== "number" || capacity <= 0) {
      return next(customError("capacity must be a positive number", 400));
    }
    if (!fullDescription) {
      return next(customError("fullDescription is required", 400));
    }

    const existingCourse = await prisma.course.findFirst({
      where: { id: String(courseId) },
      include: { detail: true },
    });

    if (!existingCourse) {
      return next(customError("Course not found", 404));
    }
    if (existingCourse.detail) {
      return next(customError("This course has already passed step two", 400));
    }

    let categoryIds: number[] = [];
    if (Array.isArray(courseCategoryIdsArray)) {
      categoryIds = courseCategoryIdsArray;
    } else if (typeof courseCategoryIdsArray === "string") {
      try {
        categoryIds = JSON.parse(courseCategoryIdsArray);
      } catch {
        return next(customError("Invalid category IDs format", 400));
      }
    }

    if (categoryIds.length > 0) {
      const validCategories = await prisma.courseCategory.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true },
      });
      const validIds = validCategories.map((c) => c.id);
      const invalidIds = categoryIds.filter((id) => !validIds.includes(id));
      if (invalidIds.length > 0) {
        return next(
          customError(`Invalid category IDs: ${invalidIds.join(", ")}`, 400),
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const newPrice = await tx.coursePrice.create({
        data: {
          courseId,
          price,
          isActive: true,
        },
      });

      const categoryConnections = [];
      for (const catId of categoryIds) {
        const connection = await tx.courseCategoryList.create({
          data: {
            courseId,
            categoryId: catId,
          },
        });
        categoryConnections.push(connection);
      }

      const newDetail = await tx.courseDetail.create({
        data: {
          courseId,
          fullDescription,
          language: language || "fa",
          certificateAvailable: Boolean(certificateAvailable),
          capacity,
          slug,
          duration,
        },
      });

      const updatedCourse = await tx.course.update({
        where: { id: courseId },
        data: {
          status: status || "published",
        },
      });

      return {
        updatedCourse,
        newDetail,
        newPrice,
        categoryConnections,
      };
    });

    res.status(201).json({
      status: true,
      message: "Course step two completed successfully",
      data: {
        course: result.updatedCourse,
        detail: result.newDetail,
        price: result.newPrice,
        categories: result.categoryConnections,
      },
    });
  } catch (error) {
    console.log("error in createCourseStepTwo = ", error);
    next(error);
  }
};

export const getAllCourses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sortBy, order } = req.query as any;
    const where: any = {
      status: "published",
    };
    const andConditions: any[] = [];

    whereFilter(req, andConditions);
    priceFilter(req, andConditions);
    await categoryFilter(req, res, next, andConditions);

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const sortFieldMap: SortFieldMap = {
      title: "title",
      createdAt: "createdAt",
      totalStudent: "detail.totalStudent",
      duration: "detail.duration",
      price: "IN_MEMORY",
      discountPrice: "IN_MEMORY",
    };

    const {
      orderBy,
      sortKey,
      order: validOrder,
    } = handleOrder(sortBy, order, sortFieldMap);

    const { skip, limit } = handlePagination(req);

    const totalCount = await prisma.course.count({ where });

    const courses = await findCourses(where , orderBy , skip , limit)

    let formattedCourses = selectedFields(courses)

    if (sortKey) {
      formattedCourses = formattedCourses.sort((a: any, b: any) => {
        const valA = a[sortKey] ?? 0;
        const valB = b[sortKey] ?? 0;
        if (valA < valB) return validOrder === "asc" ? -1 : 1;
        if (valA > valB) return validOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      status: true,
      data: {
        list: formattedCourses,
        pagination: {
          totalCount,
          totalPages,
          currentPage: Math.floor(skip / limit) + 1,
          limit,
          hasNextPage: skip + limit < totalCount,
          hasPreviousPage: skip > 0,
        },
      },
    });
  } catch (error) {
    console.log("error in getAllCourses = ", error);
    next(error);
  }
};
