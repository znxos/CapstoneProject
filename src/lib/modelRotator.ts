import { GoogleGenerativeAI } from "@google/generative-ai";

const MODERATION_MODELS = [
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-omni-flash-preview",
  "gemini-omni-1.1-flash",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.8-flash"
];

let currentIndex = 0;

/**
 * Returns a different Gemini Flash model each time it's called using a Round-Robin strategy.
 * This spreads out API requests across multiple model endpoints to bypass rate limits on a single model.
 */
export function getNextModerationConfig(apiKeyString: string): { model: string, apiKey: string } {
  const apiKeys = apiKeyString.split(',').map(k => k.trim()).filter(Boolean);
  
  const totalCombinations = MODERATION_MODELS.length * apiKeys.length;
  
  const modelIndex = currentIndex % MODERATION_MODELS.length;
  const keyIndex = Math.floor(currentIndex / MODERATION_MODELS.length) % apiKeys.length;
  
  const model = MODERATION_MODELS[modelIndex];
  const apiKey = apiKeys[keyIndex] || apiKeys[0];
  
  currentIndex = (currentIndex + 1) % totalCombinations;
  
  return { model, apiKey };
}

/**
 * Tries to run the moderation prompt. If a model throws an error (e.g. Rate Limit 429), 
 * it catches it and loops to the next model in the rotator automatically.
 */
export async function executeModerationWithFallback(apiKeyString: string, msgText: string, maxAttempts = 5): Promise<boolean> {
  const prompt = `Analyze the following chat message for harassment, hate speech, severe bullying, or explicit danger.
Respond with a JSON object containing a single key "verdict" with the value "SAFE" or "FLAGGED".
Message: "${msgText}"`;

  let lastError: any;

  for (let i = 0; i < maxAttempts; i++) {
    const config = getNextModerationConfig(apiKeyString);
    try {
      const genAI = new GoogleGenerativeAI(config.apiKey);
      const model = genAI.getGenerativeModel({ model: config.model });
      const result = await model.generateContent(prompt);
      const verdict = result.response.text().trim().toUpperCase();
      return verdict.includes("FLAGGED");
    } catch (error: any) {
      console.warn(`[Attempt ${i + 1}/${maxAttempts}] Model ${config.model} with Key ${config.apiKey.substring(0, 5)}... failed: ${error.message || 'Unknown error'}. Trying next...`);
      lastError = error;
    }
  }

  // If all attempts failed, throw the last error to the caller (so it triggers fail-open or queue logic)
  throw lastError;
}
