import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../../utils/prisma";
import { customError } from "../../../utils/customError";

export const likeCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as any;
    const { id } = authReq.user;

    const { courseId } = req.body;

    const existingLike = await prisma.courseLike.findFirst({
      where: {
        AND: [{ courseId }, { userId : id }],
      },
    });

    if (existingLike) {
      return customError("you already liked this course", 400);
    }

    const addCourseLike = await prisma.courseLike.create({
      data: {
        courseId,
        userId : id,
      },
    });

    res.status(201).json({
      message: true,
      data: addCourseLike,
    });
  } catch (error) {
    console.log("error in likeCourse = ", error);
    next(error);
  }
};
