
import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import { z } from "zod";
import { createChat } from "./chat.service.js";

const createChatSchema = z.object({
  userBId: z.string().uuid()
});

export async function createChatController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userBId } = createChatSchema.parse(req.body);

    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
      return;
    }

    const chat = await createChat(req.userId, userBId);

    res.status(201).json({
      success: true,
      message: "Chat created successfully",
      data: chat
    });
  } catch (error) {
    next(error);
  }
}
