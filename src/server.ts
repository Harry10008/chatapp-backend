
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase, prisma } from "./config/database.js";
import "./config/firebase.js";

async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

void startServer();