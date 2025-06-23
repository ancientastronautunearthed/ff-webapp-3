# Firebase Migration Guide V2 - Current Application State
*Updated: June 23, 2025*

## Overview

This document provides a comprehensive migration guide for the current Fiber Friends application to pure Firebase hosting and Cloud Functions. The application has been streamlined to remove AI companion creation and tour systems, now using a generic Health Assistant companion with AI function tiers.

## Current Application Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript, Vite build system
- **State Management**: React Query for server state, Context API for global state
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: Firebase Auth with email/password and Google OAuth
- **Storage**: Firebase Storage for media uploads
- **Database**: Firebase Firestore for all data persistence

### Backend (Express.js)
- **API Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (to be migrated to Firestore)
- **AI Integration**: Google Genkit flows for health analysis
- **Session Management**: Express sessions (to be replaced with Firebase Auth)

### Key Features
1. **Streamlined Onboarding**: Medical profile → Dashboard (no tour)
2. **Generic AI Companion**: Health Assistant with tier progression
3. **Health Tracking**: Symptom entries, daily check-ins, journal entries
4. **Community Platform**: Forums, peer matching, doctor consultations
5. **Research Participation**: Anonymized data aggregation
6. **AI Health Coach**: Pattern analysis, insights, predictions
7. **Gamification**: Points, achievements, streaks (Firebase-based)

## Migration Steps

### Phase 1: Firebase Project Setup

#### 1.1 Create Firebase Project
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and create project
firebase login
firebase projects:create fiber-friends-prod
```

#### 1.2 Initialize Firebase Services
```bash
firebase init

