import express from "express";
import cors from "cors";
import helmet from "helmet";

import { errorMiddleware } from "./middlewares/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import chatRoutes from "./modules/chat/chat.routes.js";
import messageRoutes from "./modules/message/message.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import { AppError } from "./utils/AppError.js";


const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(errorMiddleware);
app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Chat backend is running"
    });
});



app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use("/chat", messageRoutes);
app.use("/user", userRoutes);

app.use((_req, _res, next) => {
next(new AppError("API endpoint not found", 404));
});
export default app;
