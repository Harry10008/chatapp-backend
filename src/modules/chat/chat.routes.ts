
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { createChatController } from "./chat.controller.js";

const router = Router();

router.post("/create", authenticate, createChatController);

export default router;
