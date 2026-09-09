import { GoogleGenerativeAI } from "@google/generative-ai";
import { eventsLimiter } from "./aiLimiter";

const RECOMMENDATION_MODELS = [
  "gemini-3-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.8-flash"
];

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
  if (!eventsLimiter.canRequest()) return fallbackRationale;
  
  try {
    const apiKeyRaw = process.env.GEMINI_API_KEY || '';
    const apiKeys = apiKeyRaw.split(',').map(k => k.trim()).filter(Boolean);
    
    if (apiKeys.length === 0) return "Great match based on shared interests.";
    
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
      }, 10000);
    });

    const fetchWithRetries = async (): Promise<string> => {
      const totalCombinations = RECOMMENDATION_MODELS.length * apiKeys.length;
      let attemptIndex = Math.floor(Math.random() * totalCombinations);

      while (!isTimedOut) {
        const modelIndex = attemptIndex % RECOMMENDATION_MODELS.length;
        const keyIndex = Math.floor(attemptIndex / RECOMMENDATION_MODELS.length) % apiKeys.length;
        
        const config = {
          model: RECOMMENDATION_MODELS[modelIndex],
          apiKey: apiKeys[keyIndex]
        };
        
        const genAI = new GoogleGenerativeAI(config.apiKey);
        const currentModel = genAI.getGenerativeModel({ model: config.model });
        
        try {
          const result = await currentModel.generateContent(prompt);
          let text = result.response.text();
          return text.replace(/[\n\r"]/g, '').trim();
        } catch (err: any) {
          if (isTimedOut) break;
          console.warn(`${config.model} failed, retrying...`, err.message);
        }
        
        attemptIndex = (attemptIndex + 1) % totalCombinations;
      }
      throw new Error("AI_TIMEOUT");
    };

    const aiPromise = fetchWithRetries();

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

export async function generateBatchRationales(userContext: string, eventsContexts: { eventId: string, eventContext: string }[], apiKeyString: string): Promise<Record<string, string>> {
  if (!eventsLimiter.canRequest()) {
    console.warn("AI Limiter blocked batch rationale generation to enforce 30 RPM.");
    return {};
  }

  const apiKeys = apiKeyString.split(',').map(k => k.trim()).filter(Boolean);
  
  if (apiKeys.length === 0 || eventsContexts.length === 0) return {};

  const eventsJsonStr = JSON.stringify(eventsContexts.map(e => ({ id: e.eventId, context: e.eventContext })));
  
  const prompt = `
Given the following User Profile and a list of Events, write a 1-sentence personalized rationale for EACH event explaining why they are a good match.
Speak directly to the user (e.g. "Recommended because you both..."). Keep it very concise and natural.

Return the result STRICTLY as a JSON object where the keys are the event IDs and the values are the 1-sentence rationales.
Output ONLY the raw JSON object. Do NOT include any explanations, thinking steps, markdown blocks (like \`\`\`json), or extra text.

User Profile: ${userContext}
Events: ${eventsJsonStr}
`;
  let isTimedOut = false;
  const timeoutPromise = new Promise<Record<string, string>>((_, reject) => {
    setTimeout(() => {
      isTimedOut = true;
      reject(new Error("AI_TIMEOUT"));
    }, 60000); // 60 seconds for Gemma batch processing
  });

  const extractJson = (text: string): Record<string, string> => {
    // 1. Try to find markdown json block
    const markdownMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (markdownMatch) {
      return JSON.parse(markdownMatch[1]);
    }
    // 2. Fallback to finding the first { and last }
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(text.substring(start, end + 1));
    }
    throw new Error("No JSON block found");
  };

  const fetchWithRetries = async (): Promise<Record<string, string>> => {
    const totalCombinations = RECOMMENDATION_MODELS.length * apiKeys.length;
    let attemptIndex = Math.floor(Math.random() * totalCombinations);

    while (!isTimedOut) {
      const modelIndex = attemptIndex % RECOMMENDATION_MODELS.length;
      const keyIndex = Math.floor(attemptIndex / RECOMMENDATION_MODELS.length) % apiKeys.length;
      
      const config = {
        model: RECOMMENDATION_MODELS[modelIndex],
        apiKey: apiKeys[keyIndex]
      };
      
      const genAI = new GoogleGenerativeAI(config.apiKey);
      const currentModel = genAI.getGenerativeModel({ model: config.model });
      
      try {
        const result = await currentModel.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        });
        const text = result.response.text().trim();
        try {
          return extractJson(text);
        } catch (e) {
          console.warn("Failed to parse batch JSON response:", text);
        }
      } catch (err: any) {
        if (isTimedOut) break;
        console.warn(`${config.model} failed for batch, retrying...`, err.message);
      }
      
      attemptIndex = (attemptIndex + 1) % totalCombinations;
      if (!isTimedOut) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    return {};
  };

  const aiPromise = fetchWithRetries();

  try {
    return await Promise.race([aiPromise, timeoutPromise]);
  } catch (error: any) {
    if (error?.message === "AI_TIMEOUT") {
      console.warn("Gemini batch rationale generation timed out.");
    } else {
      console.error("Failed to generate batch rationale:", error);
    }
    return {};
  }
}
