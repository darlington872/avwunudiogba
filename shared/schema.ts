import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  balance: doublePrecision("balance").default(0).notNull(),
  referralWalletBalance: doublePrecision("referral_wallet_balance").default(0).notNull(),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: text("referred_by"),
  referralCount: integer("referral_count").default(0).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  isBanned: boolean("is_banned").default(false).notNull(),
  kycStatus: text("kyc_status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users)
  .omit({
    id: true,
    referralCount: true,
    isAdmin: true,
    isVerified: true,
    isBanned: true,
    balance: true,
    referralWalletBalance: true,
    createdAt: true,
    kycStatus: true,
    referralCode: true
  })
  .extend({
    referredBy: z.string().optional(),
    kycStatus: z.enum(["pending", "approved", "rejected"]).optional()
  });

// Service types for messaging apps
export const serviceTypes = [
  "WhatsApp",
  "Telegram",
  "Signal",
  "WeChat",
  "Facebook",
  "Viber",
  "Line"
] as const;

// Phone Number schema
export const phoneNumbers = pgTable("phone_numbers", {
  id: serial("id").primaryKey(),
  number: text("number").notNull().unique(),
  country: text("country").notNull(),
  service: text("service").notNull().default("WhatsApp"),
  price: doublePrecision("price").notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  stockCount: integer("stock_count").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPhoneNumberSchema = createInsertSchema(phoneNumbers)
  .omit({
    id: true,
    isAvailable: true,
    createdAt: true
  })
  .extend({
    service: z.enum(serviceTypes),
    stockCount: z.number().int().min(1).optional(),
  });

// Order schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  phoneNumberId: integer("phone_number_id").notNull(),
  status: text("status").default("pending").notNull(),
  paymentMethod: text("payment_method").notNull(),
  totalAmount: doublePrecision("total_amount").notNull(),
  isReferralReward: boolean("is_referral_reward").default(false).notNull(),
  code: text("code"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  status: true,
  code: true,
  createdAt: true,
  updatedAt: true
});

// Payment schema
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  orderId: integer("order_id"),
  amount: doublePrecision("amount").notNull(),
  method: text("method").notNull(),
  status: text("status").default("pending").notNull(),
  reference: text("reference"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true
});

// KYC schema
export const kyc = pgTable("kyc", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  fullName: text("full_name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  idType: text("id_type").notNull(),
  idFront: text("id_front").notNull(),
  idBack: text("id_back").notNull(),
  selfie: text("selfie").notNull(),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertKycSchema = createInsertSchema(kyc).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true
});

// Settings schema
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

// Activity schema for tracking user actions
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true
});

// Marketplace Products schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  category: text("category").notNull(),
  images: text("images").array().notNull(),
  status: text("status").default("active").notNull(),
  isAdminApproved: boolean("is_admin_approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  isAdminApproved: true,
  status: true,
  createdAt: true,
  updatedAt: true
});

// Services schema (WhatsApp, Telegram, etc.)
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  isActive: true,
  createdAt: true
});

// Countries schema
export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  flag: text("flag").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCountrySchema = createInsertSchema(countries).omit({
  id: true,
  isActive: true,
  createdAt: true
});

// Customer Service AI Chats
export const aiChats = pgTable("ai_chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  message: text("message").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiChatSchema = createInsertSchema(aiChats).omit({
  id: true,
  createdAt: true
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type PhoneNumber = typeof phoneNumbers.$inferSelect;
export type InsertPhoneNumber = z.infer<typeof insertPhoneNumberSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Kyc = typeof kyc.$inferSelect;
export type InsertKyc = z.infer<typeof insertKycSchema>;

export type Setting = typeof settings.$inferSelect;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Country = typeof countries.$inferSelect;
export type InsertCountry = z.infer<typeof insertCountrySchema>;

export type AiChat = typeof aiChats.$inferSelect;
export type InsertAiChat = z.infer<typeof insertAiChatSchema>;
