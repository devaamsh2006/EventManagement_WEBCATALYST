import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { registrations, users, events } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ await params before destructuring
    const { id } = await params;
    console.log(id);

    // Validate event ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: "Valid event ID is required",
          code: "INVALID_EVENT_ID",
        },
        { status: 400 }
      );
    }

    const eventId = parseInt(id);

    // Check if event exists
    const eventExists = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (eventExists.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    console.log(eventExists);
    // Get all registered users for the event with user details
    const attendees = await db
      .select({
        userId: registrations.userId,
        eventId: registrations.eventId,
        registeredAt: registrations.registeredAt,
        attendanceStatus: registrations.attendanceStatus,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(registrations)
      .innerJoin(users, eq(registrations.userId, users.id))
      .where(eq(registrations.eventId, eventId));
      console.log(attendees)
    return NextResponse.json(attendees);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + (error as Error).message },
      { status: 500 }
    );
  }
}
