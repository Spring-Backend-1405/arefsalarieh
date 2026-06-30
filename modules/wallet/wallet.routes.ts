import express from "express";
import {
  checkAuthentication,
  requirePermission,
} from "../../middlewares/authMiddleware";
import {
  confirmWithdraw,
  paymentRequest,
  paymentResult,
  withdrawRequest,
} from "./wallet.controller";
import { Actions, Resources } from "../../constants/permissions";

const walletRouter = express.Router();

walletRouter.post("/payment-request", checkAuthentication, paymentRequest);

walletRouter.get("/payment-result", checkAuthentication, paymentResult);

walletRouter.post("/withdraw-request", checkAuthentication, withdrawRequest);

walletRouter.post(
  "/confirm-withdraw",
  checkAuthentication,
  requirePermission(Resources.WALLET, Actions.CONFIRMWITHDRAW),
  confirmWithdraw,
);

export default walletRouter;
