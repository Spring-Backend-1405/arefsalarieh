import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../../utils/prisma";
import { customError } from "../../../utils/customError";

export const addCourseComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as any;
    const { id: userId } = authReq.user;
    const { courseId, parentId, text } = req.body;

    const existingCourse = await prisma.course.findFirst({
      where: { id: String(courseId) },
    });

    if (!existingCourse) {
      return next(customError("course not found", 404));
    }

    if (parentId) {
      const existingComment = await prisma.courseComment.findFirst({
        where: { id: String(parentId) },
      });

      if (!existingComment) {
        return next(customError("comment with this parentId not found", 404));
      }
    }

    const newComment = await prisma.courseComment.create({
        data : {
            userId : String(userId),
            courseId : String(courseId),
            parentId : parentId ? String(parentId) : null,
            text,
            isConfirm : false,
            isReject : false
        }
    })

    res.json({
      message: "cmment added successfully",
      data: newComment,
    });
  } catch (error) {
    console.log("error in addCourseComment = ", error);
    next(error);
  }
};
