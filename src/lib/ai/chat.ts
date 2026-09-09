// responsible for the chat moderation

import { GoogleGenerativeAI } from "@google/generative-ai";

const MODERATION_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.8-flash"
];

/**
 * Tries to run the moderation prompt. If a model throws an error (e.g. Rate Limit 429), 
 * it catches it and loops to the next model automatically. 
 * Starts at a random model index to ensure requests are distributed across all models,
 * even across stateless serverless invocations.
 */
export async function executeModerationWithFallback(apiKeyString: string, msgText: string, maxAttempts = 5): Promise<boolean> {
  const prompt = `Analyze the following chat message for harassment, hate speech, severe bullying, or explicit danger.
Respond with a JSON object containing a single key "verdict" with the value "SAFE" or "FLAGGED".
Message: "${msgText}"`;

  let lastError: any;
  const apiKeys = apiKeyString.split(',').map(k => k.trim()).filter(Boolean);
  
  if (apiKeys.length === 0) {
    throw new Error("No API keys provided for moderation.");
  }

  const totalCombinations = MODERATION_MODELS.length * apiKeys.length;
  // Pick a random starting point for this specific message check
  let attemptIndex = Math.floor(Math.random() * totalCombinations);

  for (let i = 0; i < maxAttempts; i++) {
    const modelIndex = attemptIndex % MODERATION_MODELS.length;
    const keyIndex = Math.floor(attemptIndex / MODERATION_MODELS.length) % apiKeys.length;
    
    const config = {
      model: MODERATION_MODELS[modelIndex],
      apiKey: apiKeys[keyIndex]
    };

    try {
      const genAI = new GoogleGenerativeAI(config.apiKey);
      const model = genAI.getGenerativeModel({ model: config.model });
      const result = await model.generateContent(prompt);
      const verdict = result.response.text().trim().toUpperCase();
      return verdict.includes("FLAGGED");
    } catch (error: any) {
      console.warn(`[Attempt ${i + 1}/${maxAttempts}] Model ${config.model} with Key ${config.apiKey.substring(0, 5)}... failed: ${error.message || 'Unknown error'}. Trying next...`);
      lastError = error;
      // Increment attempt index to try the next combination if this one fails
      attemptIndex = (attemptIndex + 1) % totalCombinations;
    }
  }

  // If all attempts failed, throw the last error to the caller (so it triggers fail-open or queue logic)
  throw lastError;
}

export async function executeBatchModerationWithFallback(apiKeyString: string, messages: { messageId: string, text: string }[], maxAttempts = 5): Promise<string[]> {
  const prompt = `Analyze the following batch of chat messages for harassment, hate speech, severe bullying, or explicit danger.
Respond with a JSON array containing the messageIds of ONLY the messages that are FLAGGED. If none are flagged, return an empty array [].
Output ONLY valid JSON.
Messages to check:
${JSON.stringify(messages)}
`;

  let lastError: any;
  const apiKeys = apiKeyString.split(',').map(k => k.trim()).filter(Boolean);
  
  if (apiKeys.length === 0) {
    throw new Error("No API keys provided for moderation.");
  }

  const totalCombinations = MODERATION_MODELS.length * apiKeys.length;
  let attemptIndex = Math.floor(Math.random() * totalCombinations);

  for (let i = 0; i < maxAttempts; i++) {
    const modelIndex = attemptIndex % MODERATION_MODELS.length;
    const keyIndex = Math.floor(attemptIndex / MODERATION_MODELS.length) % apiKeys.length;
    
    const config = {
      model: MODERATION_MODELS[modelIndex],
      apiKey: apiKeys[keyIndex]
    };

    try {
      const genAI = new GoogleGenerativeAI(config.apiKey);
      const model = genAI.getGenerativeModel({ model: config.model });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      });
      
      const responseText = result.response.text().trim();
      let flaggedIds: string[] = [];
      try {
        let parsed: any;
        try {
          parsed = JSON.parse(responseText);
        } catch (e) {
          const match = responseText.match(/\[[\s\S]*\]/);
          if (match) parsed = JSON.parse(match[0]);
          else throw e;
        }

        if (Array.isArray(parsed)) {
          flaggedIds = parsed;
        } else if (parsed && typeof parsed === 'object') {
          const arrays = Object.values(parsed).filter(Array.isArray);
          if (arrays.length > 0) flaggedIds = arrays[0] as string[];
        }
      } catch (e) {
        console.error("Failed to parse Gemini batch response:", responseText);
      }
      return flaggedIds;
    } catch (error: any) {
      console.warn(`[Attempt ${i + 1}/${maxAttempts}] Batch Model ${config.model}... failed: ${error.message || 'Unknown error'}. Trying next...`);
      lastError = error;
      attemptIndex = (attemptIndex + 1) % totalCombinations;
    }
  }

  throw lastError;
}
