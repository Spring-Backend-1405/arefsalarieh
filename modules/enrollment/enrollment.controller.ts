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
      isConfirm,
      isReject,
      isDelete,
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

    const toBoolean = (value: any): boolean | undefined => {
      if (typeof value === "string") {
        const lower = value.toLowerCase();
        if (lower === "true" || lower === "1") return true;
        if (lower === "false" || lower === "0") return false;
      }
      return undefined;
    };

    const confirmFilter = toBoolean(isConfirm);
    const rejectFilter = toBoolean(isReject);
    const deleteFilter = toBoolean(isDelete);

    if (confirmFilter !== undefined) {
      where.isConfirm = confirmFilter;
    }
    if (rejectFilter !== undefined) {
      where.isReject = rejectFilter;
    }
    if (deleteFilter !== undefined) {
      where.isDelete = deleteFilter;
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
        user: true,
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

    const existingEnroll = await prisma.courseEnroll.findFirst({
      where: {
        userId: existingReserve.userId,
        courseId: existingReserve.courseId,
      },
    });

    if (existingEnroll) {
      return next(
        customError(
          "User has already enrolled in this course. Cannot reject the reserve. Please process refund if needed.",
          400,
        ),
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedReserve = await tx.courseReserves.updateMany({
        where: {
          id: String(reserveId),
          isDelete: false,
          isReject: false,
        },
        data: {
          isReject: true,
          isConfirm: false,
          expiresAt: null,
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
      message:
        "Reserve rejected successfully. User can make a new reservation if capacity is available.",
      data: result,
    });
  } catch (error: any) {
    if (error.message === "RESERVE_ALREADY_PROCESSED") {
      return next(
        customError(
          "Reserve cannot be rejected (maybe already rejected, deleted, or expired)",
          400,
        ),
      );
    }

    console.error("error in rejectCourseReserve = ", error);
    next(error);
  }
};

export const getMyCourseReserves = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as any;
    const id = authReq?.user?.id || "";

    const {
      createdAtStart,
      createdAtEnd,
      expiresAtStart,
      expiresAtEnd,
      courseId,
      courseName,
      isConfirm,
      isReject,
      isDelete,
    } = req.query;

    const where: any = {
      userId: String(id),
    };

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

    if (courseName) {
      where.course = {
        title: { contains: String(courseName) },
      };
    }

    const toBoolean = (value: any): boolean | undefined => {
      if (typeof value === "string") {
        const lower = value.toLowerCase();
        if (lower === "true" || lower === "1") return true;
        if (lower === "false" || lower === "0") return false;
      }
      return undefined;
    };

    const confirmFilter = toBoolean(isConfirm);
    const rejectFilter = toBoolean(isReject);
    const deleteFilter = toBoolean(isDelete);

    if (confirmFilter !== undefined) {
      where.isConfirm = confirmFilter;
    }
    if (rejectFilter !== undefined) {
      where.isReject = rejectFilter;
    }
    if (deleteFilter !== undefined) {
      where.isDelete = deleteFilter;
    }

    const { skip, limit } = handlePagination(req);

    const totalCount = await prisma.courseReserves.count({ where });

    const myReserves = await prisma.courseReserves.findMany({
      where,
      include: {
        course: true,
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
        list: myReserves,
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
    console.error("error in getMyCourseReserves = ", error);
    next(error);
  }
};

export const finalizedEnrollment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as any;
    const id = authReq?.user?.id || "";
    const { reserveId } = req.params;

    const existingReserve = await prisma.courseReserves.findFirst({
      where: { id: String(reserveId) },
      include: {
        course: {
          include: {
            coursePrices: { where: { isActive: true } },
            detail: true,
          },
        },
        user: {
          include: { wallet: true },
        },
      },
    });

    if (!existingReserve) {
      return next(customError("Reserve not found", 404));
    }

    if (existingReserve.userId !== id) {
      return next(customError("This reserve is not for you", 403));
    }
    if (existingReserve.isDelete) {
      return next(customError("This reserve has been deleted", 400));
    }
    if (existingReserve.isReject) {
      return next(customError("This reserve has been rejected", 400));
    }
    if (!existingReserve.isConfirm) {
      return next(customError("This reserve has not been confirmed yet", 400));
    }
    if (existingReserve.expiresAt && existingReserve.expiresAt < new Date()) {
      return next(customError("This reserve has expired", 400));
    }

    const existingEnroll = await prisma.courseEnroll.findFirst({
      where: {
        userId: id,
        courseId: existingReserve.courseId,
      },
    });
    if (existingEnroll) {
      return next(customError("You are already enrolled in this course", 400));
    }

    const course = existingReserve.course;
    const detail = course.detail;
    const isFree = course.isFree;

    if (!detail) {
      return next(customError("Course detail is not available", 400));
    }

    let finalPrice = 0;
    let price = 0;
    let discount = 0;

    if (!isFree) {
      const activePrice = course.coursePrices[0];
      if (!activePrice) {
        return next(customError("Course price is not set", 400));
      }
      price = activePrice.price;
      discount = activePrice.discountPrice || 0;
      finalPrice = price - discount; 
    }

    if (!isFree) {
      const wallet = existingReserve.user.wallet;
      if (!wallet) {
        return next(customError("You don't have a wallet. Please charge your account", 404));
      }
      if (wallet.balance < finalPrice) {
        return next(customError(`Insufficient balance. Required: ${finalPrice}, Available: ${wallet.balance}`, 400));
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedDetail = await tx.courseDetail.updateMany({
        where: {
          courseId: course.id,
          totalStudent: { lt: detail.capacity },
        },
        data: {
          totalStudent: { increment: 1 },
        },
      });

      if (updatedDetail.count === 0) {
        throw new Error("CAPACITY_FULL");
      }

      let wallet = existingReserve.user.wallet;
      if (!isFree && wallet) {
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { decrement: finalPrice } },
        });
      }

      const invoice = await tx.courseInvoice.create({
        data: {
          invoiceNumber: `INV-${Date.now()}-${id.slice(0, 8)}`,
          courseId: course.id,
          userId: id,
          amount: price,
          discount: isFree ? 0 : discount,
          finalAmount: isFree ? 0 : finalPrice,
          status: isFree ? "PAID" : "PAID",
          paymentDate: new Date(),
          description: `Enrollment in course: ${course.title}${isFree ? " (Free)" : ""}`,
        },
      });

      const enroll = await tx.courseEnroll.create({
        data: {
          courseId: course.id,
          userId: id,
          invoiceId: invoice.id,
        },
      });

      await tx.courseReserves.update({
        where: { id: existingReserve.id },
        data: { isDelete: true },
      });

      return { enroll, invoice };
    });

    res.json({
      status: true,
      message: isFree
        ? "Free course enrollment completed successfully"
        : "Enrollment completed successfully. Payment deducted from wallet.",
      data: result,
    });
  } catch (error: any) {
    // مدیریت خطاهای اختصاصی
    if (error.message === "CAPACITY_FULL") {
      return next(
        customError(
          "Course capacity is full. Your payment has not been deducted.",
          400,
        ),
      );
    }

    console.error("error in finalizedEnrollment = ", error);
    next(error);
  }
};
