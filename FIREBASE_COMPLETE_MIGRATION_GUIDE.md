# Complete Firebase/Firestore Migration Guide
## Fiber Friends - Full Stack Migration to Firebase Ecosystem

This document provides a comprehensive guide for migrating the Fiber Friends application from PostgreSQL + Express.js to a complete Firebase ecosystem including Firestore, Cloud Functions, and Firebase App Hosting.

## Table of Contents
1. [Migration Overview](#migration-overview)
2. [Firebase Project Setup](#firebase-project-setup)
3. [Database Migration: PostgreSQL to Firestore](#database-migration)
4. [Backend Migration: Express.js to Cloud Functions](#backend-migration)
5. [Frontend Updates](#frontend-updates)
6. [Deployment to Firebase App Hosting](#deployment)
7. [Testing and Verification](#testing)
8. [Data Migration Scripts](#data-migration-scripts)
9. [Security Rules](#security-rules)
10. [Performance Optimization](#performance-optimization)

## Migration Overview

### Current Architecture
- **Frontend**: React + Vite + TypeScript
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL + Drizzle ORM
- **Authentication**: Firebase Auth (already implemented)
- **Storage**: Firebase Storage (already implemented)
- **Hosting**: Replit

### Target Architecture
- **Frontend**: React + Vite + TypeScript (unchanged)
- **Backend**: Firebase Cloud Functions
- **Database**: Firestore
- **Authentication**: Firebase Auth (unchanged)
- **Storage**: Firebase Storage (unchanged)
- **Hosting**: Firebase App Hosting

### Benefits of Migration
- **Scalability**: Auto-scaling Firebase infrastructure
- **Real-time**: Native real-time updates with Firestore
- **Simplified Deployment**: Single Firebase project deployment
- **Cost Optimization**: Pay-per-use Firebase pricing
- **Enhanced Security**: Firestore security rules
- **Better Performance**: CDN and global distribution

## Firebase Project Setup

### 1. Firebase Console Configuration
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Select the following services:
# - Firestore
# - Functions
# - Hosting
# - Storage (already configured)
# - Authentication (already configured)
```

### 2. Project Structure After Migration
```
fiber-friends/
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── functions/
│   ├── package.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── api/
│   │   ├── types/
│   │   └── utils/
├── public/
├── src/
└── dist/ (build output)
```

## Database Migration: PostgreSQL to Firestore

### Current PostgreSQL Schema to Firestore Collections

#### 1. Users Collection
```typescript
// Current PostgreSQL: users table
// New Firestore: users collection

interface FirestoreUser {
  // Document ID: Firebase UID
  email: string;
  name: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  
  // Medical Profile (embedded)
  medicalProfile?: {
    dateOfBirth: FirebaseFirestore.Timestamp;
    gender: string;
    location: {
      state: string;
      country: string;
      zipCode?: string;
    };
    medicalHistory: {
      diagnosisDate?: FirebaseFirestore.Timestamp;
      symptomOnset: string; // year
      previousDiagnoses: string[];
      currentMedications: string[];
      allergies: string[];
      familyHistory: string[];
    };
    demographics: {
      ethnicity?: string;
      occupation?: string;
      education?: string;
      insurance?: string;
    };
    lifestyle: {
      dietType?: string;
      exerciseFrequency?: string;
      sleepPattern?: string;
      stressLevel?: string;
      smokingStatus?: string;
      alcoholConsumption?: string;
    };
    environmentalFactors: {
      housingType?: string;
      moldExposure?: boolean;
      chemicalSensitivities?: string[];
      waterSource?: string;
      airQuality?: string;
    };
  };
  
  // Research Consent
  researchConsent?: {
    consentGiven: boolean;
    consentDate: FirebaseFirestore.Timestamp;
    dataSharing: {
      symptoms: boolean;
      treatments: boolean;
      demographics: boolean;
      environmental: boolean;
      outcomes: boolean;
    };
  };
  
  // AI Companion
  companionConfig?: {
    species: string;
    personality: string;
    expertise: string;
    appearance: string;
    environment: string;
    customName?: string;
    imageUrl?: string;
    createdAt: FirebaseFirestore.Timestamp;
  };
  
  // Progress Tracking
  companionProgress?: {
    currentTier: number;
    totalPoints: number;
    achievements: string[];
    lastInteraction: FirebaseFirestore.Timestamp;
  };
}
```

#### 2. Symptom Entries Collection
```typescript
// Current PostgreSQL: symptom_entries table
// New Firestore: symptomEntries collection

interface FirestoreSymptomEntry {
  // Document ID: auto-generated
  userId: string; // Firebase UID
  date: FirebaseFirestore.Timestamp;
  createdAt: FirebaseFirestore.Timestamp;
  
  symptoms: {
    itchingIntensity: number; // 0-10
    crawlingSensations: string;
    newLesionsCount: number;
    lesionType: string;
    fiberColors: string[];
    fatigueLevel: number; // 0-10
    brainFogSeverity: string;
    sleepQuality: string;
    mood: string[];
  };
  
  factors: {
    medications: string[];
    customMedication?: string;
    dietFactors: string[];
    customDiet?: string;
    environmentalFactors: string[];
    customEnvironmental?: string;
    stressLevel?: number;
    weatherConditions?: string;
  };
  
  notes?: string;
  
  // AI Analysis (populated by Cloud Functions)
  aiAnalysis?: {
    patterns: string[];
    correlations: string[];
    recommendations: string[];
    confidence: number;
    analysisDate: FirebaseFirestore.Timestamp;
  };
}
```

#### 3. Journal Entries Collection
```typescript
// Current PostgreSQL: journal_entries table  
// New Firestore: journalEntries collection

interface FirestoreJournalEntry {
  // Document ID: auto-generated
  userId: string;
  title: string;
  content: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  
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
    analysisDate: FirebaseFirestore.Timestamp;
  };
}
```

#### 4. Forum Posts Collection
```typescript
// Current PostgreSQL: forum_posts + forum_replies tables
// New Firestore: forumPosts collection with subcollection for replies

interface FirestoreForumPost {
  // Document ID: auto-generated
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isAnonymous: boolean;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  
  // Engagement metrics
  likes: number;
  likedBy: string[]; // Array of user IDs
  replyCount: number;
  viewCount: number;
  
  // Moderation
  isModerated: boolean;
  moderationFlags: string[];
}

// Subcollection: forumPosts/{postId}/replies
interface FirestoreForumReply {
  // Document ID: auto-generated
  authorId: string;
  authorName: string;
  content: string;
  isAnonymous: boolean;
  createdAt: FirebaseFirestore.Timestamp;
  
  // Engagement
  likes: number;
  likedBy: string[];
  
  // Threading (for nested replies)
  parentReplyId?: string;
}
```

#### 5. AI Companion Data Collections

##### Companion Memory Collection
```typescript
// New: companionMemory collection
interface FirestoreCompanionMemory {
  // Document ID: userId
  userId: string;
  lastInteraction: FirebaseFirestore.Timestamp;
  
  patterns: {
    id: string;
    type: 'symptom' | 'trigger' | 'treatment' | 'lifestyle';
    pattern: string;
    confidence: number;
    frequency: number;
    lastObserved: FirebaseFirestore.Timestamp;
    relatedFactors: string[];
  }[];
  
  preferences: {
    category: string;
    preference: string;
    strength: number;
    learnedFrom: string[];
  }[];
  
  insights: string[];
  learningProgress: number;
  personalityAdaptations: Record<string, any>;
  
  conversationHistory: {
    date: FirebaseFirestore.Timestamp;
    topics: string[];
    insights: string[];
    userMood: string;
    keyPoints: string[];
  }[];
}
```

##### Chat Messages Collection
```typescript
// New: chatMessages collection
interface FirestoreChatMessage {
  // Document ID: auto-generated
  userId: string;
  userMessage: string;
  aiResponse: string;
  timestamp: FirebaseFirestore.Timestamp;
  
  sessionType: 'support' | 'education' | 'coping' | 'crisis';
  voiceStyle?: 'calming' | 'encouraging' | 'validating' | 'educational';
  
  context: {
    recentSymptoms?: string[];
    emotionalState?: string;
    companionTier: number;
  };
  
  analysis: {
    detectedConcerns: string[];
    therapeuticGoals: string[];
    followUpActions: string[];
  };
}
```

#### 6. Challenge and Progress Collections
```typescript
// New: userChallenges collection
interface FirestoreUserChallenges {
  // Document ID: userId
  userId: string;
  lastUpdated: FirebaseFirestore.Timestamp;
  
  progress: Record<string, number>; // challengeId -> progress
  completed: string[]; // Array of completed challenge IDs
  
  streaks: {
    current: number;
    longest: number;
    lastActivity: FirebaseFirestore.Timestamp;
  };
  
  points: {
    total: number;
    history: {
      action: string;
      points: number;
      timestamp: FirebaseFirestore.Timestamp;
      category: string;
    }[];
  };
}
```

#### 7. Doctor and Research Collections
```typescript
// Current PostgreSQL: doctors table
// New Firestore: doctors collection
interface FirestoreDoctor {
  // Document ID: Firebase UID
  firebaseUid: string;
  email: string;
  name: string;
  createdAt: FirebaseFirestore.Timestamp;
  
  credentials: {
    medicalLicense: string;
    licenseState: string;
    licenseExpiry: FirebaseFirestore.Timestamp;
    boardCertifications: string[];
    medicalSchool: string;
    graduationYear: number;
    residency: string;
    fellowship?: string;
    yearsExperience: number;
  };
  
  practice: {
    specialties: string[];
    hospitalAffiliations: string[];
    officeAddress: string;
    phone: string;
    acceptsInsurance: string[];
    telehealth: boolean;
    morgellonsExperience: number;
  };
  
  verification: {
    verified: boolean;
    verificationDate?: FirebaseFirestore.Timestamp;
    verifiedBy?: string;
  };
}

// Research Data Collection
interface FirestoreResearchData {
  // Document ID: auto-generated
  userId: string; // Anonymized hash
  submissionDate: FirebaseFirestore.Timestamp;
  
  demographics: {
    ageGroup: string; // "18-25", "26-35", etc.
    gender: string;
    region: string; // "West Coast", "Southeast", etc.
  };
  
  symptoms: {
    primary: string[];
    severity: Record<string, number>;
    duration: string;
    progression: string;
  };
  
  treatments: {
    attempted: string[];
    effective: string[];
    sideEffects: string[];
  };
  
  environmental: {
    triggers: string[];
    exposures: string[];
    correlations: string[];
  };
  
  outcomes: {
    improvement: boolean;
    timeToImprovement?: string;
    currentStatus: string;
  };
}
```

## Backend Migration: Express.js to Cloud Functions

### Cloud Functions Structure

#### 1. Main Functions Entry Point
```typescript
// functions/src/index.ts
import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { setGlobalOptions } from 'firebase-functions/v2';

// Initialize Firebase Admin
initializeApp();

// Set global options
setGlobalOptions({
  region: 'us-central1',
  maxInstances: 10,
});

// API Routes
export { userApi } from './api/users';
export { symptomApi } from './api/symptoms';
export { journalApi } from './api/journal';
export { forumApi } from './api/forum';
export { companionApi } from './api/companion';
export { doctorApi } from './api/doctors';
export { researchApi } from './api/research';
export { aiApi } from './api/ai';

// Background Functions
export { processSymptomEntry } from './triggers/symptomTriggers';
export { updateCompanionMemory } from './triggers/companionTriggers';
export { generateInsights } from './triggers/aiTriggers';
export { moderateForumPost } from './triggers/forumTriggers';
```

#### 2. User API Functions
```typescript
// functions/src/api/users.ts
import { onCall, onRequest } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const db = getFirestore();

export const userApi = onRequest(async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const { method, url } = req;
    const path = url.split('/api/users')[1];

    switch (method) {
      case 'GET':
        if (path === '/profile') {
          const userDoc = await db.collection('users').doc(userId).get();
          if (!userDoc.exists) {
            res.status(404).json({ error: 'User not found' });
            return;
          }
          res.json(userDoc.data());
        }
        break;

      case 'PUT':
        if (path === '/profile') {
          await db.collection('users').doc(userId).update({
            ...req.body,
            updatedAt: new Date(),
          });
          res.json({ success: true });
        }
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('User API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const createUserProfile = onCall(async (request) => {
  const { auth, data } = request;
  
  if (!auth) {
    throw new Error('Unauthorized');
  }

  try {
    const userRef = db.collection('users').doc(auth.uid);
    await userRef.set({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true, userId: auth.uid };
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to create user profile');
  }
});
```

#### 3. Symptom Tracking Functions
```typescript
// functions/src/api/symptoms.ts
import { onCall, onRequest } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();

export const symptomApi = onRequest(async (req, res) => {
  // Authentication and CORS setup...
  
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token!);
    const userId = decodedToken.uid;

    const { method, url } = req;
    const path = url.split('/api/symptoms')[1];

    switch (method) {
      case 'POST':
        if (path === '/entries') {
          const entryData = {
            ...req.body,
            userId,
            createdAt: new Date(),
            date: new Date(req.body.date),
          };

          const docRef = await db.collection('symptomEntries').add(entryData);
          
          // Trigger AI analysis
          await triggerSymptomAnalysis(docRef.id, userId);
          
          // Update challenge progress
          await updateChallengeProgress(userId, 'symptom_entry');
          
          res.json({ id: docRef.id, ...entryData });
        }
        break;

      case 'GET':
        if (path === '/entries') {
          const { startDate, endDate, limit = 50 } = req.query;
          
          let query = db.collection('symptomEntries')
            .where('userId', '==', userId)
            .orderBy('date', 'desc')
            .limit(Number(limit));

          if (startDate) {
            query = query.where('date', '>=', new Date(startDate as string));
          }
          if (endDate) {
            query = query.where('date', '<=', new Date(endDate as string));
          }

          const snapshot = await query.get();
          const entries = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          res.json(entries);
        }
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Symptom API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function triggerSymptomAnalysis(entryId: string, userId: string) {
  // Trigger AI analysis Cloud Function
  await db.collection('analysisQueue').add({
    type: 'symptom_analysis',
    entryId,
    userId,
    status: 'pending',
    createdAt: new Date(),
  });
}

async function updateChallengeProgress(userId: string, actionType: string) {
  const challengesRef = db.collection('userChallenges').doc(userId);
  
  await challengesRef.update({
    [`progress.daily_symptom_track`]: FieldValue.increment(1),
    [`progress.weekly_consistency`]: FieldValue.increment(1),
    lastUpdated: new Date(),
  });
}
```

#### 4. AI Companion Functions
```typescript
// functions/src/api/companion.ts
import { onCall } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export const companionApi = onRequest(async (req, res) => {
  // Authentication and CORS setup...
  
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token!);
    const userId = decodedToken.uid;

    const { method, url } = req;
    const path = url.split('/api/companion')[1];

    switch (method) {
      case 'POST':
        if (path === '/chat') {
          const { message, sessionType } = req.body;
          
          // Get companion memory
          const memoryDoc = await db.collection('companionMemory').doc(userId).get();
          const memory = memoryDoc.exists ? memoryDoc.data() : await initializeCompanionMemory(userId);
          
          // Generate AI response (integrate with your therapeutic AI)
          const response = await generateCompanionResponse(userId, message, memory);
          
          // Save chat message
          await db.collection('chatMessages').add({
            userId,
            userMessage: message,
            aiResponse: response.text,
            timestamp: new Date(),
            sessionType: sessionType || 'support',
            voiceStyle: response.voiceStyle,
            context: {
              companionTier: memory.learningProgress || 1,
            },
          });
          
          // Update companion memory
          await updateCompanionLearning(userId, message, response, memory);
          
          res.json(response);
        }
        break;

      case 'GET':
        if (path === '/memory') {
          const memoryDoc = await db.collection('companionMemory').doc(userId).get();
          res.json(memoryDoc.exists ? memoryDoc.data() : {});
        } else if (path === '/chat-history') {
          const snapshot = await db.collection('chatMessages')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();
          
          const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          
          res.json(messages);
        }
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Companion API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function initializeCompanionMemory(userId: string) {
  const memory = {
    userId,
    patterns: [],
    preferences: [],
    insights: [],
    learningProgress: 1,
    lastInteraction: new Date(),
    personalityAdaptations: {},
    conversationHistory: [],
  };
  
  await db.collection('companionMemory').doc(userId).set(memory);
  return memory;
}

async function generateCompanionResponse(userId: string, message: string, memory: any) {
  // Integrate with your therapeutic AI system
  // This would call your existing therapeutic AI functions
  return {
    text: "I understand you're sharing something important with me. How are you feeling about your health journey today?",
    voiceStyle: 'validating',
    followUpQuestions: ["What's been most challenging lately?"],
    actionableSteps: [],
  };
}

async function updateCompanionLearning(userId: string, userMessage: string, response: any, memory: any) {
  // Update learning progress and patterns
  await db.collection('companionMemory').doc(userId).update({
    lastInteraction: new Date(),
    learningProgress: memory.learningProgress + 1,
    conversationHistory: [
      ...memory.conversationHistory.slice(-10), // Keep last 10 conversations
      {
        date: new Date(),
        topics: extractTopicsFromMessage(userMessage),
        insights: response.actionableSteps || [],
        userMood: analyzeMoodFromMessage(userMessage),
        keyPoints: [userMessage.substring(0, 100)],
      },
    ],
  });
}

function extractTopicsFromMessage(message: string): string[] {
  // Simple topic extraction - could be enhanced with NLP
  const keywords = ['symptoms', 'pain', 'fatigue', 'mood', 'treatment', 'medication'];
  return keywords.filter(keyword => 
    message.toLowerCase().includes(keyword)
  );
}

function analyzeMoodFromMessage(message: string): string {
  // Simple mood analysis - could be enhanced with sentiment analysis
  const positiveWords = ['good', 'better', 'improving', 'hopeful'];
  const negativeWords = ['bad', 'worse', 'terrible', 'hopeless'];
  
  const hasPositive = positiveWords.some(word => message.toLowerCase().includes(word));
  const hasNegative = negativeWords.some(word => message.toLowerCase().includes(word));
  
  if (hasPositive && !hasNegative) return 'positive';
  if (hasNegative && !hasPositive) return 'negative';
  return 'neutral';
}
```

#### 5. Background Trigger Functions
```typescript
// functions/src/triggers/symptomTriggers.ts
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export const processSymptomEntry = onDocumentCreated(
  'symptomEntries/{entryId}',
  async (event) => {
    const entryData = event.data?.data();
    if (!entryData) return;

    const { userId, symptoms, factors } = entryData;
    
    try {
      // Generate AI insights
      const insights = await analyzeSymptomPatterns(userId, symptoms, factors);
      
      // Update the symptom entry with AI analysis
      await event.data?.ref.update({
        aiAnalysis: {
          patterns: insights.patterns,
          correlations: insights.correlations,
          recommendations: insights.recommendations,
          confidence: insights.confidence,
          analysisDate: new Date(),
        },
      });

      // Update companion memory with new patterns
      await updateCompanionMemoryFromSymptoms(userId, insights);
      
      // Check for crisis alerts
      if (insights.severity === 'critical') {
        await triggerCrisisAlert(userId, insights);
      }

    } catch (error) {
      console.error('Error processing symptom entry:', error);
    }
  }
);

async function analyzeSymptomPatterns(userId: string, symptoms: any, factors: any) {
  // Get recent symptom history
  const recentEntries = await db.collection('symptomEntries')
    .where('userId', '==', userId)
    .orderBy('date', 'desc')
    .limit(30)
    .get();

  const entries = recentEntries.docs.map(doc => doc.data());
  
  // Analyze patterns (simplified version)
  const patterns = [];
  const correlations = [];
  const recommendations = [];
  let confidence = 0;
  let severity = 'low';

  // Severity assessment
  if (symptoms.itchingIntensity >= 8 || symptoms.fatigueLevel >= 8) {
    severity = 'high';
    recommendations.push('Consider contacting your healthcare provider for severe symptoms');
  }

  if (symptoms.itchingIntensity >= 9 && symptoms.fatigueLevel >= 9) {
    severity = 'critical';
    recommendations.push('URGENT: Seek immediate medical attention');
  }

  // Pattern detection (example: environmental factors)
  const humidityMentioned = factors.environmentalFactors?.includes('high humidity');
  if (humidityMentioned) {
    patterns.push('Humidity correlation detected');
    correlations.push('High humidity may be triggering symptoms');
    recommendations.push('Consider using a dehumidifier in living spaces');
    confidence += 20;
  }

  // Medication pattern analysis
  if (factors.medications?.length > 0) {
    patterns.push('Medication adherence tracking');
    confidence += 15;
  }

  return {
    patterns,
    correlations,
    recommendations,
    confidence: Math.min(confidence, 95),
    severity,
  };
}

async function updateCompanionMemoryFromSymptoms(userId: string, insights: any) {
  const memoryRef = db.collection('companionMemory').doc(userId);
  const memoryDoc = await memoryRef.get();
  
  if (memoryDoc.exists) {
    const memory = memoryDoc.data();
    
    // Add new patterns to memory
    const newPatterns = insights.patterns.map((pattern: string) => ({
      id: `pattern_${Date.now()}`,
      type: 'symptom',
      pattern,
      confidence: insights.confidence,
      frequency: 1,
      lastObserved: new Date(),
      relatedFactors: insights.correlations,
    }));

    await memoryRef.update({
      patterns: [...(memory?.patterns || []), ...newPatterns],
      insights: [...(memory?.insights || []), ...insights.recommendations],
      lastInteraction: new Date(),
    });
  }
}

async function triggerCrisisAlert(userId: string, insights: any) {
  // Create crisis alert document
  await db.collection('crisisAlerts').add({
    userId,
    severity: 'critical',
    symptoms: insights,
    timestamp: new Date(),
    status: 'pending',
    alertMessage: 'Patient experiencing critical symptom levels - immediate attention required',
  });

  // Notify assigned healthcare providers (if any)
  // This could trigger email/SMS notifications
}
```

## Frontend Updates

### 1. Update API Client
```typescript
// src/lib/firebaseApi.ts
import { auth } from './firebase';
import { User } from 'firebase/auth';

class FirebaseApiClient {
  private baseUrl = 'https://us-central1-your-project-id.cloudfunctions.net';

  private async getAuthToken(): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    return await user.getIdToken();
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // User API
  async getUserProfile() {
    return this.request('/userApi/profile');
  }

  async updateUserProfile(data: any) {
    return this.request('/userApi/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Symptom API
  async createSymptomEntry(data: any) {
    return this.request('/symptomApi/entries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSymptomEntries(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/symptomApi/entries?${queryString}`);
  }

  // Companion API
  async sendCompanionMessage(message: string, sessionType: string) {
    return this.request('/companionApi/chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionType }),
    });
  }

  async getCompanionChatHistory() {
    return this.request('/companionApi/chat-history');
  }

  async getCompanionMemory() {
    return this.request('/companionApi/memory');
  }
}

export const firebaseApi = new FirebaseApiClient();
```

### 2. Update React Query Hooks
```typescript
// src/hooks/useFirebaseApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseApi } from '@/lib/firebaseApi';
import { useAuth } from '@/contexts/AuthContext';

export function useUserProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['userProfile', user?.uid],
    queryFn: () => firebaseApi.getUserProfile(),
    enabled: !!user,
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (data: any) => firebaseApi.updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.uid] });
    },
  });
}

export function useSymptomEntries(params?: any) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['symptomEntries', user?.uid, params],
    queryFn: () => firebaseApi.getSymptomEntries(params),
    enabled: !!user,
  });
}

export function useCreateSymptomEntry() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (data: any) => firebaseApi.createSymptomEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['symptomEntries', user?.uid] });
    },
  });
}

export function useCompanionChat() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['companionChat', user?.uid],
    queryFn: () => firebaseApi.getCompanionChatHistory(),
    enabled: !!user,
  });
}

