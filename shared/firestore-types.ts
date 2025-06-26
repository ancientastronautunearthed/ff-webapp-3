import { z } from "zod";
import { Timestamp } from "firebase/firestore";

// Firestore User Interface
export interface FirestoreUser {
  email: string;
  name: string;
  firebaseUid: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Medical Profile (embedded)
  medicalProfile?: {
    // Demographics
    age: number;
    gender: string;
    ethnicity: string;
    location: {
      state: string;
      country: string;
      zipCode?: string;
    };
    
    // Medical History
    symptomsOnset: string; // Year
    diagnosisHistory: string[];
    currentTreatments: string[];
    medicationsUsed: string[];
    allergies: string[];
    otherConditions: string[];
    
    // Lifestyle
    dietType: string;
    exerciseLevel: string;
    sleepPattern: string;
    stressLevel: number; // 1-10
    environmentalFactors: string[];
    workStatus: string;
    
    // Research Consent
    researchOptIn: boolean;
    consentData: {
      symptoms: boolean;
      treatments: boolean;
      lifestyle: boolean;
      demographics: boolean;
      environmental: boolean;
    };
  };
  
  // Gamification
  points: number;
  level: number;
  streak: {
    current: number;
    longest: number;
    lastActivity: Timestamp;
  };
  
  // AI Companion
  companionData?: {
    name: string;
    personality: string;
    appearance: string;
    tier: number;
    imageUrl?: string;
    createdAt: Timestamp;
  };
}

// Firestore Symptom Entry Interface
export interface FirestoreSymptomEntry {
  userId: string;
  date: Timestamp;
  
  // Core symptoms with severity
  symptoms: {
    type: string;
    severity: number; // 1-10
    location?: string;
    description?: string;
  }[];
  
  // Tracking factors
  factors: {
    sleepHours: number;
    stressLevel: number; // 1-10
    dietFactors: string[];
    customDiet?: string;
    environmentalFactors: string[];
    customEnvironmental?: string;
    weatherConditions?: string;
  };
  
  notes?: string;
  
