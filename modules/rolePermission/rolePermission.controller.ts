import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../utils/prisma";
import { customError } from "../../utils/customError";

export const getAllRolesPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    res.status(200).json({
      message: true,
      data: roles,
    });
  } catch (error) {
    console.log("error in getAllRolePermission = ", error);
    next(error);
  }
};

export const getSingleRolePermissions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { roleId } = req.params;

    const roles = await prisma.role.findFirst({
      where: {
        id: String(roleId),
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    res.status(200).json({
      message: true,
      data: roles,
    });
  } catch (error) {
    console.log("error in getSingleRolePermission = ", error);
    next(error);
  }
};

export const getAllPermissionsRoles = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const permissions = await prisma.permission.findMany({
      include: {
        rolePermissions: {
          include: {
            role : true
          },
        },
      },
    });

    res.status(200).json({
      message: true,
      data: permissions,
    });
  } catch (error) {
    console.log("error in getAllRolePermission = ", error);
    next(error);
  }
};

export const getSinglePermissionRoles = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { permissionId } = req.params;

    const permissions = await prisma.permission.findFirst({
      where: {
        id: String(permissionId),
      },
      include: {
        rolePermissions: {
          include: {
            role : true,
          },
        },
      },
    });

    res.status(200).json({
      message: true,
      data: permissions,
    });
  } catch (error) {
    console.log("error in getSingleRolePermission = ", error);
    next(error);
  }
};

export const addPermissionToRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { roleId, permissionId } = req.body;

    const existingRolePermission = await prisma.rolePermission.findFirst({
      where: {
        AND: [{ roleId }, { permissionId }],
      },
    });

    if (existingRolePermission) {
      return next(customError("permission already exist for this role", 400));
    }

    const newPermission = await prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });

    res.status(200).json({
      message: true,
      data: newPermission,
    });
  } catch (error) {
    console.log("error in getSingleRolePermission = ", error);
    next(error);
  }
};

export const deletePermissionfromRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { roleId, permissionId } = req.body;

    const existingPermission = await prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    if (!existingPermission) {
      return next(customError("permission doesnt exist for this role", 400));
    }


    res.status(200).json({
      message: true,
      data: existingPermission,
    });
  } catch (error) {
    console.log("error in getSingleRolePermission = ", error);
    next(error);
  }
};
