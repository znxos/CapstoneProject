"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

import { eventsLimiter } from "../aiLimiter";

const ONBOARDING_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.8-flash"
];

export async function extractTagsFromBio(bio: string, maxAttempts = 5): Promise<string[]> {
  if (!bio || bio.length < 10) {
    return [];
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set.");
    return [];
  }

  const apiKeys = apiKey.split(',').map(k => k.trim()).filter(Boolean);
  if (apiKeys.length === 0) {
    console.warn("No valid GEMINI_API_KEY found.");
    return [];
  }

  const prompt = `
Analyze the following user bio and extract up to 5 succinct hobby or interest tags.
The tags should be single words or short phrases (max 2 words each).
Format the output as a valid JSON array of strings in all UPPERCASE.
Do not include markdown blocks or any other text in your response, just the raw JSON array.

Example input: "I love coding in javascript and drinking coffee while playing val"
Example output: ["CODING", "COFFEE", "GAMING"]

Bio:
"${bio}"
`;

  let lastError: any;
  const totalCombinations = ONBOARDING_MODELS.length * apiKeys.length;
  let attemptIndex = Math.floor(Math.random() * totalCombinations);

  for (let i = 0; i < maxAttempts; i++) {
    if (!eventsLimiter.canRequest()) {
      console.warn("Events limiter rate limited locally in frontend (tag extraction).");
      break;
    }
    
    const modelIndex = attemptIndex % ONBOARDING_MODELS.length;
    const keyIndex = Math.floor(attemptIndex / ONBOARDING_MODELS.length) % apiKeys.length;
    
    const config = {
      model: ONBOARDING_MODELS[modelIndex],
      apiKey: apiKeys[keyIndex]
    };

    try {
      const genAI = new GoogleGenerativeAI(config.apiKey);
      const model = genAI.getGenerativeModel({ model: config.model });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      let jsonStr = text;
      const arrayMatch = text.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        jsonStr = arrayMatch[0];
      }

      const tags = JSON.parse(jsonStr);
      
      if (Array.isArray(tags)) {
        return tags.slice(0, 5).map(tag => String(tag).toUpperCase());
      }
      return [];
    } catch (error: any) {
      console.warn(`[Attempt ${i + 1}/${maxAttempts}] Model ${config.model} with Key ${config.apiKey.substring(0, 5)}... failed: ${error.message || 'Unknown error'}. Trying next...`);
      lastError = error;
      attemptIndex = (attemptIndex + 1) % totalCombinations;
    }
  }

  console.error("AI Tag Extraction completely failed after max attempts", lastError);
  return [];
}
