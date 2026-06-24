import { createJwtToken } from "../../utils/tokenHelper";
import type {  Response } from "express";
import {env} from '../../config/env'


export const generaterefreshTokenAndSetCookie = (res : Response , data : {id:string , role : string}) => {
  const refreshToken = createJwtToken(
    {
      id: data.id,
      role: data.role,
    },
    7 * 24 * 60 * 60 * 1000,
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.envirement === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};


