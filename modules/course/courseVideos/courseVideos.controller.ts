import type { NextFunction, Request, Response } from "express";
import { createTusServer } from "../../../utils/tus/tus";

const tusServer = createTusServer({
  routePath: "/api/course-video/upload",
  subfolder: "courses",
//   onSaved: async (info) => {
//     await prisma.file.create({ data: info });
//   },
});

export const uploadCourseVideo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await tusServer.handle(req, res);

  } catch (error) {
    console.log("error in uploadCourseFile = ", error);
    next(error);
  }
};
