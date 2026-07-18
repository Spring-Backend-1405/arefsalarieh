import path from "node:path";
import fs from "node:fs/promises";
import { AsyncLocalStorage } from "node:async_hooks";
import { Server } from "@tus/server";
import { FileStore } from "@tus/file-store";

import {
  getExtension,
  generateFilename,
  getRelativeFileDestination,
  getAbsoluteFileDestination,
} from "./CorrectName";


type BaseFileInfo = {
  filename: string;
  originalName: string;
  extension: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
};

type BuildDataContext = {
  req: any;
  upload: any;
  base: BaseFileInfo;
};

interface CreateTusServerOptions<T extends Record<string, unknown> = {}> {
  routePath: string;
  subfolder: string;
  buildData?: (ctx: BuildDataContext) => T | Promise<T>;
}

type UploadResultStore<T extends Record<string, unknown> = {}> = {
  result?: BaseFileInfo & T;
};

export const uploadContext = new AsyncLocalStorage<UploadResultStore<any>>();


const ALLOWED_EXTENSIONS = new Set([".mp4", ".webm"]);

export function createTusServer<T extends Record<string, unknown> = {}>({
  routePath,
  subfolder,
  buildData,
}: CreateTusServerOptions<T>) {
  return new Server({
    path: routePath,

    datastore: new FileStore({
      directory: path.join(process.cwd(), "uploads"),
    }),

    async onUploadCreate(req, upload) {
      const filename = upload.metadata?.filename;

      if (!filename) {
        throw new Error("Filename is missing.");
      }

      const extension = getExtension(filename).toLowerCase();

      if (!ALLOWED_EXTENSIONS.has(extension)) {
        throw new Error(
          `File format "${extension}" is not supported. Allowed formats: ${[...ALLOWED_EXTENSIONS].join(", ")}`,
        );
      }

      return {};
    },

    async onUploadFinish(req, upload) {
      if (!upload.metadata?.filename) {
        throw new Error("Filename is missing.");
      }


      const filename = upload.metadata.filename;
      const extension = getExtension(filename);
      const newFilename = generateFilename(filename);

      const oldPath = path.join(process.cwd(), "uploads", upload.id);
      const absoluteNewPath = getAbsoluteFileDestination(
        subfolder,
        newFilename,
      );
      const relativeNewPath = getRelativeFileDestination(
        subfolder,
        newFilename,
      );

      try {
        await fs.mkdir(path.dirname(absoluteNewPath), { recursive: true });
        await fs.rename(oldPath, absoluteNewPath);
        await fs.unlink(oldPath + ".json").catch(() => {});

        const base: BaseFileInfo = {
          filename: newFilename,
          originalName: filename,
          extension,
          mimeType: upload.metadata?.filetype || "",
          size: upload.size ?? 0,
          path: relativeNewPath,
          url: `/${subfolder}/${newFilename}`,
        };

        const extra = buildData
          ? await buildData({ req, upload, base })
          : ({} as T);
        const finalData = { ...base, ...extra };

        const store = uploadContext.getStore();
        if (store) {
          store.result = finalData;
        }
      } catch (err) {
        console.error("Upload finish failed:", err);
        throw err;
      }

      return {};
    },
  });
}

export type UploadFinalData<T extends Record<string, unknown> = {}> =
  BaseFileInfo & T;
