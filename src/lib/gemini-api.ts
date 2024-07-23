import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

export async function* streamGeminiResponse(prompt: string): AsyncGenerator<string> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch from Gemini API');
  }

  const data = await response.json();
  yield data.text;
}