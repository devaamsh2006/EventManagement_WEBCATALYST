// generateDescription.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, venue, date, time } = body;

    if (!title || !venue) {
      return NextResponse.json(
        { error: "Title and venue are required" },
        { status: 400 }
      );
    }

    // ✅ Correct Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // ✅ Build prompt
    const prompt = `
You are EventEase AI Assistant. Your task is to write a short, engaging, and motivating description for an event. 

Event Details:
- Title: ${title}
- Venue: ${venue}
- Date: ${date || "TBD"}
- Time: ${time || "TBD"}

Guidelines:
- Keep it concise and exciting.
- Encourage attendance.
- Use friendly and inviting language.
- Give it in 100 words
`;

    // ✅ Generate description
    const result = await model.generateContent(prompt);
    const description = result.response.text();

    return NextResponse.json({ description });
  } catch (error) {
    console.error("Generate Description Error:", error);
    return NextResponse.json(
      { error: "Failed to generate description" },
      { status: 500 }
    );
  }
}
