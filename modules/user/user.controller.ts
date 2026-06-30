import type { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { prisma } from "../../utils/prisma";
import { customError } from "../../utils/customError";
import {
  checkEmail,
  createUpdateUserData,
  findUser,
  handleOrder,
  handlePagination,
  handleQuery,
  handleUpdateUser,
} from "./user.servece";

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as any;
    const { id } = authReq.user;

    const existingUser = await findUser(
      { id },
      { profile: true, userPictures: true },
    );

    if (!existingUser) {
      return next(customError("User not found", 404));
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const userWithImageUrls = {
      ...existingUser,
      userPictures: existingUser.userPictures.map((pic: any) => ({
        ...pic,
        url: `${baseUrl}/api/user/image/${pic.id}`,
      })),
    };

    const { password: _, ...userWithoutPassword } = userWithImageUrls;

    res.status(200).json({
      status: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.log("error in getUserProfile = ", error);
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as any;
    const { id } = authReq.user;
    const { email } = req.body;

    if (email) {
      const existingUserForEmail = await checkEmail(email, id);
      if (existingUserForEmail) {
        throw customError("Email is already in use", 400);
      }
    }

    const { userUpdateData, profileUpdateData } = createUpdateUserData(req);

    const updatedUser = await handleUpdateUser(
      id,
      userUpdateData,
      profileUpdateData,
    );

    res.status(201).json({
      status: true,
      data: updatedUser,
    });
  } catch (error) {
    console.log("error in updateProfile = ", error);
    next(error);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const searchWhere = handleQuery(req);
    const orderBy = handleOrder(req);
    const { skip, limit } = handlePagination(req);

    const totalCount = await prisma.user.count({
      where: searchWhere,
    });

    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
      where: searchWhere,
      orderBy,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      status: true,
      data: {
        users,
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
    console.log("error in getAllUsers = ", error);
    next(error);
  }
};

export const uploadProfileImages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as any;
    const { id } = authReq.user;

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return next(customError("No files uploaded", 400));
    }

    const imagesArray: Express.Multer.File[] = req.files as any;
    const addedImages: any[] = [];

    await prisma.userPictures.updateMany({
      where: { userId: id, isMain: true },
      data: { isMain: false },
    });

    for (let i = 0; i < imagesArray.length; i++) {
      const item = imagesArray[i];
      const isMain = i === 0;

      const newImage = await prisma.userPictures.create({
        data: {
          userId: id,
          filename: item.filename,
          path: item.filename,
          mimetype: item.mimetype,
          size: item.size,
          isMain: isMain,
        },
      });
      addedImages.push(newImage);
    }

    res.status(201).json({
      status: true,
      data: addedImages,
    });
  } catch (error) {
    console.log("error in uploadProfileImages = ", error);
    next(error);
  }
};

export const getUserImageById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as any;
    const userId = authReq.user.id;
    const { imageId } = req.params;

    const image = await prisma.userPictures.findFirst({
      where: {
        id: String(imageId),
        userId: userId,
      },
    });

    if (!image) {
      return next(customError("Image not found", 404));
    }

    const filename = image.path.split(/[\\/]/).pop();
    const uploadsPath = path.join(process.cwd(), "uploads", filename!);

    if (!fs.existsSync(uploadsPath)) {
      return next(customError("File not found on server", 404));
    }

    res.sendFile(uploadsPath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        next(customError("File not found", 404));
      }
    });
  } catch (error) {
    console.log("error in getUserImageById = ", error);
    next(error);
  }
};

export const changeMainImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as any;
    const { id } = authReq.user;
    const { imageId } = req.params;

    const existingUser = await findUser({ id });
    if (!existingUser) {
      return next(customError("User not found", 404));
    }

    const image = await prisma.userPictures.findFirst({
      where: {
        id: String(imageId),
        userId: id,
      },
    });

    if (!image) {
      return next(
        customError("Image not found or does not belong to user", 404),
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.userPictures.updateMany({
        where: { userId: id },
        data: { isMain: false },
      });

      await tx.userPictures.update({
        where: { id: String(imageId) },
        data: { isMain: true },
      });
    });

    const updatedImages = await prisma.userPictures.findMany({
      where: { userId: id },
    });

    res.status(200).json({
      status: true,
      message: "Main image updated successfully",
      data: updatedImages,
    });
  } catch (error) {
    console.log("error in changeMainImage = ", error);
    next(error);
  }
};

export const deleteUserImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as any;
    const { id } = authReq.user;
    const { imageId } = req.params;

    const existingUser = await findUser({ id });
    if (!existingUser) {
      return next(customError("User not found", 404));
    }

    const image = await prisma.userPictures.findFirst({
      where: {
        id: String(imageId),
        userId: id,
      },
    });

    if (!image) {
      return next(
        customError("Image not found or you don't have permission", 404),
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.userPictures.delete({
        where: { id: String(imageId) },
      });

      if (image.isMain) {
        const remainingImages = await tx.userPictures.findMany({
          where: { userId: id },
          orderBy: { createdAt: "asc" },
          take: 1,
        });

        if (remainingImages.length > 0) {
          await tx.userPictures.update({
            where: { id: remainingImages[0].id },
            data: { isMain: true },
          });
        }
      }
    });

    const updatedImages = await prisma.userPictures.findMany({
      where: { userId: id },
    });

    res.status(200).json({
      status: true,
      message: "Image deleted successfully",
      data: updatedImages,
    });
  } catch (error) {
    console.log("error in deleteUserImage = ", error);
    next(error);
  }
};



