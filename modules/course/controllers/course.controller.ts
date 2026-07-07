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

    const { orderBy, sortKey, order: validOrder } = handleOrder(
      sortBy,
      order,
      sortFieldMap,
    );

    const courses = await prisma.course.findMany({
      where,
      orderBy: Object.keys(orderBy).length > 0 ? orderBy : undefined,
      select: {
        id: true,
        title: true,
        shortDescription: true,
        level: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        isFree: true,
        teacher: {
          select: { id: true, name: true, email: true },
        },
        courseType: {
          select: { id: true, typeName: true },
        },
        coursePrices: {
          where: { isActive: true },
          take: 1,
          select: { price: true, discountPrice: true },
        },
        courseCategoryLists: {
          select: {
            category: {
              select: { id: true, categoryName: true, parentId: true },
            },
          },
        },
        detail: {
          select: { totalStudent: true, duration: true },
        },
      },
    });

    let formattedCourses = courses.map((course: any) => ({
      id: course.id,
      title: course.title,
      shortDescription: course.shortDescription,
      level: course.level,
      status: course.status,
      createdAt: course.createdAt,
      isFree: course.isFree,
      teacher: course.teacher
        ? {
            id: course.teacher.id,
            name: course.teacher.name,
            avatar: course.teacher.profile?.avatar || null,
          }
        : null,
      type: course.courseType?.typeName || null,
      price: course.coursePrices[0]?.price || 0,
      discountPrice: course.coursePrices[0]?.discountPrice || null,
      categories: course.courseCategoryLists.map((item: any) => item.category),
      totalStudent: course.detail?.totalStudent || 0,
      duration: course.detail?.duration || null,
    }));

    if (sortKey) {
      formattedCourses = formattedCourses.sort((a: any, b: any) => {
        const valA = a[sortKey] ?? 0;
        const valB = b[sortKey] ?? 0;
        if (valA < valB) return validOrder === "asc" ? -1 : 1;
        if (valA > valB) return validOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    res.status(200).json({
      status: true,
      data: formattedCourses,
    });
  } catch (error) {
    console.log("error in getAllCourses = ", error);
    next(error);
  }
};
