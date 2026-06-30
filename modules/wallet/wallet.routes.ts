import express from "express";
import { checkAuthentication, requirePermission } from "../../middlewares/authMiddleware";
import { confirmWithdraw, paymentRequest, paymentResult, withdrawRequest } from "./wallet.controller";

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

walletRouter.post(
  "/confirm-withdraw",
  checkAuthentication,
  confirmWithdraw,
);

export default walletRouter;
