import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Computes the Cosine Similarity between two numerical vectors of the same length.
 * Returns a score between -1 and 1.
 */
export function computeCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Generates a 1-sentence rationale using Gemini for why the user matches the event.
 */
export async function generateRationale(
  userContext: string, 
  eventContext: string,
  apiKey: string | undefined
): Promise<string> {
  if (!apiKey) return "Highly recommended based on your AI-extracted profile matches.";
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    
    const prompt = `
Given the following User Profile and Event Details, write a 1-sentence personalized rationale explaining why they are a good match.
Speak directly to the user (e.g. "Recommended because you both..."). Keep it very concise and natural.
Avoid markdown or extra formatting.

User Profile: ${userContext}
Event Details: ${eventContext}
`;
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    // Clean up any potential line breaks or quotes
    text = text.replace(/[\n\r"]/g, '').trim();
    return text;
  } catch (error) {
    console.error("Failed to generate rationale:", error);
    return "Highly recommended based on your profile and social energy preferences.";
  }
}
