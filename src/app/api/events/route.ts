import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { events, users } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Single event by ID with organizer details
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }
      
      const event = await db.select({
        id: events.id,
        title: events.title,
        description: events.description,
        venue: events.venue,
        date: events.date,
        time: events.time,
        bannerImageUrl: events.bannerImageUrl,
        maxAttendees: events.maxAttendees,
        organizerId: events.organizerId,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        isActive: events.isActive,
        organizer: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl
        }
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .where(eq(events.id, parseInt(id)))
      .limit(1);

      if (event.length === 0) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      return NextResponse.json(event[0]);
    }

    // List events with pagination, search, and filters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const organizerId = searchParams.get('organizerId');
    const isActive = searchParams.get('isActive');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(events);
    
    const conditions = [];

    // Search by title or venue
    if (search) {
      conditions.push(or(
        like(events.title, `%${search}%`),
        like(events.venue, `%${search}%`)
      ));
    }

    // Filter by organizerId
    if (organizerId && !isNaN(parseInt(organizerId))) {
      conditions.push(eq(events.organizerId, parseInt(organizerId)));
    }

    // Filter by isActive
    if (isActive !== null && isActive !== undefined) {
      const isActiveValue = isActive === 'true';
      conditions.push(eq(events.isActive, isActiveValue));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortField = sort === 'title' ? events.title : 
                     sort === 'venue' ? events.venue :
                     sort === 'date' ? events.date :
                     sort === 'updatedAt' ? events.updatedAt :
                     events.createdAt;
    
    query = order === 'asc' ? query.orderBy(asc(sortField)) : query.orderBy(desc(sortField));
    
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
    const requestBody = await request.json();
    const { title, description, venue, date, time, maxAttendees, organizerId, bannerImageUrl } = requestBody;

    // Validate required fields
    if (!title) {
      return NextResponse.json({ 
        error: "Title is required",
        code: "MISSING_TITLE" 
      }, { status: 400 });
    }

    if (!venue) {
      return NextResponse.json({ 
        error: "Venue is required",
        code: "MISSING_VENUE" 
      }, { status: 400 });
    }

    if (!date) {
      return NextResponse.json({ 
        error: "Date is required",
        code: "MISSING_DATE" 
      }, { status: 400 });
    }

    if (!time) {
      return NextResponse.json({ 
        error: "Time is required",
        code: "MISSING_TIME" 
      }, { status: 400 });
    }

    if (!maxAttendees) {
      return NextResponse.json({ 
        error: "Max attendees is required",
        code: "MISSING_MAX_ATTENDEES" 
      }, { status: 400 });
    }

    if (!organizerId) {
      return NextResponse.json({ 
        error: "Organizer ID is required",
        code: "MISSING_ORGANIZER_ID" 
      }, { status: 400 });
    }

    // Validate maxAttendees is positive integer
    if (isNaN(parseInt(maxAttendees)) || parseInt(maxAttendees) <= 0) {
      return NextResponse.json({ 
        error: "Max attendees must be a positive integer",
        code: "INVALID_MAX_ATTENDEES" 
      }, { status: 400 });
    }

    // Validate organizerId is valid integer
    if (isNaN(parseInt(organizerId))) {
      return NextResponse.json({ 
        error: "Organizer ID must be a valid integer",
        code: "INVALID_ORGANIZER_ID" 
      }, { status: 400 });
    }

    // Validate date format (basic check for ISO date string)
    if (isNaN(Date.parse(date))) {
      return NextResponse.json({ 
        error: "Date must be a valid date format",
        code: "INVALID_DATE_FORMAT" 
      }, { status: 400 });
    }

    // Verify organizer exists
    const organizer = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(organizerId)))
      .limit(1);

    if (organizer.length === 0) {
      return NextResponse.json({ 
        error: "Organizer not found",
        code: "ORGANIZER_NOT_FOUND" 
      }, { status: 400 });
    }

    const now = new Date().toISOString();
    const newEvent = await db.insert(events)
      .values({
        title: title.trim(),
        description: description ? description.trim() : null,
        venue: venue.trim(),
        date,
        time,
        bannerImageUrl: bannerImageUrl || null,
        maxAttendees: parseInt(maxAttendees),
        organizerId: parseInt(organizerId),
        createdAt: now,
        updatedAt: now,
        isActive: true
      })
      .returning();

    return NextResponse.json(newEvent[0], { status: 201 });
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

    const requestBody = await request.json();
    const { title, description, venue, date, time, maxAttendees, organizerId, bannerImageUrl, isActive } = requestBody;

    // Check if event exists
    const existingEvent = await db.select()
      .from(events)
      .where(eq(events.id, parseInt(id)))
      .limit(1);

    if (existingEvent.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    // Validate and update fields if provided
    if (title !== undefined) {
      if (!title.trim()) {
        return NextResponse.json({ 
          error: "Title cannot be empty",
          code: "INVALID_TITLE" 
        }, { status: 400 });
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description ? description.trim() : null;
    }

    if (venue !== undefined) {
      if (!venue.trim()) {
        return NextResponse.json({ 
          error: "Venue cannot be empty",
          code: "INVALID_VENUE" 
        }, { status: 400 });
      }
      updates.venue = venue.trim();
    }

    if (date !== undefined) {
      if (isNaN(Date.parse(date))) {
        return NextResponse.json({ 
          error: "Date must be a valid date format",
          code: "INVALID_DATE_FORMAT" 
        }, { status: 400 });
      }
      updates.date = date;
    }

    if (time !== undefined) {
      if (!time.trim()) {
        return NextResponse.json({ 
          error: "Time cannot be empty",
          code: "INVALID_TIME" 
        }, { status: 400 });
      }
      updates.time = time;
    }

    if (maxAttendees !== undefined) {
      if (isNaN(parseInt(maxAttendees)) || parseInt(maxAttendees) <= 0) {
        return NextResponse.json({ 
          error: "Max attendees must be a positive integer",
          code: "INVALID_MAX_ATTENDEES" 
        }, { status: 400 });
      }
      updates.maxAttendees = parseInt(maxAttendees);
    }

    if (organizerId !== undefined) {
      if (isNaN(parseInt(organizerId))) {
        return NextResponse.json({ 
          error: "Organizer ID must be a valid integer",
          code: "INVALID_ORGANIZER_ID" 
        }, { status: 400 });
      }

      // Verify organizer exists
      const organizer = await db.select()
        .from(users)
        .where(eq(users.id, parseInt(organizerId)))
        .limit(1);

      if (organizer.length === 0) {
        return NextResponse.json({ 
          error: "Organizer not found",
          code: "ORGANIZER_NOT_FOUND" 
        }, { status: 400 });
      }

      updates.organizerId = parseInt(organizerId);
    }

    if (bannerImageUrl !== undefined) {
      updates.bannerImageUrl = bannerImageUrl || null;
    }

    if (isActive !== undefined) {
      updates.isActive = Boolean(isActive);
    }

    const updated = await db.update(events)
      .set(updates)
      .where(eq(events.id, parseInt(id)))
      .returning();

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

    // Check if event exists
    const existingEvent = await db.select()
      .from(events)
      .where(eq(events.id, parseInt(id)))
      .limit(1);

    if (existingEvent.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    const deleted = await db.update(events)
      .set({
        isActive: false,
        updatedAt: new Date().toISOString()
      })
      .where(eq(events.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Event deleted successfully',
      event: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}