"use server";

import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function createEvent(data: {
  title: string;
  category: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants: number;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return { error: "Not authenticated" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { studentEmail: session.user.email },
    });

    if (!user) {
      return { error: "User not found" };
    }
    
    let maxParticipants = data.maxParticipants;
    if (maxParticipants < 3 || maxParticipants > 10) {
      return { error: "Event capacity must be between 3 and 10 participants." };
    }

    let vector: number[] = [];
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
        const textToEmbed = `${data.title}. ${data.category}. ${data.description}`;
        const result = await model.embedContent(textToEmbed);
        vector = result.embedding.values;
      } else {
        console.warn("GEMINI_API_KEY is not set. Skipping embeddings.");
      }
    } catch (e) {
      console.warn("Failed to generate embedding", e);
    }

    const event = await prisma.event.create({
      data: {
        title: data.title,
        category: data.category,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        location: data.location,
        maxParticipants: maxParticipants,
        hostId: user.id,
        cachedVectorEmbedding: vector,
        status: "ACTIVE"
      },
    });

    // Host automatically joins their own event
    await prisma.eventParticipant.create({
      data: {
        eventId: event.id,
        userId: user.id,
      }
    });

    return { success: true, eventId: event.id };
  } catch (error) {
    console.error("Failed to create event:", error);
    return { error: "Failed to create event" };
  }
}

export async function joinEvent(eventId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return { error: "Not authenticated" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { studentEmail: session.user.email },
    });

    if (!user) return { error: "User not found" };

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { participants: true } } },
    });

    if (!event) return { error: "Event not found" };
    
    if (event._count.participants >= event.maxParticipants) {
      return { error: "Event Capacity Reached", status: 409 };
    }

    await prisma.eventParticipant.create({
      data: {
        eventId,
        userId: user.id,
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to join event:", error);
    return { error: "Failed to join event" };
  }
}

export async function leaveEvent(eventId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return { error: "Not authenticated" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { studentEmail: session.user.email },
    });

    if (!user) return { error: "User not found" };

    await prisma.eventParticipant.delete({
      where: {
        eventId_userId: {
          eventId,
          userId: user.id,
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to leave event:", error);
    return { error: "Failed to leave event" };
  }
}

export async function getEvents() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return { error: "Not authenticated" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { studentEmail: session.user.email },
      include: { participatedEvents: true }
    });

    if (!user) return { error: "User not found" };

    const events = await prisma.event.findMany({
      include: {
        host: { select: { id: true, displayName: true } },
        participants: {
          select: { userId: true },
          take: 5 // Get first 5 for UI avatars
        },
        _count: {
          select: { participants: true }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    const joinedEventIds = user.participatedEvents.map(p => p.eventId);

    // Calculate heuristic similarity
    const formattedEvents = events.map(event => {
      let score = 50; // Base score
      
      // Basic heuristic: check if event category aligns with user tags
      const userTagsStr = [...(user.lookingForTags || []), ...(user.extractedAiTags || []), ...(user.interests || [])].join(" ").toLowerCase();
      
      if (userTagsStr.includes(event.category.toLowerCase())) {
        score += 20;
      }
      
      // Adjust based on social energy (very rudimentary heuristic without NLP)
      const isHighEnergy = event.category === "Social" || event.category === "Party";
      const isLowEnergy = event.category === "Study" || event.category === "Creative";
      
      if (user.socialEnergyLevel === "High" && isHighEnergy) score += 15;
      if (user.socialEnergyLevel === "Low" && isLowEnergy) score += 15;
      
      // Ensure score stays in bounds
      score = Math.min(Math.max(score, 10), 98);
      
      // Add slight randomness to make UI look organic since we don't have real embeddings yet
      score += Math.floor(Math.random() * 5) - 2;

      let rationale = `Recommended because this ${event.category} event matches your general interests.`;
      if (score > 80) {
        rationale = "Highly recommended based on your AI-extracted bio tags and preferred social energy.";
      } else if (score > 60) {
        rationale = "Recommended because it aligns with your general interests and university community.";
      }

      // Generate dummy avatars based on participant count to match the UI
      const dummyAvatars = Array.from({length: event._count.participants}).map((_, i) => `https://i.pravatar.cc/150?img=${(i + 10) % 70}`);

      const d = event.startTime;
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      
      const e = event.endTime;
      const eDay = e.getDate().toString().padStart(2, '0');
      const eMonth = (e.getMonth() + 1).toString().padStart(2, '0');
      const eYear = e.getFullYear();
      const eHours = e.getHours().toString().padStart(2, '0');
      const eMinutes = e.getMinutes().toString().padStart(2, '0');

      let formattedDatetime = `${day}/${month}/${year} ${hours}:${minutes} - `;
      if (day === eDay && month === eMonth && year === eYear) {
        formattedDatetime += `${eHours}:${eMinutes}`;
      } else {
        formattedDatetime += `${eDay}/${eMonth}/${eYear} ${eHours}:${eMinutes}`;
      }

      return {
        id: event.id,
        title: event.title,
        category: event.category,
        description: event.description,
        datetime: formattedDatetime,
        location: event.location,
        capacity: event.maxParticipants,
        joinedCount: event._count.participants,
        similarity: score,
        rationale,
        participants: dummyAvatars,
        isJoined: joinedEventIds.includes(event.id),
        isHost: event.hostId === user.id
      };
    });

    return { events: formattedEvents };
  } catch (error) {
    console.error("Failed to get events:", error);
    return { error: "Failed to get events" };
  }
}