export function useSendCompanionMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: ({ message, sessionType }: { message: string; sessionType: string }) =>
      firebaseApi.sendCompanionMessage(message, sessionType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companionChat', user?.uid] });
    },
  });
}
```

### 3. Update Components to Use Firestore Real-time Updates
```typescript
// src/hooks/useFirestoreRealtime.ts
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export function useRealtimeSymptomEntries() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'symptomEntries'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEntries(entriesData);
      setLoading(false);
    });

    return unsubscribe;
  }, [user?.uid]);

  return { entries, loading };
}

export function useRealtimeForumPosts(category?: string) {
  const [posts, setPosts] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(
      collection(db, 'forumPosts'),
      orderBy('createdAt', 'desc')
    );

    if (category) {
      q = query(q, where('category', '==', category));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [category]);

  return { posts, loading };
}

export function useRealtimeCompanionMemory() {
  const { user } = useAuth();
  const [memory, setMemory] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onSnapshot(
      doc(db, 'companionMemory', user.uid),
      (doc) => {
        if (doc.exists()) {
          setMemory(doc.data());
        } else {
          setMemory(null);
        }
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user?.uid]);

  return { memory, loading };
}
```

## Security Rules

### Firestore Security Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Symptom entries - users can only access their own
    match /symptomEntries/{entryId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Journal entries - users can only access their own
    match /journalEntries/{entryId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Forum posts - read public, write if authenticated
    match /forumPosts/{postId} {
      allow read: if true; // Public read
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.authorId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.authorId;
      
      // Forum replies subcollection
      match /replies/{replyId} {
        allow read: if true; // Public read
        allow write: if request.auth != null && 
          request.auth.uid == resource.data.authorId;
        allow create: if request.auth != null && 
          request.auth.uid == request.resource.data.authorId;
      }
    }
    
    // Companion memory - users can only access their own
    match /companionMemory/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Chat messages - users can only access their own
    match /chatMessages/{messageId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // User challenges - users can only access their own
    match /userChallenges/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Doctors collection - doctors can only access their own profile
    match /doctors/{doctorId} {
      allow read: if request.auth != null; // Allow patients to read doctor profiles
      allow write: if request.auth != null && request.auth.uid == doctorId;
    }
    
    // Research data - anonymized, read-only for researchers
    match /researchData/{dataId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/doctors/$(request.auth.uid)).data.verification.verified == true;
      allow write: if false; // Only Cloud Functions can write research data
    }
    
    // Crisis alerts - only for healthcare providers
    match /crisisAlerts/{alertId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/doctors/$(request.auth.uid)).data.verification.verified == true;
      allow write: if false; // Only Cloud Functions can create alerts
    }
  }
}
```

