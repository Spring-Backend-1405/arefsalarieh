import jwt from "jsonwebtoken";

const createJwtToken = (data: { id: string; role: string }) => {
  const secret = process.env.JWT_SECRET;
  if (secret) {
    const token = jwt.sign(data, secret, { expiresIn: 60 * 60 });
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
