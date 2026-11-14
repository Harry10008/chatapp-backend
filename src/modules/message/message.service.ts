
import { FieldValue } from "firebase-admin/firestore";
import { firestore } from "../../config/firebase.js";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/AppError.js";

interface SendMessageInput {
  chatId: string;
  senderId: string;
  text: string;
}

export async function sendMessage(data: SendMessageInput) {
  // Verify chat exists and sender belongs to it.
  const membership = await prisma.chatMember.findUnique({
    where: {
      chatId_userId: {
        chatId: data.chatId,
        userId: data.senderId
      }
    }
  });

  if (!membership) {
    throw new Error("You are not a member of this chat");
  }

  const messageRef = firestore
    .collection("chats")
    .doc(data.chatId)
    .collection("messages")
    .doc();

  const message = {
    id: messageRef.id,
    senderId: data.senderId,
    text: data.text,
    createdAt: FieldValue.serverTimestamp(),
    readBy: [data.senderId]
  };

  await messageRef.set(message);

  return {
    id: messageRef.id,
    senderId: data.senderId,
    text: data.text,
    readBy: [data.senderId]
  };
}


export async function getMessages(
  chatId: string,
  userId: string,
  limit: number,
  cursor?: string
) {
  // Confirm the requesting user belongs to this chat.
  const membership = await prisma.chatMember.findUnique({
    where: {
      chatId_userId: { chatId, userId }
    }
  });

  if (!membership) {
    throw new Error("You are not a member of this chat");
  }

  const messagesRef = firestore
    .collection("chats")
    .doc(chatId)
    .collection("messages");

  let query = messagesRef
    .orderBy("createdAt", "desc")
    .limit(limit);

  if (cursor) {
    const cursorDoc = await messagesRef.doc(cursor).get();

    if (!cursorDoc.exists) {
      throw new AppError("Invalid message cursor", 400);
    }

    query = messagesRef
      .orderBy("createdAt", "desc")
      .startAfter(cursorDoc)
      .limit(limit);
  }

  const snapshot = await query.get();

  const messages = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));

  const nextCursor =
    snapshot.docs.length === limit
      ? snapshot.docs[snapshot.docs.length - 1]?.id ?? null
      : null;

  return {
    messages,
    nextCursor
  };
}


export async function markMessageAsRead(
  chatId: string,
  messageId: string,
  userId: string
) {
  // Verify chat membership.
  const membership = await prisma.chatMember.findUnique({
    where: {
      chatId_userId: { chatId, userId }
    }
  });

  if (!membership) {
    throw new Error("You are not a member of this chat");
  }

  const messageRef = firestore
    .collection("chats")
    .doc(chatId)
    .collection("messages")
    .doc(messageId);

  const messageSnapshot = await messageRef.get();

  if (!messageSnapshot.exists) {
    throw new Error("Message not found");
  }

  await messageRef.update({
    readBy: FieldValue.arrayUnion(userId)
  });

  return {
    messageId,
    userId,
    read: true
  };
}


export async function updateLastSeen(
  chatId: string,
  messageId: string,
  userId: string
) {
  // Verify chat membership.
  const membership = await prisma.chatMember.findUnique({
    where: {
      chatId_userId: { chatId, userId }
    }
  });

  if (!membership) {
    throw new Error("You are not a member of this chat");
  }

  const messageRef = firestore
    .collection("chats")
    .doc(chatId)
    .collection("messages")
    .doc(messageId);

  const lastSeenRef = firestore
    .collection("chats")
    .doc(chatId)
    .collection("lastSeen")
    .doc(userId);

  return firestore.runTransaction(async (transaction) => {
    const messageSnapshot = await transaction.get(messageRef);

    if (!messageSnapshot.exists) {
      throw new Error("Message not found");
    }

    const messageData = messageSnapshot.data();

    if (!messageData?.createdAt) {
      throw new Error("Message timestamp is unavailable");
    }

    const lastSeenSnapshot = await transaction.get(lastSeenRef);

    // Prevent moving last seen backwards.
    if (lastSeenSnapshot.exists) {
      const previousTime = lastSeenSnapshot.data()?.lastSeenAt;

      if (
        previousTime &&
        previousTime.toMillis() > messageData.createdAt.toMillis()
      ) {
        return {
          userId,
          messageId: lastSeenSnapshot.data()?.messageId,
          updated: false
        };
      }
    }

    transaction.set(lastSeenRef, {
      userId,
      messageId,
      lastSeenAt: messageData.createdAt,
      updatedAt: FieldValue.serverTimestamp()
    });

    return {
      userId,
      messageId,
      updated: true
    };
  });
}
