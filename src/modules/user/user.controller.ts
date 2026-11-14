import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import {getAllUsers, getUserChats } from "./user.service.js";

export async function getUserChatsController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.params.userId as string;

    if (!req.userId || req.userId !== userId) {
      res.status(403).json({
        success: false,
        message: "You cannot access another user's chats"
      });
      return;
    }

    const chats = await getUserChats(userId);

    res.status(200).json({
      success: true,
      message: "User chats fetched successfully",
      data: chats
    });
  } catch (error) {
    next(error);
  }
}
export async function getAllUsersController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;

    const users = await getAllUsers(userId);

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users
    });
  } catch (error) {
    next(error);
  }
}
