import { pgTable, text, serial, integer, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Waitlist users schema
export const waitlistUsers = pgTable("waitlist_users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  reason: text("reason").notNull().default(""),
  agreedToTerms: boolean("agreed_to_terms").notNull().default(false),
  createdAt: text("created_at").notNull()
});

export const insertWaitlistUserSchema = createInsertSchema(waitlistUsers).omit({
  id: true,
  createdAt: true
});

// Medicine schema
export const medicines = pgTable("medicines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  genericName: text("generic_name").notNull(),
  description: text("description").notNull(),
  manufacturer: text("manufacturer").notNull(),
  isGeneric: boolean("is_generic").notNull(),
  price: doublePrecision("price").notNull(),
  dosage: text("dosage").notNull(),
  activeIngredient: text("active_ingredient").notNull(),
  imageUrl: text("image_url").notNull().default(""),
  availableAt: text("available_at").array().notNull().default([]),
  inStock: boolean("in_stock").notNull().default(false),
  stockCount: integer("stock_count").notNull().default(0)
});

export const insertMedicineSchema = createInsertSchema(medicines).omit({
  id: true
});

// Chat messages schema
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  message: text("message").notNull(),
  isUserMessage: boolean("is_user_message").notNull(),
  createdAt: text("created_at").notNull()
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true
});

// Types
export type InsertWaitlistUser = z.infer<typeof insertWaitlistUserSchema>;
export type WaitlistUser = typeof waitlistUsers.$inferSelect;

export type InsertMedicine = z.infer<typeof insertMedicineSchema>;
export type Medicine = typeof medicines.$inferSelect & {
  similarityScore?: number;
};

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
