
import { prisma } from "../../config/database.js";
import type { Prisma } from "@prisma/client";

export async function getUserChats(userId: string) {
  const chats = await prisma.chat.findMany({
    where: {
      members: {
        some: { userId }
      }
    },
    include: {
      members: {
        select: {
          userId: true,
          joinedAt: true
        }
      }
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  return chats.map((chat) => ({
    chatId: chat.id,
    isGroup: chat.isGroup,
    createdAt: chat.createdAt,
    members: chat.members.map((member) => ({
      userId: member.userId,
      joinedAt: member.joinedAt
    }))
  }));
}

export async function getAllUsers(loggedInUserId: string) {
  const users = await prisma.user.findMany({
    where: {
      id: {
        not: loggedInUserId
      }
    },
    select: {
      id: true,
      name: true
    },
    orderBy: {
      name: "asc"
    }
  });

  return users;
}
