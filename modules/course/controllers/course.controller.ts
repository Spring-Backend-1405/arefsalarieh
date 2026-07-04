import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../../utils/prisma";
import { customError } from "../../../utils/customError";
import {
  handleOrder,
  handlePagination,
  handleSearch,
} from "../../../utils/searchHelper";

export const createCourseHelper = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const obj = {
      CourseCategory:
        "use /category/get-all-categories to get all CourseCategory to use",
      courseType: "use /courseType/get-all-types to get all courseType to use",
      CourseStatus: 'one of "draft" , "published" , "archived" ',
    };
    res.status(200).json({
      message: true,
      data: obj,
    });
  } catch (error) {
    console.log("error in createCourseHelper = ", error);
    next(error);
  }
};

export const createCourseStepOne = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      title,
      shortDescription,
      isFree,
      level,
    //   status,
      teacherId,
      typeId,
    } = req.body;

    const levelList = ["beginner", "intermediate", "advanced"];

    if (level && !levelList.includes(level)) {
      return next(
        customError(
          "level shoul be in ['beginner' , 'intermediate' , 'advanced']",
          400,
        ),
      );
    }

    // const statusList = ["draft", "published", "archived"];

    // if (status && !statusList.includes(status)) {
    //   return next(
    //     customError(
    //       'status shoul be in ["draft", "published", "archived"]',
    //       400,
    //     ),
    //   );
    // }

    const existingType = await prisma.courseType.findFirst({
      where: {
        id: Number(typeId),
      },
    });

    if (!existingType) {
      return next(customError("typeId not found", 400));
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        id: String(teacherId),
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!existingUser) {
      return next(customError("user not found", 400));
    }

    const isTeacher = existingUser.roles.some((item) => {
      return item.role.name === "teacher";
    });

    if (!isTeacher) {
      return next(customError("this user is not teacher", 400));
    }

    const createCourse = await prisma.course.create({
      data: {
        title,
        shortDescription,
        isFree: Boolean(isFree),
        level,
        // status,
        teacherId,
        typeId: Number(typeId),
      },
    });

    res.status(201).json({
      message: "create Course Step One done",
      data: createCourse,
    });
  } catch (error) {
    console.log("error in createCourseStepOne = ", error);
    next(error);
  }
};

export const createCourseStepTwo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      courseId,
      courseCategoryIdsArray,
      price,
      fullDescription,
      language,
      certificateAvailable,
      capacity,
      slug,
      duration,
      status
    } = req.body;

    const existingCourse = await prisma.course.findFirst({
      where: {
        id: String(courseId),
      },
      include: {
        detail: true,
      },
    });

    if (!existingCourse) {
      return next(customError("cant find this course", 404));
    }

    if (existingCourse.detail) {
      return next(customError("this course has already paased step two", 404));
    }

    const addPrice = await prisma.coursePrice.create({
        data : {
            courseId,
            price
        }
    })

    if (!addPrice) {
      return next(customError("error in adding course price", 400));
    }

    const categoryArr =courseCategoryIdsArray ? JSON.parse(courseCategoryIdsArray) : [];

    const categoryArrForResponse: any[] = [];

    for (let i = 0; i < categoryArr.length; i++) {
      const item = categoryArr[i];

      const thisCourseCategory = await prisma.courseCategoryList.create({
        data: {
          courseId,
          categoryId: item,
        },
      });
      categoryArrForResponse.push(thisCourseCategory);
    }

    if (categoryArrForResponse.length < 1) {
      return next(customError("error in adding course category", 400));
    }

    const addCourseDetail = await prisma.courseDetail.create({
      data: {
        courseId,
        fullDescription,
        language,
        certificateAvailable : Boolean(certificateAvailable),
        capacity,
        slug,
        duration,
      },
    });

    if (!addCourseDetail) {
      return next(customError("error in create course", 400));
    }

    const changeCourseStatus = await prisma.course.update({
        where : {
            id : courseId
        },
        data : {
            status : status || 'published'
        }
    })

    const courseForRes = {...changeCourseStatus , ...addCourseDetail}

    res.status(201).json({
      message: "create Course Step two done",
      data: courseForRes,
    });
  } catch (error) {
    console.log("error in createCourseStepTwo = ", error);
    next(error);
  }
};
