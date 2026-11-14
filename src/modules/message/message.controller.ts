
import type { Response, NextFunction } from "express";
import { z } from "zod";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import { sendMessage, getMessages, markMessageAsRead, updateLastSeen } from "./message.service.js";

const sendMessageSchema = z.object({
  text: z.string().trim().min(1).max(5000)
});

export async function sendMessageController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { text } = sendMessageSchema.parse(req.body);
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const message = await sendMessage({
      chatId: req.params.chatId as string,
      senderId: userId,
      text
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message
    });
  } catch (error) {
    next(error);
  }
}


export async function getMessagesController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const chatId = req.params.chatId as string;
    const userId = req.userId!;

    const limitValue = Number(req.query.limit ?? 50);

    if (
      !Number.isInteger(limitValue) ||
      limitValue < 1 ||
      limitValue > 100
    ) {
      res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 100"
      });
      return;
    }

    const cursor =
      typeof req.query.cursor === "string"
        ? req.query.cursor
        : undefined;

    const result = await getMessages(
      chatId,
      userId,
      limitValue,
      cursor
    );

    res.status(200).json({
      success: true,
      message: "Messages fetched successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
}


export async function markMessageReadController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
      return;
    }

    const result = await markMessageAsRead(
      req.params.chatId as string,
      req.params.messageId as string,
      userId
    );

    res.status(200).json({
      success: true,
      message: "Message marked as read",
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function updateLastSeenController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
      return;
    }

    const schema = z.object({
      messageId: z.string().min(1)
    });

    const { messageId } = schema.parse(req.body);

    const result = await updateLastSeen(
      req.params.chatId as string,
      messageId,
      userId
    );

    res.status(200).json({
      success: true,
      message: "Last seen updated successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
}
