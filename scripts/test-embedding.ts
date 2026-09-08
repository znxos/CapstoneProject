import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

async function testEmbedding() {
  const envPath = path.resolve(__dirname, '../.env');
  const envFile = fs.readFileSync(envPath, 'utf8');
  
  const keyMatch = envFile.match(/GEMINI_API_KEY="([^"]+)"/);
  const apiKey = keyMatch ? keyMatch[1] : null;

  if (!apiKey) {
    console.error("No GEMINI_API_KEY found in .env");
    return;
  }
  
  console.log("Using API Key:", apiKey.substring(0, 10) + "...");
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log("Available models:", data.models.map((m: any) => m.name));
  } catch (e) {
    console.error("Error fetching models:");
    console.error(e);
  }
}

testEmbedding();
