import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../utils/prisma";
import { customError } from "../../utils/customError";


export const getUserPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;

    const exeptionPermisiion = await prisma.user.findFirst({
      where: {
        id: String(userId),
      },
      include: {
        userPermission: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!exeptionPermisiion) {
      return next(customError("user doesnt exist", 400));
    }

    res.status(200).json({
      message: true,
      data: exeptionPermisiion,
    });
  } catch (error) {
    console.log("error in getUserPermissions = ", error);
    next(error);
  }
};

export const addPermissionToUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, permissionId } = req.body;

    const existingUserPermission = await prisma.userPermission.findFirst({
      where: {
        AND: [{ userId }, { permissionId }, { type: "ALLOW" }],
      },
    });

    if (existingUserPermission) {
      return next(customError("permission already exist for this user", 400));
    }

    const denyUserPermission = await prisma.userPermission.findFirst({
      where: {
        AND: [{ userId }, { permissionId }, { type: "DENY" }],
      },
    });

    if (denyUserPermission)
      await prisma.userPermission.delete({
        where: { userId_permissionId: { userId, permissionId } },
      });

    const newPermission = await prisma.userPermission.create({
      data: {
        userId,
        permissionId,
        type: "ALLOW",
      },
    });

    res.status(201).json({
      message: true,
      data: newPermission,
    });
  } catch (error) {
    console.log("error in addPermissionToUser = ", error);
    next(error);
  }
};

export const deletePermissionFromUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, permissionId } = req.body;

    const existingUserPermission = await prisma.userPermission.findFirst({
      where: {
        AND: [{ userId }, { permissionId }, { type: "ALLOW" }],
      },
    });

    if (!existingUserPermission) {
      return next(customError("permission doesnt exist for this user", 400));
    }

    const deletedPermission = await prisma.userPermission.delete({
      where: { userId_permissionId: { userId, permissionId } },
    });

    res.status(200).json({
        message : true,
        data : deletedPermission
    })
  } catch (error) {
    console.log("error in addPermissionToUser = ", error);
    next(error);
  }
};


export const denyPermissionToUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, permissionId } = req.body;

    const existingUserPermission = await prisma.userPermission.findFirst({
      where: {
        AND: [{ userId }, { permissionId }, { type: "DENY" }],
      },
    });

    if (existingUserPermission) {
      return next(customError("permission deny already exist for this user", 400));
    }

    const denyUserPermission = await prisma.userPermission.findFirst({
      where: {
        AND: [{ userId }, { permissionId }, { type: "ALLOW" }],
      },
    });

    if (denyUserPermission)
      await prisma.userPermission.delete({
        where: { userId_permissionId: { userId, permissionId } },
      });

    const newPermission = await prisma.userPermission.create({
      data: {
        userId,
        permissionId,
        type: "DENY",
      },
    });

    res.status(201).json({
      message: true,
      data: newPermission,
    });
  } catch (error) {
    console.log("error in denyPermissionToUser = ", error);
    next(error);
  }
};


export const deleteDenyPermissionFromUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, permissionId } = req.body;

    const existingUserPermission = await prisma.userPermission.findFirst({
      where: {
        AND: [{ userId }, { permissionId }, { type: "DENY" }],
      },
    });

    if (!existingUserPermission) {
      return next(customError("deny permission doesnt exist for this user", 400));
    }

    const deletedPermission = await prisma.userPermission.delete({
      where: { userId_permissionId: { userId, permissionId } },
    });

    res.status(200).json({
        message : true,
        data : deletedPermission
    })
  } catch (error) {
    console.log("error in addPermissionToUser = ", error);
    next(error);
  }
};