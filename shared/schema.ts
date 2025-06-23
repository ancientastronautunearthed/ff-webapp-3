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

export const researchConsent = pgTable("research_consent", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  generalResearchConsent: boolean("general_research_consent").default(false).notNull(),
  symptomDataConsent: boolean("symptom_data_consent").default(false).notNull(),
  journalDataConsent: boolean("journal_data_consent").default(false).notNull(),
  demographicDataConsent: boolean("demographic_data_consent").default(false).notNull(),
  treatmentDataConsent: boolean("treatment_data_consent").default(false).notNull(),
  locationDataConsent: boolean("location_data_consent").default(false).notNull(),
  dataRetentionYears: integer("data_retention_years").default(5).notNull(),
  allowDataSharing: boolean("allow_data_sharing").default(false).notNull(),
  allowCommercialUse: boolean("allow_commercial_use").default(false).notNull(),
  consentDate: timestamp("consent_date").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const medicalProfiles = pgTable("medical_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  // Demographics
  ageRange: text("age_range").notNull(), // "18-25", "26-35", etc.
  gender: text("gender"),
  ethnicity: text("ethnicity"),
  education: text("education"),
  occupation: text("occupation"),
  // Geographic
  country: text("country").notNull(),
  state: text("state"),
  zipCode: text("zip_code"), // First 3 digits only for privacy
  climateZone: text("climate_zone"),
  // Medical History
  diagnosisYear: integer("diagnosis_year"),
  initialSymptoms: text("initial_symptoms").array(),
  currentSymptoms: text("current_symptoms").array(),
  symptomSeverity: integer("symptom_severity"), // 1-10 scale
  otherConditions: text("other_conditions").array(),
  allergies: text("allergies").array(),
  medications: text("medications").array(),
  // Lifestyle
  smokingStatus: text("smoking_status"), // never, former, current
  alcoholUse: text("alcohol_use"), // none, occasional, regular, heavy
  exerciseFrequency: text("exercise_frequency"),
  dietType: text("diet_type"),
  stressLevel: integer("stress_level"), // 1-10 scale
  sleepQuality: integer("sleep_quality"), // 1-10 scale
  // Environmental
  livingEnvironment: text("living_environment"), // urban, suburban, rural
  waterSource: text("water_source"), // municipal, well, bottled
  housingType: text("housing_type"),
  petExposure: boolean("pet_exposure").default(false),
  chemicalExposure: text("chemical_exposure").array(),
  // Research specific
  willingToParticipate: boolean("willing_to_participate").default(false),
  preferredContactMethod: text("preferred_contact_method"),
  availabilityForStudies: text("availability_for_studies"),
  compensationPreference: text("compensation_preference"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const researchData = pgTable("research_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  anonymizedData: jsonb("anonymized_data").notNull(),
  dataType: text("data_type").notNull(), // 'symptom_trends', 'factor_correlations', etc.
  createdAt: timestamp("created_at").defaultNow(),
  consentId: text("consent_id").references(() => researchConsent.id),
  studyId: text("study_id"),
  expiresAt: timestamp("expires_at"),
});

export const researchStudies = pgTable("research_studies", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  principalInvestigator: text("principal_investigator").notNull(),
  institution: text("institution").notNull(),
  approvalNumber: text("approval_number"),
  studyType: text("study_type").notNull(),
  dataRequirements: jsonb("data_requirements").notNull(),
  inclusionCriteria: text("inclusion_criteria").array(),
  exclusionCriteria: text("exclusion_criteria").array(),
  estimatedDuration: text("estimated_duration"),
  compensationOffered: boolean("compensation_offered").default(false),
  compensationDetails: text("compensation_details"),
  contactEmail: text("contact_email").notNull(),
  status: text("status").default("active").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userStudyParticipation = pgTable("user_study_participation", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  studyId: text("study_id").notNull().references(() => researchStudies.id),
  participationStatus: text("participation_status").default("invited").notNull(),
  enrolledAt: timestamp("enrolled_at"),
  completedAt: timestamp("completed_at"),
  withdrawnAt: timestamp("withdrawn_at"),
  withdrawalReason: text("withdrawal_reason"),
  dataContributed: boolean("data_contributed").default(false),
  lastDataContribution: timestamp("last_data_contribution"),
  notes: text("notes"),
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
export const insertMedicalProfileSchema = createInsertSchema(medicalProfiles).pick({
  userId: true,
  ageRange: true,
  gender: true,
  ethnicity: true,
  education: true,
  occupation: true,
  country: true,
  state: true,
  zipCode: true,
  climateZone: true,
  diagnosisYear: true,
  initialSymptoms: true,
  currentSymptoms: true,
  symptomSeverity: true,
  otherConditions: true,
  allergies: true,
  medications: true,
  smokingStatus: true,
  alcoholUse: true,
  exerciseFrequency: true,
  dietType: true,
  stressLevel: true,
  sleepQuality: true,
  livingEnvironment: true,
  waterSource: true,
  housingType: true,
  petExposure: true,
  chemicalExposure: true,
  willingToParticipate: true,
  preferredContactMethod: true,
  availabilityForStudies: true,
  compensationPreference: true,
});

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
export type InsertMedicalProfile = z.infer<typeof insertMedicalProfileSchema>;
export type MedicalProfile = typeof medicalProfiles.$inferSelect;
export type InsertResearchConsent = z.infer<typeof insertResearchConsentSchema>;
export type ResearchConsent = typeof researchConsent.$inferSelect;
export type InsertResearchStudy = z.infer<typeof insertResearchStudySchema>;
export type ResearchStudy = typeof researchStudies.$inferSelect;
export type InsertUserStudyParticipation = z.infer<typeof insertUserStudyParticipationSchema>;
export type UserStudyParticipation = typeof userStudyParticipation.$inferSelect;