  // AI Analysis (populated by Cloud Functions)
  aiAnalysis?: {
    patterns: string[];
    correlations: string[];
    recommendations: string[];
    confidence: number;
    analysisDate: Timestamp;
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Firestore Journal Entry Interface
export interface FirestoreJournalEntry {
  userId: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  mood?: string;
  painLevel?: number; // 0-10
  sleepQuality?: string;
  tags: string[];
  isPrivate: boolean;
  
  // Media attachments (Firebase Storage URLs)
  photos: string[];
  
  // AI Analysis
  aiAnalysis?: {
    sentiment: string;
    keyThemes: string[];
    insights: string[];
    analysisDate: Timestamp;
  };
}

// Firestore Forum Post Interface
export interface FirestoreForumPost {
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isAnonymous: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Engagement metrics
  likes: number;
  likedBy: string[]; // Array of user IDs
  replyCount: number;
  viewCount: number;
  
  // Moderation
  isModerated: boolean;
  moderationFlags: string[];
}

// Firestore Forum Reply Interface
export interface FirestoreForumReply {
  authorId: string;
  authorName: string;
  content: string;
  isAnonymous: boolean;
  createdAt: Timestamp;
  
  // Engagement
  likes: number;
  likedBy: string[];
  
  // Threading (for nested replies)
  parentReplyId?: string;
}

// Firestore AI Companion Interface
export interface FirestoreAICompanion {
  userId: string;
  name: string;
  personality: {
    traits: string[];
    communicationStyle: string;
    supportStyle: string;
    specialties: string[];
  };
  
  appearance: {
    description: string;
    imageUrl?: string;
    style: string;
  };
  
  tier: number;
  experience: number;
  
  // Learning and memory
  knowledgeBase: {
    userPatterns: Record<string, any>;
    preferences: Record<string, any>;
    conversationHistory: any[];
    insights: string[];
    learningProgress: number;
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Firestore Chat Message Interface
export interface FirestoreChatMessage {
  userId: string;
  companionId: string;
  content: string;
  sender: 'user' | 'companion';
  timestamp: Timestamp;
  
  // Message metadata
  messageType: 'text' | 'insight' | 'recommendation' | 'analysis';
  context?: {
    relatedSymptoms?: string[];
    triggerEvent?: string;
    analysisData?: any;
  };
  
  // Voice synthesis
  voiceEnabled: boolean;
  voiceStyle?: string;
}

// Firestore Doctor Interface
export interface FirestoreDoctor {
  firebaseUid: string;
  email: string;
  name: string;
  createdAt: Timestamp;
  
  credentials: {
    medicalLicense: string;
    licenseState: string;
    licenseExpiry: Timestamp;
    boardCertifications: string[];
    medicalSchool: string;
    graduationYear: number;
    residency: string;
    fellowship?: string;
    yearsExperience: number;
    npiNumber?: string;
    deaNumber?: string;
  };
  
  practice: {
    specialties: string[];
    hospitalAffiliations: string[];
    officeAddress: string;
    phone: string;
    acceptsInsurance: string[];
    telehealth: boolean;
    morgellonsExperience: number;
    languages: string[];
  };
  
  verification: {
    verified: boolean;
    verificationDate?: Timestamp;
    verificationNotes?: string;
  };
  
  profile: {
    bio: string;
    profileImageUrl?: string;
    consultationFee: number;
    availability: Record<string, any>;
  };
}

// Firestore Peer Connection Interface
export interface FirestorePeerConnection {
  userId1: string;
  userId2: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  initiatedBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  matchingCriteria: {
    sharedSymptoms: string[];
    compatibilityScore: number;
    commonInterests: string[];
    supportNeeds: string[];
  };
  
  connectionData: {
    lastMessage?: Timestamp;
    totalMessages: number;
    supportProvided: number;
    supportReceived: number;
  };
}

// Firestore Peer Message Interface
export interface FirestorePeerMessage {
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Timestamp;
  
  messageType: 'text' | 'support' | 'crisis' | 'celebration';
  isRead: boolean;
  supportTags?: string[];
  
  // Moderation
  isFlagged: boolean;
  flagReason?: string;
}

// Firestore Gamification Interface
export interface FirestoreGamification {
  userId: string;
  points: number;
  level: number;
  experience: number;
  
  streaks: {
    daily: number;
    weekly: number;
    longest: number;
    lastActivity: Timestamp;
  };
  
  achievements: {
    id: string;
    name: string;
    description: string;
    unlockedAt: Timestamp;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  }[];
  
  challenges: {
    active: any[];
    completed: any[];
    totalCompleted: number;
  };
  
  updatedAt: Timestamp;
}

// Zod schemas for validation
export const FirestoreUserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  firebaseUid: z.string(),
  medicalProfile: z.object({
    age: z.number(),
    gender: z.string(),
    ethnicity: z.string(),
    location: z.object({
      state: z.string(),
      country: z.string(),
      zipCode: z.string().optional(),
    }),
    symptomsOnset: z.string(),
    diagnosisHistory: z.array(z.string()),
    currentTreatments: z.array(z.string()),
    medicationsUsed: z.array(z.string()),
    allergies: z.array(z.string()),
    otherConditions: z.array(z.string()),
    dietType: z.string(),
    exerciseLevel: z.string(),
    sleepPattern: z.string(),
    stressLevel: z.number().min(1).max(10),
    environmentalFactors: z.array(z.string()),
    workStatus: z.string(),
    researchOptIn: z.boolean(),
    consentData: z.object({
      symptoms: z.boolean(),
      treatments: z.boolean(),
      lifestyle: z.boolean(),
      demographics: z.boolean(),
      environmental: z.boolean(),
    }),
  }).optional(),
  points: z.number().default(0),
  level: z.number().default(1),
});

export const FirestoreSymptomEntrySchema = z.object({
  userId: z.string(),
  symptoms: z.array(z.object({
    type: z.string(),
    severity: z.number().min(1).max(10),
    location: z.string().optional(),
    description: z.string().optional(),
  })),
  factors: z.object({
    sleepHours: z.number(),
    stressLevel: z.number().min(1).max(10),
    dietFactors: z.array(z.string()),
    customDiet: z.string().optional(),
    environmentalFactors: z.array(z.string()),
    customEnvironmental: z.string().optional(),
    weatherConditions: z.string().optional(),
  }),
  notes: z.string().optional(),
});

export const FirestoreJournalEntrySchema = z.object({
  userId: z.string(),
  title: z.string(),
  content: z.string(),
  mood: z.string().optional(),
  painLevel: z.number().min(0).max(10).optional(),
  sleepQuality: z.string().optional(),
  tags: z.array(z.string()),
  isPrivate: z.boolean().default(true),
  photos: z.array(z.string()).default([]),
});

export const FirestoreForumPostSchema = z.object({
  authorId: z.string(),
  authorName: z.string(),
  title: z.string(),
  content: z.string(),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  isAnonymous: z.boolean().default(false),
});

export const FirestoreAICompanionSchema = z.object({
  userId: z.string(),
  name: z.string(),
  personality: z.object({
    traits: z.array(z.string()),
    communicationStyle: z.string(),
    supportStyle: z.string(),
    specialties: z.array(z.string()),
  }),
  appearance: z.object({
    description: z.string(),
    imageUrl: z.string().optional(),
    style: z.string(),
  }),
  tier: z.number().default(1),
  experience: z.number().default(0),
});

// Export types (already exported above as interfaces)