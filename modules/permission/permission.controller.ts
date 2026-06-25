import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../utils/prisma";
import { customError } from "../../utils/customError";

export const getAllPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const roles = await prisma.permission.findMany();

    res.status(200).json({
      message: true,
      data: roles,
    });
  } catch (error) {
    console.log("error in getAllPermissions = ", error);
    next(error);
  }
};

export const addNewPermission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { resource, action, description } = req.body;

    const existingPermission = await prisma.permission.findFirst({
      where: {
        AND: [{ resource }, { action }],
      },
    });

    if (existingPermission) {
      return next(customError("permission already exist", 400));
    }

    const newPermission = await prisma.permission.create({
      data: {
        resource,
        action,
        description,
      },
    });

    res.status(200).json({
      message: true,
      data: newPermission,
    });
  } catch (error) {
    console.log("error in getAllPermissions = ", error);
    next(error);
  }
};


export const deletePermission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {permissionId} = req.params

  const existingPermission = await prisma.permission.findUnique({
      where: { id: String(permissionId) },
    });

    if (!existingPermission) {
      return next(customError("Permission not found", 404));
    }

    await prisma.permission.delete({
      where: { id: String(permissionId) },
    });

    if (!deletePermission) {
      return next(customError("permission doesnt exist", 400));
    }


    res.status(200).json({
      message: true,
      data: deletePermission,
    });
  } catch (error) {
    console.log("error in getAllPermissions = ", error);
    next(error);
  }
};