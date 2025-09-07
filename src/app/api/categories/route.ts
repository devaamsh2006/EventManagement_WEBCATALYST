import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { eventCategories } from '@/db/schema';
import { eq, like, or, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const category = await db.select()
        .from(eventCategories)
        .where(eq(eventCategories.id, parseInt(id)))
        .limit(1);

      if (category.length === 0) {
        return NextResponse.json({ 
          error: 'Category not found' 
        }, { status: 404 });
      }

      return NextResponse.json(category[0]);
    }

    // List with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'name';
    const order = searchParams.get('order') === 'desc' ? desc : undefined;

    let query = db.select().from(eventCategories);

    if (search) {
      const searchCondition = or(
        like(eventCategories.name, `%${search}%`),
        like(eventCategories.description, `%${search}%`)
      );
      query = query.where(searchCondition);
    }

    // Apply sorting
    if (sort === 'name') {
      query = order ? query.orderBy(desc(eventCategories.name)) : query.orderBy(eventCategories.name);
    } else if (sort === 'id') {
      query = order ? query.orderBy(desc(eventCategories.id)) : query.orderBy(eventCategories.id);
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
    const requestBody = await request.json();
    const { name, description, color } = requestBody;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!color) {
      return NextResponse.json({ 
        error: "Color is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate hex color format
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexColorRegex.test(color)) {
      return NextResponse.json({ 
        error: "Color must be a valid hex color format (#RRGGBB)",
        code: "INVALID_COLOR_FORMAT" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedDescription = description ? description.trim() : null;
    const sanitizedColor = color.trim().toUpperCase();

    // Check for duplicate name
    const existing = await db.select()
      .from(eventCategories)
      .where(eq(eventCategories.name, sanitizedName))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ 
        error: "A category with this name already exists",
        code: "DUPLICATE_NAME" 
      }, { status: 400 });
    }

    const newCategory = await db.insert(eventCategories)
      .values({
        name: sanitizedName,
        description: sanitizedDescription,
        color: sanitizedColor
      })
      .returning();

    return NextResponse.json(newCategory[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: "A category with this name already exists",
        code: "DUPLICATE_NAME" 
      }, { status: 400 });
    }
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
    const { name, description, color } = requestBody;

    // Check if record exists
    const existing = await db.select()
      .from(eventCategories)
      .where(eq(eventCategories.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Category not found' 
      }, { status: 404 });
    }

    // Prepare update data
    const updates: any = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({ 
          error: "Name cannot be empty",
          code: "INVALID_NAME" 
        }, { status: 400 });
      }

      const sanitizedName = name.trim();
      
      // Check for duplicate name (excluding current record)
      const duplicateCheck = await db.select()
        .from(eventCategories)
        .where(and(
          eq(eventCategories.name, sanitizedName),
          eq(eventCategories.id, parseInt(id))
        ))
        .limit(1);

      if (duplicateCheck.length === 0) {
        const nameExists = await db.select()
          .from(eventCategories)
          .where(eq(eventCategories.name, sanitizedName))
          .limit(1);

        if (nameExists.length > 0) {
          return NextResponse.json({ 
            error: "A category with this name already exists",
            code: "DUPLICATE_NAME" 
          }, { status: 400 });
        }
      }

      updates.name = sanitizedName;
    }

    if (description !== undefined) {
      updates.description = description ? description.trim() : null;
    }

    if (color !== undefined) {
      if (!color.trim()) {
        return NextResponse.json({ 
          error: "Color cannot be empty",
          code: "INVALID_COLOR" 
        }, { status: 400 });
      }

      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!hexColorRegex.test(color.trim())) {
        return NextResponse.json({ 
          error: "Color must be a valid hex color format (#RRGGBB)",
          code: "INVALID_COLOR_FORMAT" 
        }, { status: 400 });
      }

      updates.color = color.trim().toUpperCase();
    }

    const updated = await db.update(eventCategories)
      .set(updates)
      .where(eq(eventCategories.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Category not found' 
      }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT error:', error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: "A category with this name already exists",
        code: "DUPLICATE_NAME" 
      }, { status: 400 });
    }
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

    // Check if record exists
    const existing = await db.select()
      .from(eventCategories)
      .where(eq(eventCategories.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Category not found' 
      }, { status: 404 });
    }

    const deleted = await db.delete(eventCategories)
      .where(eq(eventCategories.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Category not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Category deleted successfully',
      deletedCategory: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}