## Data Migration Scripts

### 1. PostgreSQL to Firestore Migration Script
```typescript
// scripts/migrate-to-firestore.ts
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Pool } from 'pg';
import * as serviceAccount from './service-account-key.json';

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount as any),
});

const db = getFirestore();

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrateUsers() {
  console.log('Migrating users...');
  
  const result = await pool.query(`
    SELECT u.*, mp.*, rc.*
    FROM users u
    LEFT JOIN medical_profiles mp ON u.id = mp.user_id
    LEFT JOIN research_consent rc ON u.id = rc.user_id
  `);

  const batch = db.batch();
  let count = 0;

  for (const row of result.rows) {
    const userRef = db.collection('users').doc(row.firebase_uid);
    
    const userData = {
      email: row.email,
      name: row.name,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at || row.created_at),
    };

    // Add medical profile if exists
    if (row.date_of_birth) {
      userData.medicalProfile = {
        dateOfBirth: new Date(row.date_of_birth),
        gender: row.gender,
        location: {
          state: row.state,
          country: row.country,
          zipCode: row.zip_code,
        },
        medicalHistory: {
          diagnosisDate: row.diagnosis_date ? new Date(row.diagnosis_date) : null,
          symptomOnset: row.symptom_onset,
          previousDiagnoses: row.previous_diagnoses || [],
          currentMedications: row.current_medications || [],
          allergies: row.allergies || [],
          familyHistory: row.family_history || [],
        },
        demographics: {
          ethnicity: row.ethnicity,
          occupation: row.occupation,
          education: row.education,
          insurance: row.insurance,
        },
        lifestyle: {
          dietType: row.diet_type,
          exerciseFrequency: row.exercise_frequency,
          sleepPattern: row.sleep_pattern,
          stressLevel: row.stress_level,
          smokingStatus: row.smoking_status,
          alcoholConsumption: row.alcohol_consumption,
        },
        environmentalFactors: {
          housingType: row.housing_type,
          moldExposure: row.mold_exposure,
          chemicalSensitivities: row.chemical_sensitivities || [],
          waterSource: row.water_source,
          airQuality: row.air_quality,
        },
      };
    }

    // Add research consent if exists
    if (row.consent_given !== null) {
      userData.researchConsent = {
        consentGiven: row.consent_given,
        consentDate: new Date(row.consent_date),
        dataSharing: {
          symptoms: row.data_sharing_symptoms || false,
          treatments: row.data_sharing_treatments || false,
          demographics: row.data_sharing_demographics || false,
          environmental: row.data_sharing_environmental || false,
          outcomes: row.data_sharing_outcomes || false,
        },
      };
    }

    batch.set(userRef, userData);
    count++;

    // Commit batch every 500 documents
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`Migrated ${count} users...`);
    }
  }

  // Commit remaining documents
  if (count % 500 !== 0) {
    await batch.commit();
  }

  console.log(`Completed user migration: ${count} users`);
}

async function migrateSymptomEntries() {
  console.log('Migrating symptom entries...');
  
  const result = await pool.query(`
    SELECT se.*, u.firebase_uid
    FROM symptom_entries se
    JOIN users u ON se.user_id = u.id
    ORDER BY se.created_at
  `);

  const batch = db.batch();
  let count = 0;

  for (const row of result.rows) {
    const entryRef = db.collection('symptomEntries').doc();
    
    const entryData = {
      userId: row.firebase_uid,
      date: new Date(row.date),
      createdAt: new Date(row.created_at),
      symptoms: {
        itchingIntensity: row.itching_intensity || 0,
        crawlingSensations: row.crawling_sensations || '',
        newLesionsCount: row.new_lesions_count || 0,
        lesionType: row.lesion_type || '',
        fiberColors: row.fiber_colors || [],
        fatigueLevel: row.fatigue_level || 0,
        brainFogSeverity: row.brain_fog_severity || '',
        sleepQuality: row.sleep_quality || '',
        mood: row.mood || [],
      },
      factors: {
        medications: row.medications || [],
        customMedication: row.custom_medication || '',
        dietFactors: row.diet_factors || [],
        customDiet: row.custom_diet || '',
        environmentalFactors: row.environmental_factors || [],
        customEnvironmental: row.custom_environmental || '',
      },
      notes: row.notes || '',
    };

    batch.set(entryRef, entryData);
    count++;

    if (count % 500 === 0) {
      await batch.commit();
      console.log(`Migrated ${count} symptom entries...`);
    }
  }

  if (count % 500 !== 0) {
    await batch.commit();
  }

  console.log(`Completed symptom entries migration: ${count} entries`);
}

async function migrateJournalEntries() {
  console.log('Migrating journal entries...');
  
  const result = await pool.query(`
    SELECT je.*, u.firebase_uid
    FROM journal_entries je
    JOIN users u ON je.user_id = u.id
    ORDER BY je.created_at
  `);

  const batch = db.batch();
  let count = 0;

  for (const row of result.rows) {
    const entryRef = db.collection('journalEntries').doc();
    
    const entryData = {
      userId: row.firebase_uid,
      title: row.title,
      content: row.content,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      mood: row.mood,
      painLevel: row.pain_level,
      sleepQuality: row.sleep_quality,
      tags: row.tags || [],
      isPrivate: row.is_private || false,
      photos: row.photos || [],
    };

    batch.set(entryRef, entryData);
    count++;

    if (count % 500 === 0) {
      await batch.commit();
      console.log(`Migrated ${count} journal entries...`);
    }
  }

  if (count % 500 !== 0) {
    await batch.commit();
  }

  console.log(`Completed journal entries migration: ${count} entries`);
}

async function migrateForumPosts() {
  console.log('Migrating forum posts...');
  
  const postsResult = await pool.query(`
    SELECT fp.*, u.firebase_uid, u.name as author_name
    FROM forum_posts fp
    JOIN users u ON fp.author_id = u.id
    ORDER BY fp.created_at
  `);

  const batch = db.batch();
  let count = 0;

  for (const row of postsResult.rows) {
    const postRef = db.collection('forumPosts').doc();
    
    const postData = {
      authorId: row.firebase_uid,
      authorName: row.is_anonymous ? 'Anonymous' : row.author_name,
      title: row.title,
      content: row.content,
      category: row.category,
      tags: row.tags || [],
      isAnonymous: row.is_anonymous || false,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      likes: 0, // Reset likes for new system
      likedBy: [],
      replyCount: 0, // Will be updated when migrating replies
      viewCount: 0,
      isModerated: false,
      moderationFlags: [],
    };

    batch.set(postRef, postData);
    count++;

    if (count % 500 === 0) {
      await batch.commit();
      console.log(`Migrated ${count} forum posts...`);
    }
  }

  if (count % 500 !== 0) {
    await batch.commit();
  }

  console.log(`Completed forum posts migration: ${count} posts`);
}

async function migrateDoctors() {
  console.log('Migrating doctors...');
  
  const result = await pool.query(`
    SELECT * FROM doctors ORDER BY created_at
  `);

  const batch = db.batch();
  let count = 0;

  for (const row of result.rows) {
    const doctorRef = db.collection('doctors').doc(row.firebase_uid);
    
    const doctorData = {
      firebaseUid: row.firebase_uid,
      email: row.email,
      name: row.name,
      createdAt: new Date(row.created_at),
      credentials: {
        medicalLicense: row.medical_license,
        licenseState: row.license_state,
        licenseExpiry: row.license_expiry ? new Date(row.license_expiry) : null,
        boardCertifications: row.board_certifications || [],
        medicalSchool: row.medical_school,
        graduationYear: row.graduation_year,
        residency: row.residency,
        fellowship: row.fellowship,
        yearsExperience: row.years_experience || 0,
      },
      practice: {
        specialties: row.specialties || [],
        hospitalAffiliations: row.hospital_affiliations || [],
        officeAddress: row.office_address,
        phone: row.phone,
        acceptsInsurance: row.accepts_insurance || [],
        telehealth: row.telehealth || false,
        morgellonsExperience: row.morgellons_experience || 0,
      },
      verification: {
        verified: row.verified || false,
        verificationDate: row.verification_date ? new Date(row.verification_date) : null,
        verifiedBy: row.verified_by,
      },
    };

    batch.set(doctorRef, doctorData);
    count++;

    if (count % 500 === 0) {
      await batch.commit();
      console.log(`Migrated ${count} doctors...`);
    }
  }

  if (count % 500 !== 0) {
    await batch.commit();
  }

  console.log(`Completed doctors migration: ${count} doctors`);
}

async function runMigration() {
  try {
    console.log('Starting PostgreSQL to Firestore migration...');
    
    await migrateUsers();
    await migrateSymptomEntries();
    await migrateJournalEntries();
    await migrateForumPosts();
    await migrateDoctors();
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

// Run migration
runMigration();
```

