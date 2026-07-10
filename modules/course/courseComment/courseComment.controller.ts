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
        return next(customError(" this parentId not found", 404));
      }
    }

    const newComment = await prisma.courseComment.create({
      data: {
        userId: String(userId),
        courseId: String(courseId),
        parentId: parentId ? String(parentId) : null,
        text,
        isConfirm: false,
        isReject: false,
      },
    });

    res.json({
      message: "cmment added successfully",
      data: newComment,
    });
  } catch (error) {
    console.log("error in addCourseComment = ", error);
    next(error);
  }
};

export const getcourseComments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { courseId } = req.params;

    const existingCourse = await prisma.course.findFirst({
      where: { id: String(courseId) },
    });

    if (!existingCourse) {
      return next(customError("course not found", 404));
    }

    const existingComment = await prisma.courseComment.findMany({
      where: {
        courseId: String(courseId),
        parentId: null,
        isConfirm: true,
        isReject: false,
        isDelete: false,
      },
    });

    res.json({
      message: true,
      data: existingComment,
    });
  } catch (error) {
    console.log("error in getcourseComments = ", error);
    next(error);
  }
};

export const getCommentReplies = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { commentId } = req.params;

    const existingComments = await prisma.courseComment.findFirst({
      where: { id: String(commentId), isConfirm: true, isReject: false },
      include: {
        replies: {
          where: { isConfirm: true, isReject: false, isDelete: false },
        },
      },
    });

    if (!existingComments) {
      return next(customError("comment not found", 404));
    }

    res.json({
      message: true,
      data: existingComments,
    });
  } catch (error) {
    console.log("error in getCommentReplies = ", error);
    next(error);
  }
};

export const getcourseCommentsWithPermission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { courseId } = req.params;

    const existingCourse = await prisma.course.findFirst({
      where: { id: String(courseId) },
    });

    if (!existingCourse) {
      return next(customError("course not found", 404));
    }

    const existingComment = await prisma.courseComment.findMany({
      where: { courseId: String(courseId), parentId: null },
    });

    res.json({
      message: true,
      data: existingComment,
    });
  } catch (error) {
    console.log("error in getcourseCommentsWithPermission = ", error);
    next(error);
  }
};

export const getCommentRepliesWithPermission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { commentId } = req.params;

    const existingComments = await prisma.courseComment.findFirst({
      where: { id: String(commentId) },
      include: {
        replies: true,
      },
    });

    if (!existingComments) {
      return next(customError("comment not found", 404));
    }

    res.json({
      message: true,
      data: existingComments,
    });
  } catch (error) {
    console.log("error in getCommentRepliesWithPermission = ", error);
    next(error);
  }
};

export const confirmCourseCommentWithPermission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { commentId } = req.params;

    const existingComment = await prisma.courseComment.findFirst({
      where: { id: String(commentId) },
    });

    if (!existingComment) {
      return next(customError("comment not found", 404));
    }

    if (existingComment.isConfirm) {
      return next(customError("you already confirm this comment", 400));
    }

    const confirmedComment = await prisma.courseComment.update({
      where: { id: existingComment.id },
      data: { isConfirm: true, isReject: false },
    });

    res.json({
      message: "cmment confirm successfully",
      data: confirmedComment,
    });
  } catch (error) {
    console.log("error in confirmCourseComment = ", error);
    next(error);
  }
};

export const rejectCourseCommentWithPermission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { commentId } = req.params;

    const existingComment = await prisma.courseComment.findFirst({
      where: { id: String(commentId) },
    });

    if (!existingComment) {
      return next(customError("comment not found", 404));
    }

    if (existingComment.isReject) {
      return next(customError("you already reject this comment", 400));
    }

    const rejectedComment = await prisma.courseComment.update({
      where: { id: existingComment.id },
      data: { isConfirm: false, isReject: true },
    });

    res.json({
      message: "cmment reject successfully",
      data: rejectedComment,
    });
  } catch (error) {
    console.log("error in rejectCourseComment = ", error);
    next(error);
  }
};

export const deleteCourseComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as any;
    const { id: userId } = authReq.user;
    const { commentId } = req.params;

    const existingComment = await prisma.courseComment.findFirst({
      where: { id: String(commentId) },
    });

    if (!existingComment) {
      return next(customError("comment not found", 404));
    }

    if(existingComment.userId !== String(userId)){
      return next(customError("you aren`t creator of this comment", 400));
    }

    if(existingComment.isDelete){
      return next(customError("you already delete this comment", 400));
    }

    const deletedComment = await prisma.courseComment.update({
      where : {id : String(commentId)},
      data : {isDelete : true}
    })

    res.json({
      message: "comment deleted successfully",
      data: deletedComment,
    });
  } catch (error) {
    console.log("error in deleteCourseComment = ", error);
    next(error);
  }
};

export const updateCommentText = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as any;
    const { id: userId } = authReq.user;
    const { commentId , text } = req.body;

    const existingComment = await prisma.courseComment.findFirst({
      where: { id: String(commentId) },
    });

    if (!existingComment) {
      return next(customError("comment not found", 404));
    }

    if(existingComment.userId !== String(userId)){
      return next(customError("you aren`t creator of this comment", 400));
    }

    const updatedComment = await prisma.courseComment.update({
      where : {id : String(commentId)},
      data : {text}
    })

    res.json({
      message: "comment updated successfully",
      data: updatedComment,
    });
  } catch (error) {
    console.log("error in updateCommentText = ", error);
    next(error);
  }
};