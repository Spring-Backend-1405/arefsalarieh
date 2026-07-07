import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../../utils/prisma";
import { customError } from "../../../utils/customError";

export const whereFilter = (req: Request, andConditions: any[]) => {
  const {
    search,
    typeId,
    level,
  } = req.query;

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

export const categoryFilter =async (req: Request, res : Response , next : NextFunction , andConditions: any[]) : Promise<any> => {
  const {
    courseCategoryIdsArray,
    count,
  } = req.query;

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
