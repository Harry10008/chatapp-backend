
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthRequest extends Request {
  userId?: string;
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication token required"
      });
      return;
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication token required"
      });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (typeof decoded === "string" || typeof decoded.userId !== "string") {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token"
      });
      return;
    }

    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
}
