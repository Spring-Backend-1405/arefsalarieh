import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/errorMiddleware";
import authRouter from "./modules/auth/auth.routes";
import userRouter from "./modules/user/user.routes";
import roleRouter from "./modules/rolePermission/role/role.routes";
import permissionRouter from "./modules/rolePermission/permission/permission.routes";
import rolePermissionRouter from "./modules/rolePermission/rolePermission.routes";
import userPermissionException from "./modules/rolePermission/userPermissionException/userPermissionException.routes";
import walletRouter from "./modules/wallet/wallet.routes";
import categoryRouter from "./modules/course/category/category.routes";
import courseTypeRouter from "./modules/course/courseType/courseType.routes";
import courseRouter from "./modules/course/course.routes";
import userRoleRouter from "./modules/rolePermission/userRole/userRole.routes";
import courseLike from "./modules/course/courseLike/courseLike.routes";
import courseComment from "./modules/course/courseComment/courseComment.routes";

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
  app.use("/api/user-role", userRoleRouter); 
  app.use("/api/permission", permissionRouter);
  app.use("/api/role-permission", rolePermissionRouter);
  app.use("/api/user-permission-exception", userPermissionException);
  app.use("/api/wallet", walletRouter);
  app.use("/api/course-category", categoryRouter);
  app.use("/api/courseType", courseTypeRouter);
  app.use("/api/course", courseRouter);
  app.use("/api/course-like", courseLike);
  app.use("/api/course-comment", courseComment);
  

  app.use(errorMiddleware);

  return app;
};
