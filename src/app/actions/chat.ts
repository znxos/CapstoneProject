"use server";

import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { pusherServer } from "@/lib/pusher";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { aiLimiter } from "@/lib/aiLimiter";
import { moderationQueue } from "@/lib/moderationQueue";
import { executeModerationWithFallback } from "@/lib/modelRotator";

const prisma = new PrismaClient();

// Module 5: Get events for the user to display in the chat sidebar
export async function getChatEvents() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return { error: "Not authenticated" };

  try {
    const user = await prisma.user.findUnique({
      where: { studentEmail: session.user.email },
      include: {
        hostedEvents: true,
        participatedEvents: { include: { event: true } }
      }
    });
    if (!user) return { error: "User not found" };

    const events = [];
    for (const hosted of user.hostedEvents) {
      events.push(hosted);
    }
    for (const p of user.participatedEvents) {
      if (!events.find(e => e.id === p.event.id)) {
        events.push(p.event);
      }
    }

    // Sort by most recently created/updated
    events.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return { events };
  } catch (error) {
    console.error(error);
    return { error: "Failed to load chat events" };
  }
}

export async function getMessages(eventId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return { error: "Not authenticated" };

  try {
    // Only return non-flagged messages, or include flagged with a marker?
    // Let's only return non-flagged for safety
    const messages = await prisma.message.findMany({
      where: { eventId, isFlagged: false },
      include: { sender: { select: { id: true, displayName: true } } },
      orderBy: { timestamp: 'asc' }
    });

    const user = await prisma.user.findUnique({ where: { studentEmail: session.user.email } });

    const formatted = messages.map(m => ({
      id: m.id,
      senderId: m.senderId,
      senderName: m.sender.displayName || 'Unknown',
      text: m.text,
      time: m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: user ? m.senderId === user.id : false,
      timestamp: m.timestamp.getTime()
    }));

    return { messages: formatted, currentUserId: user?.id };
  } catch (error) {
    console.error(error);
    return { error: "Failed to load messages" };
  }
}

export async function sendMessage(eventId: string, text: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return { error: "Not authenticated" };

  if (!text || text.trim().length === 0) return { error: "Message cannot be empty" };

  try {
    const user = await prisma.user.findUnique({
      where: { studentEmail: session.user.email }
    });
    if (!user) return { error: "User not found" };

    // 1. Verify Active Membership efficiently
    const [isParticipant, isHost] = await Promise.all([
      prisma.eventParticipant.findUnique({
        where: { eventId_userId: { eventId, userId: user.id } }
      }),
      prisma.event.findFirst({
        where: { id: eventId, hostId: user.id }
      })
    ]);
    
    if (!isParticipant && !isHost) {
      return { error: "You are not a participant of this event." };
    }

    // 2 & 3. Run Anti-spam and AI Safety Filter in parallel to save time
    let isFlagged = false;
    let antiSpamError: string | null = null;
    const apiKey = process.env.GEMINI_API_KEY;

    // Build the AI Promise
    let wasRateLimited = false;
    const checkSafety = async (msgText: string) => {
      if (apiKey && aiLimiter.canRequest()) {
        try {
          // Attempt moderation across up to 5 models if they hit limits/errors
          return await executeModerationWithFallback(apiKey, msgText, 5);
        } catch (aiError: any) {
          if (aiError?.message?.includes("429")) {
            console.warn("All 5 attempted models were Rate Limited. Failing open and sending to queue.");
            wasRateLimited = true;
          } else {
            console.error("Gemini API safety check failed across all models:", aiError);
          }
        }
      } else if (apiKey) {
        wasRateLimited = true;
      }
      return false;
    };

    // Build the Spam Check Promise
    const checkSpam = async (userId: string, msgText: string) => {
      const lastMessage = await prisma.message.findFirst({
        where: { eventId, senderId: userId },
        orderBy: { timestamp: 'desc' }
      });
      if (lastMessage) {
        const timeDiff = Date.now() - lastMessage.timestamp.getTime();
        if (timeDiff < 1000) return "You are sending messages too quickly.";
        if (lastMessage.text === msgText && timeDiff < 10000) return "Duplicate message detected.";
      }
      return null;
    };

    // Wait for both to finish simultaneously
    const [flagResult, spamResult] = await Promise.all([
      checkSafety(text), 
      checkSpam(user.id, text)
    ]);
    
    if (spamResult) return { error: spamResult };
    if (flagResult) return { error: "Your message was flagged by our safety system for violating community guidelines." };

    // 4. Persist to DB
    const message = await prisma.message.create({
      data: {
        eventId,
        senderId: user.id,
        text,
        isFlagged: false
      }
    });

    const payload = {
      id: message.id,
      senderId: user.id,
      senderName: user.displayName || 'Unknown',
      text: message.text,
      time: message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: message.timestamp.getTime()
    };

    // 5. Broadcast via Pusher (WebSocket Engine)
    // Don't await pusher to speed up response to the sender!
    pusherServer.trigger(eventId, 'incoming-message', payload).catch(console.error);

    // 6. Post-Moderation
    if (wasRateLimited) {
      moderationQueue.push({
        messageId: message.id,
        eventId,
        text
      });
    }

    return { success: true, message: payload };
  } catch (error) {
    console.error("SendMessage error:", error);
    return { error: "Internal server error" };
  }
}
