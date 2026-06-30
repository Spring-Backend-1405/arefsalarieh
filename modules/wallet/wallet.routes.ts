import express from "express";
import { checkAuthentication, requirePermission } from "../../middlewares/authMiddleware";
import { paymentRequest, paymentResult, withdrawRequest } from "./wallet.controller";

const walletRouter = express.Router();

walletRouter.post(
  "/payment-request",
  checkAuthentication,
  paymentRequest,
);

walletRouter.get(
  "/payment-result",
  checkAuthentication,
  paymentResult,
);

walletRouter.post(
  "/withdraw-request",
  checkAuthentication,
  withdrawRequest,
);

export default walletRouter;
