import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { registrations } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

const VALID_ATTENDANCE_STATUS = ['pending', 'present', 'absent'] as const;

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { attendanceStatus } = requestBody;

    // Validate attendanceStatus
    if (!attendanceStatus) {
      return NextResponse.json({ 
        error: "Attendance status is required",
        code: "MISSING_ATTENDANCE_STATUS" 
      }, { status: 400 });
    }

    if (!VALID_ATTENDANCE_STATUS.includes(attendanceStatus)) {
      return NextResponse.json({ 
        error: "Attendance status must be one of: pending, present, absent",
        code: "INVALID_ATTENDANCE_STATUS" 
      }, { status: 400 });
    }

    // Check if registration exists and belongs to user
    const existingRegistration = await db.select()
      .from(registrations)
      .where(and(eq(registrations.id, parseInt(id)), eq(registrations.userId, user.id)))
      .limit(1);

    if (existingRegistration.length === 0) {
      return NextResponse.json({ 
        error: 'Registration not found' 
      }, { status: 404 });
    }

    // Update the registration
    const updated = await db.update(registrations)
      .set({
        attendanceStatus
      })
      .where(and(eq(registrations.id, parseInt(id)), eq(registrations.userId, user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update registration' 
      }, { status: 404 });
    }

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}