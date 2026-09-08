import { PrismaClient } from "@prisma/client";
import { pusherServer } from "./pusher";
import { aiLimiter } from "./aiLimiter";
import { executeModerationWithFallback } from "./modelRotator";

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
    if (!aiLimiter.canRequest()) return;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return;

    const item = this.queue.shift(); // Remove the oldest message
    if (!item) return;

    try {
      const isFlagged = await executeModerationWithFallback(apiKey, item.text, 5);
      
      if (isFlagged) {
        console.warn(`Post-Moderation: Message ${item.messageId} was FLAGGED. Retroactively deleting.`);
        // Update DB
        await prisma.message.update({
          where: { id: item.messageId },
          data: { isFlagged: true }
        });

        // Broadcast to clients to remove it
        await pusherServer.trigger(item.eventId, 'message-deleted', { messageId: item.messageId });
      }
    } catch (error: any) {
      if (error?.message?.includes("429")) {
        console.warn("Background Moderation hit 429. Re-queueing message.");
        this.queue.unshift(item); // Put it back at the front
      } else {
        console.error("Background Moderation failed for msg", item.messageId, error);
      }
    }
  }
}

export const moderationQueue = (globalThis as any)._moderationQueue || new ModerationQueue();
if (process.env.NODE_ENV !== 'production') {
  (globalThis as any)._moderationQueue = moderationQueue;
}