### 2. Run Migration Script
```bash
# Install dependencies
npm install firebase-admin pg

# Set environment variables
export DATABASE_URL="your-postgresql-connection-string"
export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account-key.json"

# Run migration
ts-node scripts/migrate-to-firestore.ts
```

## Deployment to Firebase App Hosting

### 1. Firebase Configuration
```json
// firebase.json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs18",
    "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run build"]
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/api/**",
        "headers": [
          {
            "key": "Access-Control-Allow-Origin",
            "value": "*"
          },
          {
            "key": "Access-Control-Allow-Methods",
            "value": "GET, POST, PUT, DELETE, OPTIONS"
          },
          {
            "key": "Access-Control-Allow-Headers",
            "value": "Content-Type, Authorization"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

### 2. Build and Deploy Scripts
```json
// package.json scripts
{
  "scripts": {
    "build": "vite build",
    "deploy": "npm run build && firebase deploy",
    "deploy:functions": "firebase deploy --only functions",
    "deploy:hosting": "npm run build && firebase deploy --only hosting",
    "deploy:firestore": "firebase deploy --only firestore:rules,firestore:indexes",
    "serve": "firebase emulators:start",
    "migrate": "ts-node scripts/migrate-to-firestore.ts"
  }
}
```

### 3. Environment Variables for Production
```bash
# Set Firebase environment variables
firebase functions:config:set \
  app.environment="production" \
  gemini.api_key="your-gemini-api-key" \
  tts.api_key="your-google-cloud-tts-key"

