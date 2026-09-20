import { sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core';
export const progress = sqliteTable('progress', {
  userId:text('user_id').notNull(),
  activityId:text('activity_id').notNull(),
  completedAt:text('completed_at').notNull(),
}, table=>[primaryKey({columns:[table.userId,table.activityId]})]);
