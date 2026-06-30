import express from "express";
import { checkAuthentication, requirePermission } from "../../middlewares/authMiddleware";
import { paymentRequest, paymentResult } from "./wallet.controller";

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

export default walletRouter;
