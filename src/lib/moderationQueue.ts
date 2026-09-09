import { PrismaClient } from "@prisma/client";
import { pusherServer } from "./pusher";
import { chatLimiter } from "./aiLimiter";
import { executeBatchModerationWithFallback } from "./ai/chat";

const prisma = new PrismaClient();

export interface QueueItem {
  messageId: string;
  eventId: string;
  text: string;
}

class ModerationQueue {
  private queue: QueueItem[] = [];

  constructor() {
    // Only run interval if we are the only instance (Next.js dev hot reload protection)
    if (process.env.NODE_ENV !== 'production') {
      if (!(globalThis as any)._moderationQueueInterval) {
        (globalThis as any)._moderationQueueInterval = setInterval(() => this.processQueue(), 5000);
      }
    } else {
      setInterval(() => this.processQueue(), 5000);
    }
  }

  public push(item: QueueItem) {
    this.queue.push(item);
  }

  private async processQueue() {
    if (this.queue.length === 0) return;
    
    // Only process if the rate limiter allows us
    if (!chatLimiter.canRequest()) return;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return;

    const batchSize = 20;
    const batch = this.queue.splice(0, batchSize);
    if (batch.length === 0) return;

    try {
      const flaggedIds = await executeBatchModerationWithFallback(apiKey, batch, 5);
      
      for (const flaggedId of flaggedIds) {
        const item = batch.find(m => m.messageId === flaggedId);
        if (item) {
          console.warn(`Post-Moderation: Message ${item.messageId} was FLAGGED. Masking.`);
          
          // Update DB
          await prisma.message.update({
            where: { id: item.messageId },
            data: { isFlagged: true }
          });

          // Broadcast to clients to update text
          await pusherServer.trigger(item.eventId, 'message-flagged', { 
            messageId: item.messageId,
            text: "This message has been removed for violating our community guidelines."
          });
        }
      }
    } catch (error: any) {
      if (error?.message?.includes("429")) {
        console.warn("Background Moderation hit 429. Re-queueing batch.");
        this.queue.unshift(...batch); // Put it back at the front
      } else {
        console.error("Background Moderation batch failed", error);
      }
    }
  }
}

export const moderationQueue = (globalThis as any)._moderationQueue || new ModerationQueue();
if (process.env.NODE_ENV !== 'production') {
  (globalThis as any)._moderationQueue = moderationQueue;
}
