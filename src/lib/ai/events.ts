"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateEventEmbedding(data: { title: string, category: string, description: string }): Promise<number[]> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Skipping event embeddings.");
      return [];
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
    const textToEmbed = `${data.title}. ${data.category}. ${data.description}`;
    const result = await model.embedContent(textToEmbed);
    return result.embedding.values;
  } catch (e) {
    console.warn("Failed to generate event embedding", e);
    return [];
  }
}

export async function generateUserEmbedding(user: { bio?: string | null, interests: string[], lookingForTags: string[], extractedAiTags: string[], socialEnergyLevel?: string | null }): Promise<number[]> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Skipping user embeddings.");
      return [];
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
    const textToEmbed = `Bio: ${user.bio || ''}. Interests: ${user.interests.join(', ')}. Looking for: ${user.lookingForTags.join(', ')}. AI Tags: ${user.extractedAiTags.join(', ')}. Social Energy: ${user.socialEnergyLevel || ''}`;
    const result = await model.embedContent(textToEmbed);
    return result.embedding.values;
  } catch (e) {
    console.warn("Failed to generate user embedding", e);
    return [];
  }
}
