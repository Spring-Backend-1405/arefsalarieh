import jwt from "jsonwebtoken";
import {env} from '../config/env'

const createJwtToken = (data: { id: string; role: string  } , time : number) => {
  const secret = env.jwtSecret;
  if (secret) {
    const token = jwt.sign(data, secret, { expiresIn: time });
    return token;
  }
};



const checkJwtToken = (token: string) => {
  const secret = process.env.JWT_SECRET;
  try {
    if (secret) {
      const checkToken = jwt.verify(token, secret);
      return checkToken;
    }
  } catch (error) {
    return undefined;
  }
};

export { createJwtToken, checkJwtToken };
