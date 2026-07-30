import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../utils/prisma";
import { customError } from "../../utils/customError";

export const whereFilter = (req: Request, andConditions: any[]) => {
  const { search, typeId, level } = req.query;

  if (search && typeof search === "string") {
    andConditions.push({
      title: { contains: search },
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
};

export const priceFilter = (req: Request, andConditions: any[]) => {
  const { minPrice, maxPrice } = req.query;

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
};

export const categoryFilter = async (
  req: Request,
  res: Response,
  next: NextFunction,
  andConditions: any[],
): Promise<any> => {
  const { courseCategoryIdsArray, count } = req.query;

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
};

export const findCourses = async (
  where: any,
  orderBy: any,
  skip: any,
  limit: any,
): Promise<any> => {
  return await prisma.course.findMany({
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
      courseLikes: true,
      courseDisLikes: true,
    },
    skip,
    take: limit,
  });
};

export const selectedFields = (courses: any, userId?: string) => {
  return courses.map((course: any) => ({
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
        files : course.files || [],
    likesCount: course.courseLikes && course.courseLikes.length,
    isLiked:
      userId &&
      course.courseLikes &&
      course.courseLikes.length > 0 &&
      course.courseLikes.some((item: any) => item.userId === userId)
        ? true
        : false,

    disLikesCount: course.courseDisLikes && course.courseDisLikes.length,
    isDisLiked:
      userId &&
      course.courseDisLikes &&
      course.courseDisLikes.length > 0 &&
      course.courseDisLikes.some((item: any) => item.userId === userId)
        ? true
        : false,
  }));
};


export const findCourseDetail = async (courseId : string) : Promise<any> =>{
  return await prisma.course.findFirst({
      where: {
        id: String(courseId),
      },
      include: {
        coursePrices: {
          where: { isActive: true },
        },
        detail: true,
        teacher: {
          select: {
            id: true,
            name: true,
            userPictures: { where: { isMain: true } },
          },
        },
        courseType: true,
        courseCategoryLists: {
          select: {
            category: true,
          },
        },
        courseLikes: true,
        courseDisLikes: true,
      },
    });
}


export const handleCorseDetailResponse = (existingCourse : any , userId : string) =>{
    const likeCount =
      existingCourse.courseLikes && existingCourse.courseLikes.length;
    const isLiked =
      existingCourse.courseLikes &&
      existingCourse.courseLikes.some((item: any) => item.userId === userId);
    const disLikeCount =
      existingCourse.courseDisLikes && existingCourse.courseDisLikes.length;
    const isDisLiked =
      existingCourse.courseDisLikes &&
      existingCourse.courseDisLikes.some((item: any) => item.userId === userId);

    const { courseLikes, courseDisLikes, ...corseForResponse } = {
      ...existingCourse,
      likeCount,
      isLiked,
      disLikeCount,
      isDisLiked,
    };

    return corseForResponse
}