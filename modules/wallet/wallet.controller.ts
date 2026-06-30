import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../utils/prisma";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { customError } from "../../utils/customError";

export const paymentRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as any;
    const { id } = authReq.user;
    const { amount, description, callback_url } = req.body;

    const sendRequest = await axios.post(
      "https://sandbox.zarinpal.com/pg/v4/payment/request.json",
      {
        merchant_id: uuidv4(),
        amount,
        description: description || `user ${id} request to pay ${amount}`,
        callback_url,
      },
    );

    if (sendRequest.data.data.code !== 100) {
      return next(customError(sendRequest.data.data.message, 400));
    }

    const authority = sendRequest.data.data.authority;

    await prisma.$transaction(async (tx) => {
      let wallet = await tx.wallet.findUnique({
        where: { userId: id },
      });
      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            balance: 0,
            userId: id,
          },
        });
      }

      await tx.transactionList.create({
        data: {
          amount: Number(amount),
          type: "DEPOSIT",
          status: "PENDING",
          description: description || `user ${id} request to pay ${amount}`,
          authority: authority,
          walletId: wallet.id,
        },
      });
    });

    // const paymentUrl = `https://sandbox.zarinpal.com/pg/StartPay/${authority}`;
    // return res.redirect(paymentUrl);

    res.json({
      message: true,
      data: authority,
    });
  } catch (error) {
    console.log("error in paymentRequest = ", error);
    next(error);
  }
};

export const paymentResult = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { Authority, Status } = req.query;

    const transaction = await prisma.transactionList.findFirst({
      where: { authority: String(Authority) },
    });

    if (!transaction) {
      return next(customError("dont find any transaction", 404));
    }

    if (transaction.status === "SUCCESS") {
      return next(customError("its a repititive transaction", 400));
    }
    if (transaction.status === "FAILED") {
      return next(customError("this transaction already sign as faild ", 400));
    }

    if (Status === "NOK") {
      await prisma.transactionList.update({
        where: { id: transaction.id },
        data: { status: "FAILED" },
      });
      return next(customError("the payment was faild ", 400));
    }

    const verifyResponse = await axios.post(
      "https://sandbox.zarinpal.com/pg/v4/payment/verify.json",
      {
        merchant_id: uuidv4(),
        amount: transaction.amount,
        authority: String(Authority),
      },
    );

    const verifyData = verifyResponse.data.data;

    if (verifyData.code !== 100) {
      await prisma.transactionList.update({
        where: { id: transaction.id },
        data: { status: "FAILED" },
      });
      return next(
        customError(`payment didnt confirm wit code = ${verifyData.code}`, 400),
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.transactionList.update({
        where: { id: transaction.id },
        data: {
          status: "SUCCESS",
          refId: verifyData.ref_id,
        },
      });

      const wallet = await tx.wallet.findUnique({
        where: { id: transaction.walletId },
      });
      if (!wallet) {
        return next(customError("wallet dosnt find", 400));
      }
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: wallet.balance + transaction.amount,
        },
      });
    });

    return res.status(200).json({
      message: "payment was successfull",
      refId: verifyData.ref_id,
    });
  } catch (error) {
    console.log("error in paymentResult = ", error);
    next(error);
  }
};
