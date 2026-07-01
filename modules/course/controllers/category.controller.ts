import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../../utils/prisma";
import { customError } from "../../../utils/customError";

export const addNewCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {categoryName , parentId} = req.body

    const newCategory = await prisma.courseCategory.create({
        data : {
            categoryName,
            parentId
        }
    })

    res.status(201).json({
        message : 'new category added successfully',
        data : newCategory
    })
  } catch (error) {
    console.log("error in getAllPermissions = ", error);
    next(error);
  }
};