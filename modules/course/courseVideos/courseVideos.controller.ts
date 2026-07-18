import fs from "node:fs";
import type { Request, Response } from "express";
import { createTusServer, uploadContext, type UploadFinalData } from "../../../utils/tus/tus";
import { prisma } from "../../../utils/prisma"; 

type CourseUploadExtra = { courseId: string; sessionNumber: number };

const ALLOWED_VIDEO_EXTENSIONS = new Set([".mp4", ".webm"]);
const ALLOWED_VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm"]);

const tusServer = createTusServer<CourseUploadExtra>({
  routePath: "/api/course-video/upload",
  subfolder: "courses",

  buildData: async ({ upload, base }) => {
    const extension = base.extension.toLowerCase();
    const mimeType = base.mimeType.toLowerCase();

    if (!ALLOWED_VIDEO_EXTENSIONS.has(extension)) {
      throw new Error(
        `File format "${extension}" is not supported. Allowed formats: ${[...ALLOWED_VIDEO_EXTENSIONS].join(", ")}`
      );
    }

    if (mimeType && !ALLOWED_VIDEO_MIME_TYPES.has(mimeType)) {
      throw new Error(
        `MIME type "${mimeType}" is not supported. Allowed types: ${[...ALLOWED_VIDEO_MIME_TYPES].join(", ")}`
      );
    }

    const courseId = upload.metadata?.courseId;
    const sessionNumberRaw = upload.metadata?.sessionNumber;

    if (!courseId) {
      throw new Error("courseId is missing in upload metadata.");
    }

    if (!sessionNumberRaw) {
      throw new Error("sessionNumber is missing in upload metadata.");
    }

    const sessionNumber = Number(sessionNumberRaw);

    if (Number.isNaN(sessionNumber)) {
      throw new Error("sessionNumber must be a valid number.");
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course) {
      throw new Error("Course not found.");
    }

    return { courseId, sessionNumber };
  },
});

export const uploadCourseVideo = async (req: Request, res: Response) => {
  const store: { result?: UploadFinalData<CourseUploadExtra> } = {};

  try {
    await uploadContext.run(store, () => tusServer.handle(req, res));

    if (store.result) {
      await prisma.courseVideo.create({ data: store.result });
    }
  } catch (error) {
    console.error("tus handle error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Upload failed" });
    }
  }
};