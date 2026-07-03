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

export const getAllCourseTypes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const courseTypesList = await prisma.courseType.findMany()

    res.json({
        message : true,
        data : courseTypesList
    })
  } catch (error) {
    console.log("error in getAllUsers = ", error);
    next(error);
  }
};

export const deleteCourseType = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {id} = req.params

    const deletedCourseType = await prisma.courseType.delete({
        where :{id : Number(id)}
    })

    res.json({
        message : true,
        data : deletedCourseType
    })
  } catch (error) {
    console.log("error in getAllUsers = ", error);
    next(error);
  }
};