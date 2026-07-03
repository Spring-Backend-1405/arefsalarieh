import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../../utils/prisma";
import { customError } from "../../../utils/customError";
import { handleOrder, handlePagination, handleSearch } from "../../../utils/searchHelper";

export const createCourseHelper = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const obj = {
        CourseCategory : 'use /category/get-all-categories to get all CourseCategory to use',
        courseType : 'use /courseType/get-all-types to get all courseType to use',
        CourseStatus : 'one of "draft" , "published" , "archived" '
    }
    res.status(201).json({
      message: "new category added successfully",
      data: obj,
    });
  } catch (error) {
    console.log("error in getAllPermissions = ", error);
    next(error);
  }
};

