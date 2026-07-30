import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../../utils/prisma";
import { customError } from "../../../utils/customError";

export const uploadCourseImages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as any;
    const userId = authReq.user.id;
    const { courseId } = req.params;

    const course = await prisma.course.findFirst({
      where: { id: String(courseId) },
    });

    if (!course) {
      return next(customError("Course not found", 404));
    }

    if (course.teacherId !== userId) {
      return next(customError("You are not the teacher of this course", 403));
    }

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return next(customError("No files uploaded", 400));
    }

    const imagesArray = req.files as Express.Multer.File[];
    const addedImages = [];

    for (let i = 0; i < imagesArray.length; i++) {
      const item = imagesArray[i];
      const isMain = i === 0;

      if (i === 0) {
        await prisma.courseImage.updateMany({
          where: { courseId: String(courseId), isMain: true },
          data: { isMain: false },
        });
      }

      const newImage = await prisma.courseImage.create({
        data: {
          courseId: String(courseId),
          filename: item.filename,
          path: `course/${item.filename}`,
          mimetype: item.mimetype,
          size: item.size,
          isMain: isMain,
        },
      });
      addedImages.push(newImage);
    }

    res.status(201).json({
      status: true,
      message: "Images uploaded successfully",
      data: addedImages,
    });
  } catch (error) {
    console.error("Error in uploadCourseImages:", error);
    next(error);
  }
};
