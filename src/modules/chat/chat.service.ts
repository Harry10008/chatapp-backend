
import { prisma } from "../../config/database.js";
import { Prisma } from "@prisma/client";
import { AppError } from "../../utils/AppError.js";

export async function createChat(userAId: string, userBId: string) {
  if (userAId === userBId) {
    throw new AppError("You cannot create a chat with yourself", 400);
  }

  const [firstUserId, secondUserId] = [userAId, userBId].sort();
  const directKey = `${firstUserId}:${secondUserId}`;

  // Check that both users exist.
  const users = await prisma.user.findMany({
    where: {
      id: { in: [userAId, userBId] }
    },
    select: { id: true }
  });

  if (users.length !== 2) {
    throw new AppError("One or both users do not exist", 404);
  }

  // Fast path: return an existing direct chat.
  const existingChat = await prisma.chat.findUnique({
    where: { directKey },
    select: { id: true }
  });

  if (existingChat) {
    return { chatId: existingChat.id };
  }

  try {
    const chat = await prisma.chat.create({
      data: {
        isGroup: false,
        directKey,
        members: {
          create: [
            { userId: userAId },
            { userId: userBId }
          ]
        }
      },
      select: {
        id: true
      }
    });

    return { chatId: chat.id };
  } catch (error) {
    // Another simultaneous request may have created this chat first.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const chat = await prisma.chat.findUnique({
        where: { directKey },
        select: { id: true }
      });

      if (chat) {
        return { chatId: chat.id };
      }
    }

    throw error;
  }
}
