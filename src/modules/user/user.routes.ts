
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { getAllUsersController, getUserChatsController } from "./user.controller.js";

const router = Router();

router.get("/", authenticate, getAllUsersController);
router.get("/:userId/chats", authenticate, getUserChatsController);

export default router;
