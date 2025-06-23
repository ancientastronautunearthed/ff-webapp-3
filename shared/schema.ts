import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  displayName: text("display_name"),
  researchOptIn: boolean("research_opt_in").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const symptomEntries = pgTable("symptom_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  date: timestamp("date").notNull(),
  symptoms: jsonb("symptoms").notNull(), // Will store structured symptom data
  factors: jsonb("factors").notNull(), // Will store tracked factors/triggers
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const journalEntries = pgTable("journal_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mediaUrls: jsonb("media_urls").default([]), // Firebase Storage URLs
  linkedSymptomEntry: uuid("linked_symptom_entry").references(() => symptomEntries.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const forumPosts = pgTable("forum_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isModerated: boolean("is_moderated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const forumReplies = pgTable("forum_replies", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => forumPosts.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isModerated: boolean("is_moderated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const researchData = pgTable("research_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  anonymizedData: jsonb("anonymized_data").notNull(),
  dataType: text("data_type").notNull(), // 'symptom_trends', 'factor_correlations', etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firebaseUid: true,
  displayName: true,
  researchOptIn: true,
});

export const insertSymptomEntrySchema = createInsertSchema(symptomEntries).pick({
  userId: true,
  date: true,
  symptoms: true,
  factors: true,
  notes: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  userId: true,
  title: true,
  content: true,
  mediaUrls: true,
  linkedSymptomEntry: true,
});

export const insertForumPostSchema = createInsertSchema(forumPosts).pick({
  userId: true,
  category: true,
  title: true,
  content: true,
});

export const insertForumReplySchema = createInsertSchema(forumReplies).pick({
  postId: true,
  userId: true,
  content: true,
});

// Types
export const insertResearchConsentSchema = createInsertSchema(researchConsent).pick({
  userId: true,
  generalResearchConsent: true,
  symptomDataConsent: true,
  journalDataConsent: true,
  demographicDataConsent: true,
  treatmentDataConsent: true,
  locationDataConsent: true,
  dataRetentionYears: true,
  allowDataSharing: true,
  allowCommercialUse: true,
});

export const insertResearchStudySchema = createInsertSchema(researchStudies).pick({
  title: true,
  description: true,
  principalInvestigator: true,
  institution: true,
  approvalNumber: true,
  studyType: true,
  dataRequirements: true,
  inclusionCriteria: true,
  exclusionCriteria: true,
  estimatedDuration: true,
  compensationOffered: true,
  compensationDetails: true,
  contactEmail: true,
  startDate: true,
  endDate: true,
});

export const insertUserStudyParticipationSchema = createInsertSchema(userStudyParticipation).pick({
  userId: true,
  studyId: true,
  participationStatus: true,
  withdrawalReason: true,
  notes: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSymptomEntry = z.infer<typeof insertSymptomEntrySchema>;
export type SymptomEntry = typeof symptomEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertResearchConsent = z.infer<typeof insertResearchConsentSchema>;
export type ResearchConsent = typeof researchConsent.$inferSelect;
export type InsertResearchStudy = z.infer<typeof insertResearchStudySchema>;
export type ResearchStudy = typeof researchStudies.$inferSelect;
export type InsertUserStudyParticipation = z.infer<typeof insertUserStudyParticipationSchema>;
export type UserStudyParticipation = typeof userStudyParticipation.$inferSelect;