# Select:
# - Hosting
# - Functions
# - Firestore
# - Storage
# - Authentication
```

#### 1.3 Configure Firebase Services

**firebase.json**
```json
{
  "hosting": {
    "public": "dist/public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs20",
    "predeploy": ["npm run build:functions"]
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

### Phase 2: Database Migration (PostgreSQL → Firestore)

#### 2.1 Firestore Collections Structure

```typescript
// users collection
interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  onboardingComplete: boolean;
  userRole?: 'patient' | 'doctor';
  
  // Medical Profile Data
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  state: string;
  ethnicity?: string;
  
  // Research Consent
  researchConsent: boolean;
  anonymousDataSharing: boolean;
  
  // Health Data
  currentSymptomSeverity: number;
  symptomOnsetYear: number;
  initialSymptoms: string[];
  currentDiagnoses: string[];
  allergies: string[];
  medications: string[];
  
  // Lifestyle
  smoking: string;
  alcohol: string;
  exercise: string;
  stressLevel: number;
  sleepQuality: number;
  
  // Companion (Generic)
  companionTier: number;
  companionPoints: number;
  companionActive: boolean;
}

// symptomEntries collection
interface SymptomEntry {
  id: string;
  userId: string;
  date: Timestamp;
  symptoms: {
    name: string;
    severity: number;
    location: string;
    triggers: string[];
    treatments: string[];
  }[];
  overallSeverity: number;
  notes?: string;
  weather?: any;
  createdAt: Timestamp;
}

// journalEntries collection
interface JournalEntry {
  id: string;
  userId: string;
  date: Timestamp;
  title: string;
  content: string;
  mood: number;
  mediaUrls: string[];
  tags: string[];
  private: boolean;
  createdAt: Timestamp;
}

// forumPosts collection
interface ForumPost {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  likes: number;
  replies: number;
  anonymous: boolean;
  pinned: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// forumReplies collection
interface ForumReply {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  likes: number;
  anonymous: boolean;
  createdAt: Timestamp;
}

// dailyCheckins collection
interface DailyCheckin {
  id: string;
  userId: string;
  date: Timestamp;
  wellbeing: number;
  energy: number;
  mood: number;
  sleepHours: number;
  sleepQuality: number;
  symptoms: string[];
  activities: string[];
  notes?: string;
  createdAt: Timestamp;
}

// companionProgress collection
interface CompanionProgress {
  userId: string;
  currentTier: number;
  totalPoints: number;
  pointsToNextTier: number;
  progressPercentage: number;
  unlockedFeatures: string[];
  achievements: {
    id: string;
    unlockedAt: Timestamp;
    type: string;
  }[];
  streaks: {
    type: string;
    current: number;
    longest: number;
  }[];
  lastUpdated: Timestamp;
}

// peerConnections collection
interface PeerConnection {
  id: string;
  userId1: string;
  userId2: string;
  status: 'pending' | 'accepted' | 'blocked';
  matchScore: number;
  commonSymptoms: string[];
  commonInterests: string[];
  requestedBy: string;
  createdAt: Timestamp;
  acceptedAt?: Timestamp;
}

// doctors collection
interface Doctor {
  uid: string;
  email: string;
  displayName: string;
  specialties: string[];
  licenseNumber: string;
  licenseState: string;
  verified: boolean;
  bio?: string;
  photoURL?: string;
  contactInfo: {
    phone?: string;
    website?: string;
    address?: string;
  };
  credentials: {
    medicalSchool: string;
    residency: string;
    boardCertifications: string[];
  };
  availability: {
    telehealth: boolean;
    inPerson: boolean;
    consultationFee?: number;
  };
  ratings: {
    average: number;
    count: number;
  };
  createdAt: Timestamp;
}

// researchData collection (anonymized)
interface ResearchDataPoint {
  id: string;
  hashedUserId: string;
  dataType: 'symptom' | 'journal' | 'checkin' | 'profile';
  anonymizedData: any;
  demographics: {
    ageGroup: string;
    region: string;
    gender: string;
  };
  timestamp: Timestamp;
}
```

#### 2.2 Data Migration Script

```typescript
// functions/src/migration.ts
import { db as postgresDb } from './legacy/postgres';
import { db as firestoreDb } from './firebase-admin';

export async function migrateUserData() {
  const users = await postgresDb.select().from('users');
  
  for (const user of users) {
    await firestoreDb.collection('users').doc(user.firebase_uid).set({
      uid: user.firebase_uid,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      age: user.age,
      gender: user.gender,
      state: user.state,
      ethnicity: user.ethnicity,
      researchConsent: user.research_consent,
      anonymousDataSharing: user.anonymous_data_sharing,
      currentSymptomSeverity: user.current_symptom_severity,
      symptomOnsetYear: user.symptom_onset_year,
      initialSymptoms: user.initial_symptoms || [],
      currentDiagnoses: user.current_diagnoses || [],
      allergies: user.allergies || [],
      medications: user.medications || [],
      smoking: user.smoking,
      alcohol: user.alcohol,
      exercise: user.exercise,
      stressLevel: user.stress_level,
      sleepQuality: user.sleep_quality,
      onboardingComplete: user.onboarding_complete,
      companionTier: 1,
      companionPoints: 0,
      companionActive: true,
      createdAt: admin.firestore.Timestamp.fromDate(user.created_at),
      lastLogin: admin.firestore.Timestamp.fromDate(user.last_login || user.created_at)
    });
  }
}

export async function migrateSymptomEntries() {
  const entries = await postgresDb.select().from('symptom_entries');
  
  for (const entry of entries) {
    await firestoreDb.collection('symptomEntries').add({
      userId: entry.user_id,
      date: admin.firestore.Timestamp.fromDate(entry.date),
      symptoms: JSON.parse(entry.symptoms_data),
      overallSeverity: entry.overall_severity,
      notes: entry.notes,
      weather: entry.weather_data ? JSON.parse(entry.weather_data) : null,
      createdAt: admin.firestore.Timestamp.fromDate(entry.created_at)
    });
  }
}

export async function migrateJournalEntries() {
  const entries = await postgresDb.select().from('journal_entries');
  
  for (const entry of entries) {
    await firestoreDb.collection('journalEntries').add({
      userId: entry.user_id,
      date: admin.firestore.Timestamp.fromDate(entry.date),
      title: entry.title,
      content: entry.content,
      mood: entry.mood_rating,
      mediaUrls: entry.media_urls || [],
      tags: entry.tags || [],
      private: entry.is_private,
      createdAt: admin.firestore.Timestamp.fromDate(entry.created_at)
    });
  }
}

export async function migrateForumData() {
  const posts = await postgresDb.select().from('forum_posts');
  
  for (const post of posts) {
    await firestoreDb.collection('forumPosts').add({
      authorId: post.author_id,
      authorName: post.author_name,
      title: post.title,
      content: post.content,
      category: post.category,
      tags: post.tags || [],
      likes: post.likes_count,
      replies: post.replies_count,
      anonymous: post.is_anonymous,
      pinned: post.is_pinned,
      createdAt: admin.firestore.Timestamp.fromDate(post.created_at),
      updatedAt: admin.firestore.Timestamp.fromDate(post.updated_at)
    });
  }
}

export async function migrateCompanionProgress() {
  const users = await postgresDb.select().from('users');
  
  for (const user of users) {
    await firestoreDb.collection('companionProgress').doc(user.firebase_uid).set({
      userId: user.firebase_uid,
      currentTier: 1,
      totalPoints: 0,
      pointsToNextTier: 100,
      progressPercentage: 0,
      unlockedFeatures: ['basic_chat', 'health_tracking'],
      achievements: [],
      streaks: [
        { type: 'daily_checkin', current: 0, longest: 0 },
        { type: 'symptom_tracking', current: 0, longest: 0 },
        { type: 'journal_entry', current: 0, longest: 0 }
      ],
      lastUpdated: admin.firestore.Timestamp.now()
    });
  }
}
```

### Phase 3: Cloud Functions Migration

#### 3.1 Main API Function

```typescript
// functions/src/index.ts
import { onRequest } from 'firebase-functions/v2/https';
import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth';
import { healthRoutes } from './routes/health';
import { communityRoutes } from './routes/community';
import { aiRoutes } from './routes/ai';
import { companionRoutes } from './routes/companion';

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/health', healthRoutes);
app.use('/community', communityRoutes);
app.use('/ai', aiRoutes);
app.use('/companion', companionRoutes);

export const api = onRequest({
  region: 'us-central1',
  memory: '1GiB',
  timeoutSeconds: 300
}, app);
```

#### 3.2 Health Tracking Functions

```typescript
// functions/src/routes/health.ts
import { Router } from 'express';
import { db } from '../firebase-admin';
import { authenticateUser } from '../middleware/auth';

export const healthRoutes = Router();

healthRoutes.post('/symptoms', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.user;
    const symptomData = req.body;

    const docRef = await db.collection('symptomEntries').add({
      userId,
      ...symptomData,
      createdAt: admin.firestore.Timestamp.now()
    });

    // Update companion progress
    await updateCompanionProgress(userId, 'symptom_entry', 10);

    res.json({ id: docRef.id, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

healthRoutes.post('/checkin', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.user;
    const checkinData = req.body;

    await db.collection('dailyCheckins').add({
      userId,
      ...checkinData,
      createdAt: admin.firestore.Timestamp.now()
    });

    // Update streaks and progress
    await updateCompanionProgress(userId, 'daily_checkin', 15);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

healthRoutes.post('/journal', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.user;
    const journalData = req.body;

    await db.collection('journalEntries').add({
      userId,
      ...journalData,
      createdAt: admin.firestore.Timestamp.now()
    });

    await updateCompanionProgress(userId, 'journal_entry', 20);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function updateCompanionProgress(userId: string, action: string, points: number) {
  const progressRef = db.collection('companionProgress').doc(userId);
  const progressDoc = await progressRef.get();
  
  if (progressDoc.exists) {
    const current = progressDoc.data();
    const newPoints = current.totalPoints + points;
    const newTier = Math.floor(newPoints / 100) + 1;
    
    await progressRef.update({
      totalPoints: newPoints,
      currentTier: newTier,
      pointsToNextTier: (newTier * 100) - newPoints,
      progressPercentage: ((newPoints % 100) / 100) * 100,
      lastUpdated: admin.firestore.Timestamp.now()
    });
  }
}
```

#### 3.3 AI Analysis Functions

```typescript
// functions/src/routes/ai.ts
import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../firebase-admin';
import { authenticateUser } from '../middleware/auth';

export const aiRoutes = Router();

const genai = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

aiRoutes.post('/analyze-patterns', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Get user's recent data
    const symptoms = await db.collection('symptomEntries')
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .limit(30)
      .get();
    
    const journals = await db.collection('journalEntries')
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .limit(10)
      .get();
    
    // Analyze with Gemini
    const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `Analyze health patterns from symptom and journal data:
    
    Symptoms: ${JSON.stringify(symptoms.docs.map(d => d.data()))}
    Journals: ${JSON.stringify(journals.docs.map(d => d.data()))}
    
    Provide insights on:
    1. Symptom patterns and triggers
    2. Mood correlations
    3. Treatment effectiveness
    4. Recommendations for improvement
    
    Format as JSON with insights array.`;
    
    const result = await model.generateContent(prompt);
    const insights = JSON.parse(result.response.text());
    
    res.json({ insights });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

aiRoutes.post('/companion-chat', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.user;
    const { message } = req.body;
    
    // Get user context
    const userDoc = await db.collection('users').doc(userId).get();
    const progressDoc = await db.collection('companionProgress').doc(userId).get();
    
    const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `You are a Health Assistant AI companion for a Morgellons patient.
    
    User context: ${JSON.stringify(userDoc.data())}
    Progress: ${JSON.stringify(progressDoc.data())}
    
    User message: "${message}"
    
    Respond as a helpful, empathetic health companion focused on support and practical advice.`;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Save chat message
    await db.collection('companionChats').add({
      userId,
      userMessage: message,
      companionResponse: response,
      timestamp: admin.firestore.Timestamp.now()
    });
    
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 3.4 Community Functions

```typescript
// functions/src/routes/community.ts
import { Router } from 'express';
import { db } from '../firebase-admin';
import { authenticateUser } from '../middleware/auth';

export const communityRoutes = Router();

communityRoutes.post('/posts', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.user;
    const postData = req.body;
    
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    await db.collection('forumPosts').add({
      authorId: userId,
      authorName: postData.anonymous ? 'Anonymous' : userData.displayName,
      ...postData,
      likes: 0,
      replies: 0,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });
    
    await updateCompanionProgress(userId, 'forum_post', 25);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

communityRoutes.get('/posts', async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;
    
    let query = db.collection('forumPosts').orderBy('createdAt', 'desc');
    
    if (category) {
      query = query.where('category', '==', category);
    }
    
    const posts = await query.limit(Number(limit)).get();
    
    res.json({
      posts: posts.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

communityRoutes.post('/posts/:postId/replies', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.user;
    const { postId } = req.params;
    const replyData = req.body;
    
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    await db.collection('forumReplies').add({
      postId,
      authorId: userId,
      authorName: replyData.anonymous ? 'Anonymous' : userData.displayName,
      content: replyData.content,
      likes: 0,
      anonymous: replyData.anonymous,
      createdAt: admin.firestore.Timestamp.now()
    });
    
    // Update post reply count
    await db.collection('forumPosts').doc(postId).update({
      replies: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.Timestamp.now()
    });
    
    await updateCompanionProgress(userId, 'forum_reply', 15);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Phase 4: Security Rules

#### 4.1 Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Symptom entries - user's own data only
    match /symptomEntries/{entryId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Journal entries - user's own data only
    match /journalEntries/{entryId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Forum posts - read all, write own
    match /forumPosts/{postId} {
      allow read: if true; // Public posts
      allow write: if request.auth != null && 
        resource.data.authorId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.authorId == request.auth.uid;
    }
    
    // Forum replies - read all, write own
    match /forumReplies/{replyId} {
      allow read: if true; // Public replies
      allow write: if request.auth != null && 
        resource.data.authorId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.authorId == request.auth.uid;
    }
    
    // Daily checkins - user's own data only
    match /dailyCheckins/{checkinId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Companion progress - user's own data only
    match /companionProgress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Peer connections
    match /peerConnections/{connectionId} {
      allow read: if request.auth != null && 
        (resource.data.userId1 == request.auth.uid || 
         resource.data.userId2 == request.auth.uid);
      allow write: if request.auth != null && 
        (resource.data.userId1 == request.auth.uid || 
         resource.data.userId2 == request.auth.uid);
      allow create: if request.auth != null && 
        (request.resource.data.userId1 == request.auth.uid || 
         request.resource.data.userId2 == request.auth.uid);
    }
    
    // Doctors - read all verified, write own
    match /doctors/{doctorId} {
      allow read: if resource.data.verified == true;
      allow write: if request.auth != null && request.auth.uid == doctorId;
    }
    
    // Research data - no direct access (admin only)
    match /researchData/{dataId} {
      allow read, write: if false;
    }
    
    // Companion chats - user's own data only
    match /companionChats/{chatId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

#### 4.2 Storage Security Rules

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User profile images
    match /profile-images/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Journal media (private to user)
    match /journal-media/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Forum media (public read, user write)
    match /forum-media/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Doctor verification documents
    match /doctor-docs/{doctorId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == doctorId;
    }
  }
}
```

### Phase 5: Frontend Configuration

#### 5.1 Firebase Configuration

```typescript
// client/src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
```

#### 5.2 API Client Updates

```typescript
// client/src/lib/api.ts
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const callable = httpsCallable(functions, 'api');
  
  const result = await callable({
    method: options.method || 'GET',
    path: endpoint,
    headers: options.headers,
    body: options.body
  });
  
  return result.data;
};
```

### Phase 6: Build and Deployment

#### 6.1 Build Configuration

```json
// package.json scripts
{
  "scripts": {
    "build": "npm run build:client && npm run build:functions",
    "build:client": "vite build --outDir dist/public",
    "build:functions": "cd functions && npm run build",
    "deploy": "firebase deploy",
    "deploy:hosting": "firebase deploy --only hosting",
    "deploy:functions": "firebase deploy --only functions",
    "deploy:firestore": "firebase deploy --only firestore"
  }
}
```

#### 6.2 Environment Variables

```bash
# Firebase project configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=fiber-friends-prod
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id

# Cloud Functions environment
GOOGLE_GENAI_API_KEY=your_gemini_api_key
```

### Phase 7: Testing and Verification

#### 7.1 Migration Testing Checklist

- [ ] User authentication (email/password, Google OAuth)
- [ ] Medical profile creation and updates
- [ ] Symptom entry creation and retrieval
- [ ] Journal entry creation with media uploads
- [ ] Daily check-in functionality
- [ ] Forum post creation and replies
- [ ] Companion progress tracking
- [ ] AI health analysis and insights
- [ ] Peer matching and connections
- [ ] Doctor verification and profiles
- [ ] Research data anonymization
- [ ] File uploads and media storage

#### 7.2 Performance Verification

```typescript
// Test data migration script
export async function verifyMigration() {
  console.log('Verifying user data migration...');
  const users = await db.collection('users').limit(10).get();
  console.log(`✓ Users migrated: ${users.size}`);
  
  console.log('Verifying symptom entries...');
  const symptoms = await db.collection('symptomEntries').limit(10).get();
  console.log(`✓ Symptom entries: ${symptoms.size}`);
  
  console.log('Verifying forum posts...');
  const posts = await db.collection('forumPosts').limit(10).get();
  console.log(`✓ Forum posts: ${posts.size}`);
  
  console.log('Migration verification complete!');
}
```

## Deployment Commands

```bash
# 1. Build the application
npm run build

# 2. Deploy to Firebase
firebase deploy

# 3. Run migration (if needed)
firebase functions:shell
> migrateUserData()
> migrateSymptomEntries()
> migrateJournalEntries()
> migrateForumData()

# 4. Verify deployment
firebase open hosting:site
```

## Post-Migration Cleanup

1. **Remove PostgreSQL dependencies**
2. **Update environment variables**
3. **Remove Express.js session management**
4. **Delete migration scripts**
5. **Update documentation**

## Key Differences from Previous Version

1. **No AI Companion Creation**: Simplified to generic Health Assistant
2. **No Tour System**: Direct onboarding to dashboard
3. **Streamlined Onboarding**: Medical profile → Dashboard
4. **Generic Companion Tiers**: Points and progression without custom creation
5. **Simplified UI**: Removed companion creator and tour components
6. **Pure Firebase**: No localStorage fallbacks or mock data

This migration guide reflects the current state of the application with all recent simplifications and removes the complexity of custom companion creation while maintaining all core health tracking and community features.