import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("Missing Gemini API Key");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(request: Request) {
  const { prompt } = await request.json();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return NextResponse.json({ text });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
      return NextResponse.json({ error: 'API limit reached' }, { status: 429 });
    }
    throw error;
  }
}