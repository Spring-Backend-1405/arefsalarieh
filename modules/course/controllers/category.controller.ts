import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../../utils/prisma";
import { customError } from "../../../utils/customError";
import { handleOrder, handlePagination, handleSearch } from "../../../utils/searchHelper";

export const addNewCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { categoryName, parentId } = req.body;

    const newCategory = await prisma.courseCategory.create({
      data: {
        categoryName,
        parentId,
      },
    });

    res.status(201).json({
      message: "new category added successfully",
      data: newCategory,
    });
  } catch (error) {
    console.log("error in getAllPermissions = ", error);
    next(error);
  }
};

export const getAllcategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {categoryName , sortBy, order  } = req.query as any;

    const searchWhere = handleSearch('categoryName', categoryName);

    const allowedFields = ['categoryName'];
    const orderBy = handleOrder(sortBy, order, allowedFields);


    const { skip, limit } = handlePagination(req);

    const totalCount = await prisma.courseCategory.count({
      where: searchWhere,
    });

    const list = await prisma.courseCategory.findMany({
      where: searchWhere,
      orderBy,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      status: true,
      data: {
        list,
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
    console.log("error in getAllUsers = ", error);
    next(error);
  }
};
