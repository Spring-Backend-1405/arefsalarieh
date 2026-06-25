import { customError } from "../utils/customError";
import type { Request, Response, NextFunction } from "express";
import { checkJwtToken } from "../utils/tokenHelper";

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

const checkAuthorization = (
  req: Request,
  res: Response,
  next: NextFunction,
  role: string,
) => {
  const authReq = req as any;
  const user = authReq.user;
  if (!user) customError("user token is not valid ! please login");
  if (user.role != role)
    customError("you don't have access for this action", 403);
  next();
};

const checkAuthorizationAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  checkAuthorization(req, res, next, "admin");
};

export { checkAuthentication, checkAuthorizationAdmin };
