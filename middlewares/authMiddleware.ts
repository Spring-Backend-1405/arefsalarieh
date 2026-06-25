import { customError } from "../utils/customError";
import type { Request, Response, NextFunction } from "express";
import { checkJwtToken } from "../utils/tokenHelper";
import { hasPermission } from "../utils/permission";


const checkAuthentication = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token = req.headers.authorization;
  token = token?.split(" ")[1];
  if (!token) customError("first you should login ", 401);
  else if (token) {
    const user = checkJwtToken(token);
    if (!user) customError("your token is not valid", 401);
    const authUser = user as { id: number };

    const authReq = req as any;

    authReq.user = {
      id: authUser.id,
    };

    next();
  }
};



const requirePermission = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
    const req2 = req as any

      const userId = req2.user?.id;
      if (!userId) {
        return next(customError("Unauthenticated", 401));
      }

      const hasAccess = await hasPermission(userId, resource, action);
      if (!hasAccess) {
        return next(customError("Forbidden: insufficient permissions", 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export { checkAuthentication, requirePermission };