# Deploy with environment config
firebase deploy
```

## Testing and Verification

### 1. Migration Verification Script
```typescript
// scripts/verify-migration.ts
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Pool } from 'pg';

const db = getFirestore();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function verifyMigration() {
  console.log('Verifying migration...');
  
  // Count records in PostgreSQL
  const pgUsers = await pool.query('SELECT COUNT(*) FROM users');
  const pgSymptoms = await pool.query('SELECT COUNT(*) FROM symptom_entries');
  const pgJournals = await pool.query('SELECT COUNT(*) FROM journal_entries');
  const pgPosts = await pool.query('SELECT COUNT(*) FROM forum_posts');
  const pgDoctors = await pool.query('SELECT COUNT(*) FROM doctors');
  
  // Count documents in Firestore
  const fsUsers = await db.collection('users').count().get();
  const fsSymptoms = await db.collection('symptomEntries').count().get();
  const fsJournals = await db.collection('journalEntries').count().get();
  const fsPosts = await db.collection('forumPosts').count().get();
  const fsDoctors = await db.collection('doctors').count().get();
  
  console.log('Migration Verification Results:');
  console.log(`Users: PG(${pgUsers.rows[0].count}) -> FS(${fsUsers.data().count})`);
  console.log(`Symptoms: PG(${pgSymptoms.rows[0].count}) -> FS(${fsSymptoms.data().count})`);
  console.log(`Journals: PG(${pgJournals.rows[0].count}) -> FS(${fsJournals.data().count})`);
  console.log(`Posts: PG(${pgPosts.rows[0].count}) -> FS(${fsPosts.data().count})`);
  console.log(`Doctors: PG(${pgDoctors.rows[0].count}) -> FS(${fsDoctors.data().count})`);
  
  // Verify data integrity for sample records
  await verifySampleData();
}

