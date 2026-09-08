"use server";

import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { computeCosineSimilarity, generateRationale } from "@/lib/recommendations";

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

    // --- RECOMENDER SYSTEM: PRE-REQUISITE ---
    // Ensure User has a cached vector embedding
    let userVector = (user as any).cachedVectorEmbedding as number[] | undefined;
    if (!userVector || userVector.length === 0) {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
          const textToEmbed = `Bio: ${user.bio || ''}. Interests: ${user.interests.join(', ')}. Looking for: ${user.lookingForTags.join(', ')}. AI Tags: ${user.extractedAiTags.join(', ')}. Social Energy: ${user.socialEnergyLevel || ''}`;
          const result = await model.embedContent(textToEmbed);
          userVector = result.embedding.values;
          
          await prisma.user.update({
            where: { id: user.id },
            data: { cachedVectorEmbedding: userVector }
          });
        }
      } catch (e) {
        console.warn("Failed to generate user embedding", e);
      }
    }

    const events = await prisma.event.findMany({
      include: {
        host: { select: { id: true, displayName: true, age: true, yearOfStudy: true, university: true } },
        participants: {
          select: { userId: true },
          take: 5
        },
        _count: {
          select: { participants: true }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    const joinedEventIds = user.participatedEvents.map(p => p.eventId);

    // --- RECOMMENDER SYSTEM: LAYER 1 (Hard Filtering) ---
    const userIsFirstYear = user.age && user.age <= 19 && user.yearOfStudy === 1;
    
    const filteredEvents = events.filter(event => {
      // 1. University Filter (if both have it defined, they must match)
      if (user.university && event.host.university && user.university !== event.host.university) {
        return false;
      }
      
      // 2. First-Year Ring-Fencing
      const hostIsFirstYear = event.host.age && event.host.age <= 19 && event.host.yearOfStudy === 1;
      
      if (userIsFirstYear && !hostIsFirstYear) {
        return false; // 1st years can't join non-1st-year events
      }
      if (!userIsFirstYear && hostIsFirstYear) {
        return false; // Non-1st-years can't join 1st-year events
      }
      
      return true;
    });

    // --- RECOMMENDER SYSTEM: LAYER 2 (Semantic Scoring) ---
    const scoredEvents = filteredEvents.map(event => {
      let score = 50; // Base score
      
      // Vector Similarity
      const eventVector = (event as any).cachedVectorEmbedding as number[] | undefined;
      if (userVector && eventVector && userVector.length > 0 && eventVector.length > 0) {
        const sim = computeCosineSimilarity(userVector, eventVector);
        // sim is usually between 0.5 and 1.0 for embeddings. Let's scale it.
        score = Math.round(sim * 100); 
      }
      
      // Heuristic Weights
      const userTagsStr = [...(user.lookingForTags || []), ...(user.extractedAiTags || []), ...(user.interests || [])].join(" ").toLowerCase();
      if (userTagsStr.includes(event.category.toLowerCase())) {
        score += 10;
      }
      
      const isHighEnergy = event.category === "Social" || event.category === "Party" || event.category === "Outdoors";
      const isLowEnergy = event.category === "Study" || event.category === "Creative";
      
      if (user.socialEnergyLevel === "High" && isHighEnergy) score += 5;
      if (user.socialEnergyLevel === "Low" && isLowEnergy) score += 5;
      
      score = Math.min(Math.max(score, 10), 99);
      
      return { event, score };
    });

    // Sort descending by score
    scoredEvents.sort((a, b) => b.score - a.score);

    // --- RECOMMENDER SYSTEM: LAYER 3 (LLM Rationale) ---
    const apiKey = process.env.GEMINI_API_KEY;
    const finalEvents = await Promise.all(scoredEvents.map(async ({ event, score }, index) => {
      let rationale = `Recommended because this ${event.category} event matches your interests.`;
      
      // Only invoke LLM for top 3 to save latency/costs
      if (index < 3 && apiKey) {
        const userContext = `Interests: ${user.interests.join(', ')}. Energy: ${user.socialEnergyLevel}. Bio: ${user.bio}`;
        const eventContext = `Title: ${event.title}. Category: ${event.category}. Description: ${event.description}`;
        rationale = await generateRationale(userContext, eventContext, apiKey);
      } else if (score > 80) {
        rationale = "Highly recommended based on your AI-extracted profile matches and semantic similarity.";
      }

      // Format Date
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

      const dummyAvatars = Array.from({length: event._count.participants}).map((_, i) => `https://i.pravatar.cc/150?img=${(i + 10) % 70}`);

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
    }));

    return { events: finalEvents };
  } catch (error) {
    console.error("Failed to get events:", error);
    return { error: "Failed to get events" };
  }
}
