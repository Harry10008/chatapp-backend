
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import {
  sendMessageController,
  getMessagesController,
  markMessageReadController,
  updateLastSeenController
} from "./message.controller.js";

const router = Router();

router.post("/:chatId/message/send", authenticate, sendMessageController);
router.get("/:chatId/messages", authenticate, getMessagesController);
router.post("/:chatId/message/:messageId/read", authenticate, markMessageReadController);
router.post("/:chatId/message/last-seen", authenticate, updateLastSeenController);

export default router;
