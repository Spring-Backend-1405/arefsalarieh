import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../../utils/prisma";
import { customError } from "../../../utils/customError";
import fs from "fs";
import path from "path";

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

export const changeCourseMainImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as any;
    const userId = authReq.user.id;
    const { courseId, imageId } = req.body;

    const course = await prisma.course.findFirst({
      where: { id: String(courseId) },
      include: { images: true },
    });

    if (!course) {
      return next(customError("Course not found", 404));
    }


    const isTeacher = course.teacherId === userId;

    if (!isTeacher) {
      return next(customError("You are not the teacher of this course", 403));
    }

    const image = course.images.find((img: any) => img.id === String(imageId));
    if (!image) {
      return next(customError("Image not found in this course", 404));
    }

    await prisma.$transaction(async (tx) => {
      await tx.courseImage.updateMany({
        where: { courseId: String(courseId) },
        data: { isMain: false },
      });

      await tx.courseImage.update({
        where: { id: String(imageId) },
        data: { isMain: true },
      });
    });

    const updatedImages = await prisma.courseImage.findMany({
      where: { courseId: String(courseId) },
    });

    res.status(200).json({
      status: true,
      message: "Main image changed successfully",
      data: updatedImages,
    });
  } catch (error) {
    console.error("Error in changeCourseMainImage:", error);
    next(error);
  }
};

export const deleteCourseImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as any;
    const userId = authReq.user.id;
    const { courseId, imageId } = req.body;

    const course = await prisma.course.findFirst({
      where: { id: String(courseId) },
      include: { images: true },
    });

    if (!course) {
      return next(customError("Course not found", 404));
    }

    if (course.teacherId !== userId) {
      return next(customError("You are not the teacher of this course", 403));
    }

    const image = course.images.find((img: any) => img.id === String(imageId));
    if (!image) {
      return next(customError("Image not found in this course", 404));
    }

    const filePath = path.join(process.cwd(), "uploads", image.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.$transaction(async (tx) => {
      await tx.courseImage.delete({
        where: { id: String(imageId) },
      });

      if (image.isMain) {
        const remainingImages = await tx.courseImage.findMany({
          where: { courseId: String(courseId) },
          orderBy: { createdAt: "desc" }, 
          take: 1,
        });

        if (remainingImages.length > 0) {
          await tx.courseImage.update({
            where: { id: remainingImages[0].id },
            data: { isMain: true },
          });
        }
      }
    });

    const updatedImages = await prisma.courseImage.findMany({
      where: { courseId: String(courseId) },
    });

    res.status(200).json({
      status: true,
      message: "Image deleted successfully",
      data: updatedImages,
    });
  } catch (error) {
    console.error("Error in deleteCourseImage:", error);
    next(error);
  }
};