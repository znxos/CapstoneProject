import { GoogleGenerativeAI } from "@google/generative-ai";
import { aiLimiter } from "./aiLimiter";

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
  const fallbackRationale = "Highly recommended based on your AI-extracted profile matches.";
  if (!aiLimiter.canRequest()) return fallbackRationale;
  
  try {
    const apiKeyRaw = process.env.GEMINI_API_KEY || '';
    const apiKeys = apiKeyRaw.split(',').filter(Boolean);
    const key = apiKeys[0];
    
    if (!key) return "Great match based on shared interests.";

    // Swap to Gemma models as requested
    const genAI = new GoogleGenerativeAI(key);
    
    // Attempt with the primary gemma 4 model
    const model = genAI.getGenerativeModel({ model: "models/gemma-4-31b-it" });
    
    const prompt = `
Given the following User Profile and Event Details, write a 1-sentence personalized rationale explaining why they are a good match.
Speak directly to the user (e.g. "Recommended because you both..."). Keep it very concise and natural.
Avoid markdown or extra formatting.

User Profile: ${userContext}
Event Details: ${eventContext}
`;
    let isTimedOut = false;
    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => {
        isTimedOut = true;
        reject(new Error("AI_TIMEOUT"));
      }, 1500);
    });

    const aiPromise = model.generateContent(prompt).then(result => {
      let text = result.response.text();
      return text.replace(/[\n\r"]/g, '').trim();
    }).catch(async (err) => {
      if (isTimedOut) return ""; // Do not attempt fallback if already timed out, saves background time
      
      // Fallback to the smaller Gemma 4 model if the 31b model fails/rate-limits
      console.warn("models/gemma-4-31b-it failed, trying models/gemma-4-26b-a4b-it...", err.message);
      const fallbackModel = genAI.getGenerativeModel({ model: "models/gemma-4-26b-a4b-it" });
      const res = await fallbackModel.generateContent(prompt);
      return res.response.text().replace(/[\n\r"]/g, '').trim();
    });

    // Race the AI generation against the 1.5 second timeout
    return await Promise.race([aiPromise, timeoutPromise]);

  } catch (error: any) {
    if (error?.message === "AI_TIMEOUT") {
      console.warn("Gemini rationale generation timed out. Falling back to default.");
    } else if (error?.message?.includes("429")) {
      console.warn("Gemini Rate Limited during recommendation rationale. Falling back to default.");
    } else {
      console.error("Failed to generate rationale:", error);
    }
    return "Highly recommended based on your profile and social energy preferences.";
  }
}
