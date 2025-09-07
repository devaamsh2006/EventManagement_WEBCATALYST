import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { registrations, users, events } from '@/db/schema';
import { eq, like, and, or, desc, asc, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single registration by ID with user and event details
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const registration = await db
        .select({
          id: registrations.id,
          userId: registrations.userId,
          eventId: registrations.eventId,
          registeredAt: registrations.registeredAt,
          attendanceStatus: registrations.attendanceStatus,
          userName: users.name,
          userEmail: users.email,
          eventTitle: events.title,
          eventVenue: events.venue,
          eventDate: events.date,
          eventTime: events.time,
        })
        .from(registrations)
        .leftJoin(users, eq(registrations.userId, users.id))
        .leftJoin(events, eq(registrations.eventId, events.id))
        .where(eq(registrations.id, parseInt(id)))
        .limit(1);

      if (registration.length === 0) {
        return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
      }

      return NextResponse.json(registration[0]);
    }

    // List registrations with pagination and filters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const userIdFilter = searchParams.get('userId');
    const eventIdFilter = searchParams.get('eventId');
    const attendanceStatusFilter = searchParams.get('attendanceStatus');
    const sort = searchParams.get('sort') || 'registeredAt';
    const order = searchParams.get('order') || 'desc';

    let query = db
      .select({
        id: registrations.id,
        userId: registrations.userId,
        eventId: registrations.eventId,
        registeredAt: registrations.registeredAt,
        attendanceStatus: registrations.attendanceStatus,
        userName: users.name,
        userEmail: users.email,
        eventTitle: events.title,
        eventVenue: events.venue,
        eventDate: events.date,
        eventTime: events.time,
      })
      .from(registrations)
      .leftJoin(users, eq(registrations.userId, users.id))
      .leftJoin(events, eq(registrations.eventId, events.id));

    // Apply filters
    const conditions = [];
    if (userIdFilter && !isNaN(parseInt(userIdFilter))) {
      conditions.push(eq(registrations.userId, parseInt(userIdFilter)));
    }
    if (eventIdFilter && !isNaN(parseInt(eventIdFilter))) {
      conditions.push(eq(registrations.eventId, parseInt(eventIdFilter)));
    }
    if (attendanceStatusFilter) {
      conditions.push(eq(registrations.attendanceStatus, attendanceStatusFilter));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const orderFunc = order === 'asc' ? asc : desc;
    if (sort === 'registeredAt') {
      query = query.orderBy(orderFunc(registrations.registeredAt));
    } else if (sort === 'attendanceStatus') {
      query = query.orderBy(orderFunc(registrations.attendanceStatus));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, eventId } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ 
        error: "userId is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!eventId) {
      return NextResponse.json({ 
        error: "eventId is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate IDs are integers
    if (isNaN(parseInt(userId)) || isNaN(parseInt(eventId))) {
      return NextResponse.json({ 
        error: "userId and eventId must be valid integers",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if user exists
    const userExists = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1);

    if (userExists.length === 0) {
      return NextResponse.json({ 
        error: "User not found",
        code: "USER_NOT_FOUND" 
      }, { status: 404 });
    }

    // Check if event exists and is active
    const event = await db
      .select({ 
        id: events.id, 
        maxAttendees: events.maxAttendees,
        isActive: events.isActive 
      })
      .from(events)
      .where(eq(events.id, parseInt(eventId)))
      .limit(1);

    if (event.length === 0) {
      return NextResponse.json({ 
        error: "Event not found",
        code: "EVENT_NOT_FOUND" 
      }, { status: 404 });
    }

    if (!event[0].isActive) {
      return NextResponse.json({ 
        error: "Cannot register for inactive events",
        code: "EVENT_INACTIVE" 
      }, { status: 400 });
    }

    // Check for duplicate registration
    const existingRegistration = await db
      .select({ id: registrations.id })
      .from(registrations)
      .where(and(
        eq(registrations.userId, parseInt(userId)),
        eq(registrations.eventId, parseInt(eventId))
      ))
      .limit(1);

    if (existingRegistration.length > 0) {
      return NextResponse.json({ 
        error: "User is already registered for this event",
        code: "DUPLICATE_REGISTRATION" 
      }, { status: 400 });
    }

    // Check event capacity
    const currentRegistrations = await db
      .select({ count: count() })
      .from(registrations)
      .where(eq(registrations.eventId, parseInt(eventId)));

    if (currentRegistrations[0].count >= event[0].maxAttendees) {
      return NextResponse.json({ 
        error: "Event has reached maximum capacity",
        code: "EVENT_CAPACITY_EXCEEDED" 
      }, { status: 400 });
    }

    // Create registration
    const newRegistration = await db.insert(registrations)
      .values({
        userId: parseInt(userId),
        eventId: parseInt(eventId),
        registeredAt: new Date().toISOString(),
        attendanceStatus: 'pending'
      })
      .returning();

    return NextResponse.json(newRegistration[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();
    const { attendanceStatus } = body;

    // Validate attendance status
    if (attendanceStatus && !['pending', 'present', 'absent'].includes(attendanceStatus)) {
      return NextResponse.json({ 
        error: "attendanceStatus must be one of: 'pending', 'present', 'absent'",
        code: "INVALID_ATTENDANCE_STATUS" 
      }, { status: 400 });
    }

    // Check if registration exists
    const existingRegistration = await db
      .select({ id: registrations.id })
      .from(registrations)
      .where(eq(registrations.id, parseInt(id)))
      .limit(1);

    if (existingRegistration.length === 0) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    if (attendanceStatus) {
      updateData.attendanceStatus = attendanceStatus;
    }

    // Update registration
    const updated = await db.update(registrations)
      .set(updateData)
      .where(eq(registrations.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if registration exists
    const existingRegistration = await db
      .select({ id: registrations.id })
      .from(registrations)
      .where(eq(registrations.id, parseInt(id)))
      .limit(1);

    if (existingRegistration.length === 0) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Delete registration
    const deleted = await db.delete(registrations)
      .where(eq(registrations.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Registration cancelled successfully',
      registration: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}