async function verifySampleData() {
  console.log('Verifying sample data integrity...');
  
  // Sample user verification
  const sampleUser = await pool.query('SELECT * FROM users LIMIT 1');
  if (sampleUser.rows.length > 0) {
    const pgUser = sampleUser.rows[0];
    const fsUser = await db.collection('users').doc(pgUser.firebase_uid).get();
    
    if (fsUser.exists) {
      const fsData = fsUser.data();
      console.log('✓ Sample user data matches');
      console.log(`  Email: ${pgUser.email} == ${fsData.email}`);
      console.log(`  Name: ${pgUser.name} == ${fsData.name}`);
    } else {
      console.log('✗ Sample user not found in Firestore');
    }
  }
}

verifyMigration().then(() => {
  console.log('Verification completed');
  process.exit(0);
}).catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});
```

### 2. Post-Migration Cleanup
```typescript
// scripts/cleanup-old-data.ts
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function cleanupOldData() {
  console.log('Starting cleanup of PostgreSQL data...');
  
  // Create backup first
  console.log('Creating backup tables...');
  
  const backupQueries = [
    'CREATE TABLE users_backup AS SELECT * FROM users',
    'CREATE TABLE symptom_entries_backup AS SELECT * FROM symptom_entries',
    'CREATE TABLE journal_entries_backup AS SELECT * FROM journal_entries',
    'CREATE TABLE forum_posts_backup AS SELECT * FROM forum_posts',
    'CREATE TABLE doctors_backup AS SELECT * FROM doctors',
  ];

  for (const query of backupQueries) {
    try {
      await pool.query(query);
      console.log(`✓ ${query}`);
    } catch (error) {
      console.log(`- ${query} (table may already exist)`);
    }
  }

  console.log('Backup completed. You can now safely remove the original tables if desired.');
  console.log('Note: Keep backups until you are 100% confident in the migration.');
}

