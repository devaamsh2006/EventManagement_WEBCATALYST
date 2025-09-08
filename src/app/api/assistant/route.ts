import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { messages, events } = await req.json();

    // ✅ If events not passed, fetch them from /api/events
    let eventsData = events;
    if (!eventsData || eventsData.length === 0) {
      try {
        const res = await fetch(`${req.nextUrl.origin}/api/events`);
        eventsData = await res.json();
      } catch (err) {
        console.error("Failed to fetch events:", err);
        eventsData = [];
      }
    }

    // ✅ Correct Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // ✅ Build AI prompt with context
    const prompt = `
You are EventEase AI Assistant, a smart event guide. Your role is to help users with event-related queries using the provided event data. 

Guidelines:
1. If the user asks about an event, provide clear, engaging, and motivating information. 
   - Use the event data below for dates, venues, and times. 
   - If the user asks for more context (e.g., what the event is about), search your knowledge and explain the topic in an inspiring way to encourage attendance.  
2. If the user asks something unrelated to events, politely respond that you can only assist with event-related queries. 
3. Keep answers concise, friendly, and easy to read. Use bullet points or short paragraphs for clarity.  

Event Data:
${eventsData
  .map(
    (e: any) =>
      `- ${e.title}, on ${e.date || e.time}, at ${e.venue || e.location}`
  )
  .join("\n")}

Conversation so far:
${messages.map((m: any) => `${m.role}: ${m.content}`).join("\n")}

User's last question: ${messages[messages.length - 1]?.content}
`;


    // ✅ Generate response
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (err) {
    console.error("Assistant API Error:", err);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
