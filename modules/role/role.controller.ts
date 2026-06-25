import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../utils/prisma";

export const getAllRoles = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const roles = await prisma.role.findMany()

    res.status(200).json({
      message : true,
      data : roles
    })
  } catch (error) {
    console.log("error in getAllRoles = ", error);
    next(error);
  }
};
