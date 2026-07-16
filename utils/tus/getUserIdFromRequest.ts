import { env } from "../../config/env";
import jwt from "jsonwebtoken";


interface JwtPayload {
  id: string;
}

export function getUserIdFromRequest(req: any): string | null {
  try {
    const authHeader =
      typeof req.headers?.get === "function"
        ? req.headers.get("authorization")
        : req.headers?.authorization;

    if (!authHeader) return null;

    const token = authHeader.split(" ")[1];
    if (!token) return null;

    const decoded = jwt.verify(token, env.jwtSecret || '') as JwtPayload;
    return decoded.id;
  } catch {
    return null;
  }
}