import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../../utils/prisma";
import { customError } from "../../../utils/customError";

export const getUserPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findFirst({
      where: { id: String(userId) },
      include: {
        roles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        userPermission: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!user) {
      return next(customError("User doesn't exist", 404));
    }

    const rolePermissionsSet = new Set<string>();
    for (const userRole of user.roles) {
      for (const rp of userRole.role.rolePermissions) {
        rolePermissionsSet.add(
          `${rp.permission.resource}:${rp.permission.action}`,
        );
      }
    }

    const allowPermissionsSet = new Set<string>();
    for (const up of user.userPermission) {
      if (up.type === "ALLOW") {
        allowPermissionsSet.add(
          `${up.permission.resource}:${up.permission.action}`,
        );
      }
    }

    const denyPermissionsSet = new Set<string>();
    for (const up of user.userPermission) {
      if (up.type === "DENY") {
        denyPermissionsSet.add(
          `${up.permission.resource}:${up.permission.action}`,
        );
      }
    }

    const finalPermissions = new Set<string>(rolePermissionsSet);
    for (const allow of allowPermissionsSet) {
      finalPermissions.add(allow);
    }
    for (const deny of denyPermissionsSet) {
      finalPermissions.delete(deny);
    }

    const permissionsList = Array.from(finalPermissions).map((perm) => {
      const [resource, action] = perm.split(":");
      return { resource, action };
    });

    res.status(200).json({
      status: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        permissions: permissionsList,
      },
    });
  } catch (error) {
    console.log("error in getUserPermissions = ", error);
    next(error);
  }
};

export const getUserExceptionPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;

    const exeptPermissions = await prisma.userPermission.findMany({
      where: {
        userId: String(userId),
      },
    });

    if (!exeptPermissions) {
      return next(customError("exept Permissions doesn't exist", 404));
    }

    res.json({
      message : true,
      data : exeptPermissions
    })
  } catch (error) {
    console.log("error in getUserExceptionPermissions = ", error);
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
      message: true,
      data: deletedPermission,
    });
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
      return next(
        customError("permission deny already exist for this user", 400),
      );
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
      return next(
        customError("deny permission doesnt exist for this user", 400),
      );
    }

    const deletedPermission = await prisma.userPermission.delete({
      where: { userId_permissionId: { userId, permissionId } },
    });

    res.status(200).json({
      message: true,
      data: deletedPermission,
    });
  } catch (error) {
    console.log("error in addPermissionToUser = ", error);
    next(error);
  }
};
