import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../utils/prisma";
import { customError } from "../../utils/customError";
import { handlePagination } from "../../utils/searchHelper";

export const reserveCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as any;
    const id = authReq?.user?.id || "";

    const { courseId } = req.params;

    let existingCourse = await prisma.course.findFirst({
      where: { id: String(courseId) },
      include: { detail: true },
    });

    if (!existingCourse) {
      return next(customError("course not found", 404));
    }

    if (!existingCourse.detail) {
      return next(customError("Course detail is not available", 400));
    }

    const { totalStudent = 0, capacity = 0 } = existingCourse.detail;

    if (totalStudent && capacity && totalStudent >= capacity) {
      return next(customError("course capacity is full", 400));
    }

    const confirmedReserves = await prisma.courseReserves.count({
      where: {
        courseId: String(courseId),
        isConfirm: true,
        isDelete: false,
        expiresAt: { gt: new Date() },
      },
    });

    const totalConfirmed = (totalStudent || 0) + confirmedReserves;
    if (totalConfirmed >= capacity) {
      return next(
        customError(
          "Course capacity is full (including active confirmed reservations)",
          400,
        ),
      );
    }

    const existingCourseReserve = await prisma.courseReserves.findFirst({
      where: {
        userId: String(id),
        courseId: String(courseId),
        isDelete: false,
      },
    });

    if (
      existingCourseReserve &&
      existingCourseReserve.expiresAt &&
      existingCourseReserve.expiresAt > new Date(Date.now())
    ) {
      return next(
        customError(
          `you already reserve this course and its valid till ${existingCourseReserve.expiresAt} \n
        we are checking all reserve request\n
        Please be patient. 
        `,
          400,
        ),
      );
    }

    if (
      existingCourseReserve &&
      !existingCourseReserve.isDelete &&
      (existingCourseReserve.isConfirm || existingCourseReserve.isReject)
    ) {
      return next(
        customError(
          "Your previous request has been already processed (confirmed or rejected). Please contact support.",
          400,
        ),
      );
    }

    const addReserve = await prisma.courseReserves.create({
      data: {
        userId: String(id),
        courseId: String(courseId),
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      message: "reserved successfully",
      data: addReserve,
    });
  } catch (error) {
    console.log("error in reserveCourse = ", error);
    next(error);
  }
};

export const getAllReserves = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      createdAtStart,
      createdAtEnd,
      expiresAtStart,
      expiresAtEnd,
      courseId,
      userId,
      courseName,
      userName,
    } = req.query;

    const where: any = {};

    if (createdAtStart || createdAtEnd) {
      where.createdAt = {};
      if (createdAtStart)
        where.createdAt.gte = new Date(createdAtStart as string);
      if (createdAtEnd) where.createdAt.lte = new Date(createdAtEnd as string);
    }

    if (expiresAtStart || expiresAtEnd) {
      where.expiresAt = {};
      if (expiresAtStart)
        where.expiresAt.gte = new Date(expiresAtStart as string);
      if (expiresAtEnd) where.expiresAt.lte = new Date(expiresAtEnd as string);
    }

    if (courseId) {
      where.courseId = String(courseId);
    }

    if (userId) {
      where.userId = String(userId);
    }

    if (courseName) {
      where.course = {
        title: { contains: String(courseName) },
      };
    }

    if (userName) {
      where.user = {
        name: { contains: String(userName) },
      };
    }

    const { skip, limit } = handlePagination(req);

    const totalCount = await prisma.courseReserves.count({ where });

    const allReserves = await prisma.courseReserves.findMany({
      where,
      include: {
        course: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      status: true,
      data: {
        list: allReserves,
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
    console.log("error in getAllReserves = ", error);
    next(error);
  }
};

export const confirmCourseReserve = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { reserveId } = req.params;

    const existingReserve = await prisma.courseReserves.findFirst({
      where: { id: String(reserveId) },
      include: {
        course: {
          include: { detail: true },
        },
      },
    });

    if (!existingReserve) {
      return next(customError("Reserve not found", 404));
    }

    if (existingReserve.isDelete) {
      return next(customError("This reservation has been deleted", 400));
    }
    if (existingReserve.isConfirm) {
      return next(customError("This reserve already confirmed", 400));
    }
    if (existingReserve.expiresAt && existingReserve.expiresAt < new Date()) {
      return next(customError("Reserve has expired", 400));
    }
    if (!existingReserve.course.detail) {
      return next(customError("Course detail is not available", 400));
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedReserve = await tx.courseReserves.updateMany({
        where: {
          id: String(reserveId),
          isDelete: false,
          expiresAt: { gt: new Date() },
        },
        data: {
          isConfirm: true,
          isReject: false,
          expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      });

      if (updatedReserve.count === 0) {
        throw new Error("RESERVE_ALREADY_PROCESSED");
      }

      if (!existingReserve.course.detail) {
        return next(customError("Course detail is not available", 400));
      }
      const { totalStudent = 0, capacity = 0 } = existingReserve.course.detail;

      const activeConfirmedReserves = await tx.courseReserves.count({
        where: {
          courseId: existingReserve.courseId,
          isConfirm: true,
          isDelete: false,
          expiresAt: { gt: new Date() },
        },
      });

      const totalConfirmed = totalStudent + activeConfirmedReserves;

      if (totalConfirmed > capacity) {
        throw new Error("CAPACITY_FULL");
      }

      const confirmedReserve = await tx.courseReserves.findFirst({
        where: { id: String(reserveId) },
      });

      return confirmedReserve;
    });

    res.json({
      message: "Reserve confirmed successfully",
      data: result,
    });
  } catch (error: any) {
    if (error.message === "RESERVE_ALREADY_PROCESSED") {
      return next(
        customError(
          "Reserve cannot be confirmed (maybe already confirmed, rejected, deleted, or expired)",
          400,
        ),
      );
    }
    if (error.message === "CAPACITY_FULL") {
      return next(
        customError(
          "Course capacity is full (including active confirmed reservations)",
          400,
        ),
      );
    }

    console.error("error in confirmCourseReserve = ", error);
    next(error);
  }
};


export const rejectCourseReserve = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { reserveId } = req.params;

    const existingReserve = await prisma.courseReserves.findFirst({
      where: { id: String(reserveId) },
      include: {
        course: {
          include: { detail: true },
        },
      },
    });

    if (!existingReserve) {
      return next(customError("Reserve not found", 404));
    }

    if (existingReserve.isDelete) {
      return next(customError("This reservation has been deleted", 400));
    }
    if (existingReserve.isReject) {
      return next(customError("This reserve already rejected", 400));
    }
    if (existingReserve.expiresAt && existingReserve.expiresAt < new Date()) {
      return next(customError("Reserve has expired", 400));
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedReserve = await tx.courseReserves.updateMany({
        where: {
          id: String(reserveId),
          isDelete: false,
          expiresAt: { gt: new Date() },
        },
        data: {
          isReject: true,
          isConfirm: false,
          expiresAt : new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      });

      if (updatedReserve.count === 0) {
        throw new Error("RESERVE_ALREADY_PROCESSED");
      }

      const rejectedReserve = await tx.courseReserves.findFirst({
        where: { id: String(reserveId) },
      });

      return rejectedReserve;
    });

    res.json({
      message: "Reserve rejected successfully",
      data: result,
    });
  } catch (error: any) {
    if (error.message === "RESERVE_ALREADY_PROCESSED") {
      return next(
        customError(
          "Reserve cannot be rejected (maybe already confirmed, rejected, deleted, or expired)",
          400,
        ),
      );
    }

    console.error("error in rejectCourseReserve = ", error);
    next(error);
  }
};