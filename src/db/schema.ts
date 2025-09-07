import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('user'),
  avatarUrl: text('avatar_url'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  venue: text('venue').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  bannerImageUrl: text('banner_image_url'),
  maxAttendees: integer('max_attendees').notNull(),
  organizerId: integer('organizer_id').references(() => users.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

export const registrations = sqliteTable('registrations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  eventId: integer('event_id').references(() => events.id),
  registeredAt: text('registered_at').notNull(),
  attendanceStatus: text('attendance_status').notNull().default('pending'),
});

export const eventCategories = sqliteTable('event_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description'),
  color: text('color').notNull(),
});

export const eventCategoryMappings = sqliteTable('event_category_mappings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id').references(() => events.id),
  categoryId: integer('category_id').references(() => eventCategories.id),
});