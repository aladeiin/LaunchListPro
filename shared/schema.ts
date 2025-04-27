import { pgTable, text, serial, integer, boolean, doublePrecision, jsonb, timestamp } from "drizzle-orm/pg-core";
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

// Blog articles schema
export const blogArticles = pgTable("blog_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url").notNull().default(""),
  author: text("author").notNull(),
  authorTitle: text("author_title").notNull().default(""),
  source: text("source").notNull(),
  sourceUrl: text("source_url").notNull(),
  topics: text("topics").array().notNull().default([]),
  publishedAt: text("published_at").notNull(),
  createdAt: text("created_at").notNull()
});

export const insertBlogArticleSchema = createInsertSchema(blogArticles).omit({
  id: true,
  createdAt: true
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertBlogArticle = z.infer<typeof insertBlogArticleSchema>;
export type BlogArticle = typeof blogArticles.$inferSelect;

// Merchant applications schema
export const merchantApplications = pgTable("merchant_applications", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull(),
  ownerName: text("owner_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  businessType: text("business_type").notNull(),
  // Bank details
  accountHolderName: text("account_holder_name").notNull(),
  accountNumber: text("account_number").notNull(),
  ifscCode: text("ifsc_code").notNull(),
  bankName: text("bank_name").notNull(),
  bankBranch: text("bank_branch").notNull(),
  // Business details
  productCategories: text("product_categories").array().notNull(),
  gstNumber: text("gst_number"),
  drugLicenseNumber: text("drug_license_number").notNull(),
  // File uploads (stored as paths)
  fileUploads: jsonb("file_uploads").notNull().default({}),
  // Additional info
  description: text("description"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertMerchantApplicationSchema = createInsertSchema(merchantApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertMerchantApplication = z.infer<typeof insertMerchantApplicationSchema>;
export type MerchantApplication = typeof merchantApplications.$inferSelect;
