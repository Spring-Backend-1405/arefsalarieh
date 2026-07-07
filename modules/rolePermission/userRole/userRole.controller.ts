import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../../utils/prisma";
import { customError } from "../../../utils/customError";

export const addRoleToUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, roleId } = req.body;

    const existingRole = await prisma.role.findFirst({
      where: {
        id: roleId,
      },
    });

    if (!existingRole) {
      return next(customError("role not found", 404));
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        id: String(userId),
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
      return next(customError("User not found", 404));
    }

    const isTeacher = existingUser.roles.some(
      (item) => item.roleId === String(roleId),
    );

    if (isTeacher) {
      return next(customError("this user had already this role", 400));
    }

    const addedRole = await prisma.userRole.create({
      data: {
        roleId,
        userId,
      },
    });

    res.status(201).json({
      message: "role added successfully to user",
      data: addedRole,
    });
  } catch (error) {
    console.log("error in addRoleToUser = ", error);
    next(error);
  }
};
