import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { registrations, events, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid user ID is required",
        code: "INVALID_USER_ID" 
      }, { status: 400 });
    }

    const userId = parseInt(id);

    // Check if user exists
    const userExists = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userExists.length === 0) {
      return NextResponse.json({ 
        error: "User not found",
        code: "USER_NOT_FOUND" 
      }, { status: 404 });
    }

    // Get user's registered events with event details
    const userRegistrations = await db.select({
      registrationId: registrations.id,
      registeredAt: registrations.registeredAt,
      attendanceStatus: registrations.attendanceStatus,
      eventId: events.id,
      title: events.title,
      description: events.description,
      venue: events.venue,
      date: events.date,
      time: events.time,
      bannerImageUrl: events.bannerImageUrl,
      maxAttendees: events.maxAttendees,
      organizerId: events.organizerId,
      eventCreatedAt: events.createdAt,
      eventUpdatedAt: events.updatedAt,
      isActive: events.isActive
    })
    .from(registrations)
    .innerJoin(events, eq(registrations.eventId, events.id))
    .where(eq(registrations.userId, userId))
    .orderBy(events.date, events.time);

    return NextResponse.json(userRegistrations);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}