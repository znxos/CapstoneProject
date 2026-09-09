"use server";

import { getServerSession } from "next-auth/next";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { generateEventEmbedding, generateUserEmbedding } from "@/lib/ai/events";
import { authOptions } from "@/lib/auth-config";
import { computeCosineSimilarity, generateRationale, generateBatchRationales } from "@/lib/ai-rationales";

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
      vector = await generateEventEmbedding({ 
        title: data.title, 
        category: data.category, 
        description: data.description 
      });
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

export async function getEvents(params?: {
  page?: number;
  limit?: number;
  tab?: "recommended" | "my-events" | "created-events";
  category?: string;
}) {
  const { page = 1, limit = 6, tab = "recommended", category = "All" } = params || {};

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
    if (tab === "recommended" && (!userVector || userVector.length === 0)) {
      try {
        userVector = await generateUserEmbedding(user as any);
        if (userVector && userVector.length > 0) {
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
        host: { 
          select: { 
            id: true, displayName: true, age: true, yearOfStudy: true, university: true,
            isFirstTimeUni: true, bio: true, introvertExtrovertScore: true, socialEnergyLevel: true,
            interests: true, languages: true, lookingForTags: true, extractedAiTags: true 
          } 
        },
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
      // Always retain events the user has already joined or created
      if (joinedEventIds.includes(event.id) || event.hostId === user.id) {
        return true;
      }

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
      
      // Heuristic Weights - Event Category vs User Tags
      const userTagsStr = [...(user.lookingForTags || []), ...(user.extractedAiTags || []), ...(user.interests || [])].join(" ").toLowerCase();
      if (userTagsStr.includes(event.category.toLowerCase())) {
        score += 10;
      }
      
      const isHighEnergy = event.category === "Social" || event.category === "Party" || event.category === "Outdoors";
      const isLowEnergy = event.category === "Study" || event.category === "Creative";
      
      if (user.socialEnergyLevel === "High" && isHighEnergy) score += 5;
      if (user.socialEnergyLevel === "Low" && isLowEnergy) score += 5;

      // --- HOST COMPATIBILITY HEURISTICS ---
      if (event.hostId !== user.id) {
        // University Match
        if (user.university && event.host.university && user.university === event.host.university) score += 5;
        
        // Year of Study Match
        if (user.yearOfStudy && event.host.yearOfStudy && user.yearOfStudy === event.host.yearOfStudy) score += 5;
        
        // Age Difference
        if (user.age && event.host.age && Math.abs(user.age - event.host.age) <= 2) score += 5;
        
        // Shared Languages
        if (user.languages && event.host.languages) {
          const sharedLangs = user.languages.filter(l => event.host.languages.includes(l));
          score += sharedLangs.length * 2;
        }
        
        // Shared Interests
        if (user.interests && event.host.interests) {
          const sharedInterests = user.interests.filter(i => event.host.interests.includes(i));
          score += sharedInterests.length * 2;
        }
        
        // Complementary Social Energy
        if (user.socialEnergyLevel && event.host.socialEnergyLevel && user.socialEnergyLevel === event.host.socialEnergyLevel) {
          score += 5;
        }
      }
      
      score = Math.min(Math.max(score, 10), 99);
      
      return { event, score };
    });

    // Sort descending by score
    scoredEvents.sort((a, b) => b.score - a.score);

    // --- NEW: SERVER-SIDE TAB & CATEGORY FILTERING ---
    let finalFilteredEvents = scoredEvents.map(se => {
      const isJoined = joinedEventIds.includes(se.event.id);
      const isHost = se.event.hostId === user.id;
      return { ...se, isJoined, isHost };
    });

    if (tab === "my-events") {
      finalFilteredEvents = finalFilteredEvents.filter(e => e.isJoined);
    } else if (tab === "created-events") {
      finalFilteredEvents = finalFilteredEvents.filter(e => e.isHost);
    } else if (tab === "recommended") {
      finalFilteredEvents = finalFilteredEvents.filter(e => !e.isHost && !e.isJoined);
    }

    if (category !== "All") {
      finalFilteredEvents = finalFilteredEvents.filter(e => e.event.category === category);
    }

    // --- NEW: SERVER-SIDE PAGINATION (SLICING) ---
    const totalCount = finalFilteredEvents.length;
    const paginatedEvents = finalFilteredEvents.slice((page - 1) * limit, page * limit);

    // --- RECOMMENDER SYSTEM: LAYER 3 (LLM Rationale) ---
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Hash the user's profile to detect changes
    const userContext = `Age: ${user.age || 'N/A'}. Year of Study: ${user.yearOfStudy || 'N/A'}. University: ${user.university || 'N/A'}. Interests: ${user.interests.join(', ')}. Languages: ${user.languages.join(', ')}. Looking For: ${user.lookingForTags.join(', ')}. Social Energy: ${user.socialEnergyLevel || 'N/A'} (${user.introvertExtrovertScore || 'N/A'}/100). Bio: ${user.bio || 'N/A'}`;
    const userProfileHash = crypto.createHash('sha256').update(userContext).digest('hex');

    const rationaleMap = new Map<string, any>();
    let batchResults: Record<string, string> = {};

    // Bulk fetch existing rationales for this page's events regardless of tab
    const existingRationalesList = await (prisma as any).eventRationale.findMany({
      where: {
        userId: user.id,
        eventId: { in: paginatedEvents.map((e: any) => e.event.id) }
      }
    });
    existingRationalesList.forEach((r: any) => rationaleMap.set(r.eventId, r));

    if (tab === "recommended") {
      // 1. Identify cache misses
      const cacheMisses: { eventId: string, eventContext: string }[] = [];
      for (const { event } of paginatedEvents) {
        const cached = rationaleMap.get(event.id);
        if (!cached || cached.userProfileHash !== userProfileHash) {
          const hostDetails = `Host Age: ${event.host.age || 'N/A'}. Host Year of Study: ${event.host.yearOfStudy || 'N/A'}. Host University: ${event.host.university || 'N/A'}. Host Interests: ${event.host.interests.join(', ')}. Host Languages: ${event.host.languages.join(', ')}. Host Energy: ${event.host.socialEnergyLevel || 'N/A'}. Host Bio: ${event.host.bio || 'N/A'}`;
          cacheMisses.push({
            eventId: event.id,
            eventContext: `Title: ${event.title}. Category: ${event.category}. Description: ${event.description}. [HOST PROFILE]: ${hostDetails}`
          });
        }
      }

      // 2. Batch generate rationales for all missed events
      if (cacheMisses.length > 0 && apiKey) {
        batchResults = await generateBatchRationales(userContext, cacheMisses, apiKey);
        
        // 3. Bulk Upsert the newly generated rationales to the DB
        const upserts = Object.entries(batchResults).map(([eventId, rationale]) => {
          return (prisma as any).eventRationale.upsert({
            where: { eventId_userId: { eventId, userId: user.id } },
            update: { rationale, userProfileHash },
            create: { eventId, userId: user.id, rationale, userProfileHash }
          });
        });
        await Promise.all(upserts);
      }
    }

    // 4. Assemble final events
    const finalEvents = paginatedEvents.map(({ event, score, isJoined, isHost }) => {
      let rationale = `Recommended because this ${event.category} event matches your interests.`;
      const cached = rationaleMap.get(event.id);
      
      if (isHost) {
        rationale = "You are hosting this event.";
      } else if (isJoined) {
        if (cached) {
          rationale = cached.rationale;
        } else {
          rationale = "You have joined this event.";
        }
      } else {
        if (cached && cached.userProfileHash === userProfileHash) {
          rationale = cached.rationale;
        } else if (batchResults[event.id]) {
          rationale = batchResults[event.id];
        } else if (score > 80) {
          rationale = "Highly recommended based on your AI-extracted profile matches and semantic similarity.";
        }
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
        isJoined,
        isHost
      };
    });

    return { events: finalEvents, totalCount };
  } catch (error) {
    console.error("Failed to get events:", error);
    return { error: "Failed to get events" };
  }
}
