import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../../utils/prisma";
import { customError } from "../../../utils/customError";
import {
  handleOrder,
  handlePagination,
  handleSearch,
} from "../../../utils/searchHelper";

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
    const {
      search,
      typeId,
      level,
      minPrice,
      maxPrice,
      courseCategoryIdsArray,
      count,
    } = req.query;

    const where: any = {
      status: "published",
    };
    const andConditions: any[] = [];

    if (search && typeof search === "string") {
      andConditions.push({
        title: { contains: search, mode: "insensitive" },
      });
    }

    if (typeId) {
      andConditions.push({
        typeId: Number(typeId),
      });
    }

    if (level) {
      andConditions.push({
        level: level,
      });
    }

    if (minPrice || maxPrice) {
      const priceFilter: any = {};
      if (minPrice) priceFilter.gte = Number(minPrice);
      if (maxPrice) priceFilter.lte = Number(maxPrice);
      andConditions.push({
        coursePrices: {
          some: {
            isActive: true,
            price: priceFilter,
          },
        },
      });
    }

    if (courseCategoryIdsArray) {
      let categoryIds: number[] = [];

      if (Array.isArray(courseCategoryIdsArray)) {
        categoryIds = (courseCategoryIdsArray as string[]).map(Number);
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

        const minCount = count ? Number(count) : 1;

        const grouped = await prisma.courseCategoryList.groupBy({
          by: ["courseId"],
          where: {
            categoryId: { in: categoryIds },
          },
          _count: {
            categoryId: true,
          },
          having: {
            categoryId: {
              _count: {
                gte: minCount,
              },
            },
          },
        });

        const matchedCourseIds = grouped.map((g) => g.courseId);

        if (matchedCourseIds.length === 0) {
          return res.status(200).json({
            status: true,
            data: [],
          });
        }

        andConditions.push({
          id: { in: matchedCourseIds },
        });
      }
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const courses = await prisma.course.findMany({
      where,
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
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        courseType: {
          select: {
            id: true,
            typeName: true,
          },
        },
        coursePrices: {
          where: { isActive: true },
          take: 1,
          select: {
            price: true,
            discountPrice: true,
          },
        },
        courseCategoryLists: {
          select: {
            category: {
              select: {
                id: true,
                categoryName: true,
                parentId: true,
              },
            },
          },
        },
        detail: {
          select: {
            totalStudent: true,
            duration: true,
          },
        },
      },
    });

    const formattedCourses = courses.map((course: any) => ({
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

    res.status(200).json({
      status: true,
      data: formattedCourses,
    });
  } catch (error) {
    console.log("error in getAllCourses = ", error);
    next(error);
  }
};