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

    const { courseId } = req.params;

    const existingLike = await prisma.courseLike.findFirst({
      where: {
        AND: [{ courseId: String(courseId) }, { userId: id }],
      },
    });

    if (existingLike) {
      return customError("you already liked this course", 400);
    }

    const existingDisLike = await prisma.courseDisLike.findFirst({
      where: {
        AND: [{ courseId: String(courseId) }, { userId: id }],
      },
    });

    if (existingDisLike) {
      await prisma.courseDisLike.delete({
        where: {
          courseId_userId: {
            courseId: String(courseId),
            userId: id,
          },
        },
      });
    }

    const addCourseLike = await prisma.courseLike.create({
      data: {
        courseId: String(courseId),
        userId: id,
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

export const deleteCourseLike = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as any;
    const { id } = authReq.user;
    const { courseId } = req.params;

    const existingLike = await prisma.courseLike.findUnique({
      where: {
        courseId_userId: {
          courseId: String(courseId),
          userId: id,
        },
      },
    });

    if (!existingLike) {
      return next(customError("You haven't liked this course yet", 404));
    }

    const deletedLike = await prisma.courseLike.delete({
      where: {
        courseId_userId: {
          courseId: String(courseId),
          userId: id,
        },
      },
    });

    res.status(200).json({
      status: true,
      message: "Like removed successfully",
      data: deletedLike,
    });
  } catch (error) {
    console.log("error in deleteCourseLike = ", error);
    next(error);
  }
};

export const disLikeCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as any;
    const { id } = authReq.user;

    const { courseId } = req.params;

    const existingDisLike = await prisma.courseDisLike.findFirst({
      where: {
        AND: [{ courseId: String(courseId) }, { userId: id }],
      },
    });

    if (existingDisLike) {
      return customError("you already disLiked this course", 400);
    }

    const existingLike = await prisma.courseLike.findFirst({
      where: {
        AND: [{ courseId: String(courseId) }, { userId: id }],
      },
    });

    if (existingLike) {
      await prisma.courseLike.delete({
        where: {
          courseId_userId: {
            courseId: String(courseId),
            userId: id,
          },
        },
      });
    }

    const addCourseDisLike = await prisma.courseDisLike.create({
      data: {
        courseId: String(courseId),
        userId: id,
      },
    });

    res.status(201).json({
      message: true,
      data: addCourseDisLike,
    });
  } catch (error) {
    console.log("error in likeCourse = ", error);
    next(error);
  }
};

export const deleteCourseDisLike = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as any;
    const { id } = authReq.user;
    const { courseId } = req.params;

    const existingDisLike = await prisma.courseDisLike.findUnique({
      where: {
        courseId_userId: {
          courseId: String(courseId),
          userId: id,
        },
      },
    });

    if (!existingDisLike) {
      return next(customError("You haven't disliked this course yet", 404));
    }

    const deletedDisLike = await prisma.courseDisLike.delete({
      where: {
        courseId_userId: {
          courseId: String(courseId),
          userId: id,
        },
      },
    });

    res.status(200).json({
      status: true,
      message: "disLike removed successfully",
      data: deletedDisLike,
    });
  } catch (error) {
    console.log("error in deleteCourseLike = ", error);
    next(error);
  }
};