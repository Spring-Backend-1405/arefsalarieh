import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/errorMiddleware";
import authRouter from "./modules/auth/auth.routes";
import userRouter from "./modules/user/user.routes";
import roleRouter from "./modules/role/role.routes";
import permissionRouter from "./modules/permission/permission.routes";
import rolePermissionRouter from "./modules/rolePermission/rolePermission.routes";
import userPermissionException from "./modules/userPermissionException/userPermissionException.routes";

export const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
  app.use(helmet());
  app.use(cookieParser());

  app.get("/health", (req, res) => {
    res.send("it`s healthy");
  });

  app.use("/api/auth", authRouter);
  app.use("/api/user", userRouter);
  app.use("/api/role", roleRouter);
  app.use("/api/permission", permissionRouter);
  app.use("/api/role-permission", rolePermissionRouter);
  app.use("/api/user-permission-exception", userPermissionException);



  app.use(errorMiddleware);

  return app;
};
