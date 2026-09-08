"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function extractTagsFromBio(bio: string): Promise<string[]> {
  if (!bio || bio.length < 10) {
    return [];
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set.");
    return [];
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "models/gemini-3.6-flash" });

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // The model might return conversational filler or markdown. 
    // We use a regular expression to extract just the JSON array, 
    // using [\s\S] to ensure we match across multiple lines.
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
  } catch (error) {
    console.error("Error extracting tags with Gemini:", error);
    return [];
  }
}
