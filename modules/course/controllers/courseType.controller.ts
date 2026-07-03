import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../../utils/prisma";
import { customError } from "../../../utils/customError";

export const addNewCourseType = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { typeName } = req.body;

    const existingType = await prisma.courseType.findFirst({
      where: {
        typeName,
      },
    });

    if (existingType) {
      return next(customError("this type already exist", 400));
    }

    const newCourseType = await prisma.courseType.create({
      data: {
        typeName,
      },
    });

    res.status(201).json({
      message: "new category added successfully",
      data: newCourseType,
    });
  } catch (error) {
    console.log("error in getAllPermissions = ", error);
    next(error);
  }
};
