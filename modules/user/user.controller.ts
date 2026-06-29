import type { Request, Response, NextFunction } from "express";
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

    const existingUser = await findUser({ id } , {profile : true});

    if (!existingUser) {
      return next(customError("User not found", 404));
    }

  const { password: _, ...userWithoutPassword } = existingUser;


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