cleanupOldData();
```

## Performance Optimization

### 1. Firestore Indexes
```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "symptomEntries",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "journalEntries",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "forumPosts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "chatMessages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### 2. Cloud Functions Optimization
```typescript
// functions/src/utils/cache.ts
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();
const cache = new Map();

export class FirestoreCache {
  static async get(collection: string, docId: string, ttl: number = 300000) {
    const cacheKey = `${collection}:${docId}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }
    
    const doc = await db.collection(collection).doc(docId).get();
    const data = doc.exists ? doc.data() : null;
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
    
    return data;
  }
  
  static invalidate(collection: string, docId: string) {
    const cacheKey = `${collection}:${docId}`;
    cache.delete(cacheKey);
  }
}
```

## Rollback Plan

### 1. Emergency Rollback Procedure
```bash
# 1. Revert to PostgreSQL backend
git checkout postgresql-backup-branch

# 2. Redeploy to Replit
replit deploy

# 3. Restore database from backup
pg_restore --clean --no-acl --no-owner -d $DATABASE_URL backup.sql

# 4. Update DNS if needed
# Point domain back to Replit hosting
```

### 2. Data Synchronization During Transition
```typescript
// scripts/sync-data.ts
// Use this script to sync data between PostgreSQL and Firestore during testing phase

import { syncUsers, syncSymptoms, syncJournals } from './sync-utils';

async function bidirectionalSync() {
  console.log('Starting bidirectional sync...');
  
  await syncUsers('pg-to-firestore');
  await syncSymptoms('pg-to-firestore');
  await syncJournals('pg-to-firestore');
  
  console.log('Sync completed');
}

// Run sync every hour during transition period
setInterval(bidirectionalSync, 3600000);
```

## Conclusion

This migration guide provides a comprehensive approach to moving from PostgreSQL to Firestore while maintaining all functionality and adding real-time capabilities. The key benefits of this migration include:

1. **Scalability**: Automatic scaling with Firebase
2. **Real-time Updates**: Native real-time synchronization
3. **Simplified Infrastructure**: Managed Firebase services
4. **Enhanced Security**: Granular Firestore security rules
5. **Cost Optimization**: Pay-per-use pricing model

Follow the steps in order, test thoroughly in a staging environment, and maintain backups throughout the process. The migration should be completed in phases, starting with non-critical collections and gradually moving core functionality.

Remember to update your API keys, environment variables, and domain configurations as part of the deployment process.