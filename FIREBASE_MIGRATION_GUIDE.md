# Fiber Friends - Firebase Migration Guide

## Overview

This document provides complete instructions for migrating the Fiber Friends application from Replit to Firebase hosting platform. The application currently uses Firebase services (Authentication, Firestore, Storage) but is hosted on Replit. This migration will move hosting to Firebase while maintaining all existing functionality.

## Current Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript + Node.js 20
- **Database**: Firebase Firestore (already configured)
- **Authentication**: Firebase Auth (already configured)
- **File Storage**: Firebase Storage (already configured)
- **AI Services**: Google Generative AI + Google Genkit
- **UI**: Tailwind CSS + shadcn/ui components
- **Routing**: Wouter (client-side)
- **State Management**: React Query (TanStack Query)

### Current Firebase Services in Use
- Firebase Authentication (Google OAuth + Email/Password)
- Cloud Firestore Database
- Firebase Storage
- Firebase Hosting (will be enabled)

## Migration Plan

### Phase 1: Preparation and Analysis

#### 1.1 Export Current Codebase
```bash
# Download the entire project from Replit
# Method 1: Git clone (if git is set up)
git clone <replit-git-url>

# Method 2: Download as ZIP from Replit interface
# Go to Files → Download as ZIP

# Method 3: Use Replit CLI
npm install -g @replit/nix
replit-cli download <repl-name>
```

#### 1.2 Analyze Dependencies
Current package.json includes all necessary dependencies. Key packages:
- React and Vite ecosystem
- Firebase SDK v10+
- Express.js for SSR/API
- Google AI packages
- UI component libraries

#### 1.3 Environment Variables Audit
Current environment variables that need migration:
```
DATABASE_URL (PostgreSQL - needs migration to Firestore)
GOOGLE_GENAI_API_KEY
VITE_FIREBASE_API_KEY
VITE_FIREBASE_APP_ID
VITE_FIREBASE_PROJECT_ID
PGDATABASE, PGHOST, PGPASSWORD, PGPORT, PGUSER (eliminate these)
```

### Phase 2: Firebase Project Setup

#### 2.1 Firebase Project Configuration
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project directory
firebase init

# Select the following features:
# ✓ Firestore: Deploy rules and create indexes for Firestore
# ✓ Functions: Configure and deploy Cloud Functions
# ✓ Hosting: Configure and deploy Firebase Hosting sites
# ✓ Storage: Deploy Cloud Storage security rules
```

#### 2.2 Firebase Configuration Files

Create `firebase.json`:
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
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
    ]
  },
  "functions": {
    "source": "functions",
    "node": "18",
    "predeploy": [
      "npm --prefix \"$RESOURCE_DIR\" run build"
    ]
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

Create `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Symptom entries - user-owned
    match /symptomEntries/{entryId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Journal entries - user-owned
    match /journalEntries/{entryId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Forum posts - authenticated read, user write own
    match /forumPosts/{postId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.authorId;
    }
    
    // Forum replies - authenticated read, user write own
    match /forumReplies/{replyId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.authorId;
    }
    
    // Doctors - read for verified doctors
    match /doctors/{doctorId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid == doctorId && 
        resource.data.verified == true;
    }
    
    // User tasks, achievements, etc. - user-owned
    match /{collection}/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

Create `storage.rules`:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload to their own folder
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Journal photos - user-owned
    match /journal-photos/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Phase 3: Database Migration (PostgreSQL to Firestore)

#### 3.1 Current Database Schema Analysis
The application currently runs a **dual-database system** with active PostgreSQL infrastructure alongside Firestore. The PostgreSQL system is fully configured with Drizzle ORM but may contain limited actual data since most React components write directly to Firestore.

**CRITICAL: Current Active PostgreSQL Infrastructure:**
- `server/db.ts` - Active Neon PostgreSQL connection using DATABASE_URL
- `drizzle.config.ts` - Drizzle configuration pointing to PostgreSQL  
- Complete Drizzle schema definitions in `shared/schema.ts`
- Dependencies: `@neondatabase/serverless`, `drizzle-orm`, `drizzle-kit`

**PostgreSQL Tables Currently Defined (may contain data):**
- `users` - User profiles with Firebase UID mapping
- `symptom_entries` - Symptom tracking data
- `journal_entries` - Digital matchbox entries  
- `forum_posts` - Community posts
- `forum_replies` - Community replies
- `research_consent` - Research participation data
- `medical_profiles` - Medical onboarding data
- `research_data` - Research aggregation
- `research_studies` - Study definitions
- `user_study_participation` - Study enrollment
- `doctors` - Verified doctor profiles
- `peer_connections` - Peer matching data  
- `matching_preferences` - User preferences
- `peer_messages` - Private messaging

**Data Flow Issue:** The application uses `MemStorage` in `server/storage.ts` instead of the PostgreSQL database, creating a disconnect between schema definitions and actual data storage.

#### 3.2 Pre-Migration Data Audit

**CRITICAL FIRST STEP: Assess Current Data**
Before migration, determine what data actually exists in PostgreSQL:

```bash
# Connect to Replit PostgreSQL console
psql $DATABASE_URL

# Check for actual data in each table
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'symptom_entries', COUNT(*) FROM symptom_entries  
UNION ALL
SELECT 'journal_entries', COUNT(*) FROM journal_entries
UNION ALL
SELECT 'forum_posts', COUNT(*) FROM forum_posts
UNION ALL
SELECT 'forum_replies', COUNT(*) FROM forum_replies
UNION ALL
SELECT 'doctors', COUNT(*) FROM doctors
UNION ALL
SELECT 'medical_profiles', COUNT(*) FROM medical_profiles
UNION ALL
SELECT 'research_consent', COUNT(*) FROM research_consent
UNION ALL
SELECT 'peer_connections', COUNT(*) FROM peer_connections;

# Check recent data to see if PostgreSQL is actively used
SELECT table_name, MAX(created_at) as latest_entry FROM (
  SELECT 'users' as table_name, created_at FROM users
  UNION ALL
  SELECT 'symptom_entries', created_at FROM symptom_entries
  UNION ALL  
  SELECT 'journal_entries', created_at FROM journal_entries
) data GROUP BY table_name;
```

#### 3.3 Data Migration Strategy

**Step 1: Export PostgreSQL Data (if critical data exists)**
```bash
# Full database backup
pg_dump $DATABASE_URL > fiber_friends_backup.sql

# Export each table separately for controlled migration
pg_dump $DATABASE_URL --table=users --data-only --inserts > users_data.sql
pg_dump $DATABASE_URL --table=doctors --data-only --inserts > doctors_data.sql
pg_dump $DATABASE_URL --table=symptom_entries --data-only --inserts > symptoms_data.sql
pg_dump $DATABASE_URL --table=journal_entries --data-only --inserts > journals_data.sql
pg_dump $DATABASE_URL --table=forum_posts --data-only --inserts > posts_data.sql
pg_dump $DATABASE_URL --table=medical_profiles --data-only --inserts > profiles_data.sql
```

**Step 2: Create Comprehensive Migration Script**
Create `migrate-to-firestore.js`:
```javascript
const admin = require('firebase-admin');
const { Pool } = require('pg');

// Initialize Firebase Admin
admin.initializeApp();
const firestoreDb = admin.firestore();

// PostgreSQL connection  
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Migration counters
const migrationStats = {
  users: 0,
  symptomEntries: 0,
  journalEntries: 0,
  forumPosts: 0,
  forumReplies: 0,
  doctors: 0,
  medicalProfiles: 0,
  researchConsent: 0,
  peerConnections: 0,
  errors: []
};

async function migrateAllData() {
  try {
    console.log('Starting complete PostgreSQL to Firestore migration...');
    
    // Migrate in dependency order (users first, then dependent tables)
    await migrateUsers();
    await migrateDoctors();
    await migrateSymptomEntries();
    await migrateJournalEntries();
    await migrateForumPosts();
    await migrateForumReplies();
    await migrateMedicalProfiles();
    await migrateResearchConsent();
    await migratePeerConnections();
    
    console.log('\n=== MIGRATION SUMMARY ===');
    console.log(`Users: ${migrationStats.users}`);
    console.log(`Symptom Entries: ${migrationStats.symptomEntries}`);
    console.log(`Journal Entries: ${migrationStats.journalEntries}`);
    console.log(`Forum Posts: ${migrationStats.forumPosts}`);
    console.log(`Forum Replies: ${migrationStats.forumReplies}`);
    console.log(`Doctors: ${migrationStats.doctors}`);
    console.log(`Medical Profiles: ${migrationStats.medicalProfiles}`);
    console.log(`Research Consent: ${migrationStats.researchConsent}`);
    console.log(`Peer Connections: ${migrationStats.peerConnections}`);
    console.log(`Errors: ${migrationStats.errors.length}`);
    
    if (migrationStats.errors.length > 0) {
      console.log('\nErrors encountered:');
      migrationStats.errors.forEach(error => console.log(`- ${error}`));
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

async function migrateUsers() {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at');
    const users = result.rows;
    
    for (const user of users) {
      // Use Firebase UID as document ID if available, otherwise use UUID
      const docId = user.firebase_uid || user.id;
      
      await firestoreDb.collection('users').doc(docId).set({
        email: user.email,
        displayName: user.display_name,
        researchOptIn: user.research_opt_in || false,
        onboardingCompleted: true, // Assume existing users completed onboarding
        createdAt: admin.firestore.Timestamp.fromDate(new Date(user.created_at)),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date(user.updated_at))
      });
      
      migrationStats.users++;
    }
    console.log(`✓ Migrated ${users.length} users`);
  } catch (error) {
    const errorMsg = `Users migration error: ${error.message}`;
    migrationStats.errors.push(errorMsg);
    console.error(errorMsg);
  }
}

async function migrateSymptomEntries() {
  try {
    const result = await pool.query(`
      SELECT se.*, u.firebase_uid 
      FROM symptom_entries se 
      JOIN users u ON se.user_id = u.id 
      ORDER BY se.created_at
    `);
    
    for (const entry of result.rows) {
      const userId = entry.firebase_uid || entry.user_id;
      
      await firestoreDb.collection('symptomEntries').add({
        userId: userId,
        symptoms: entry.symptoms || [],
        factors: entry.factors || [],
        notes: entry.notes,
        date: admin.firestore.Timestamp.fromDate(new Date(entry.date)),
        createdAt: admin.firestore.Timestamp.fromDate(new Date(entry.created_at))
      });
      
      migrationStats.symptomEntries++;
    }
    console.log(`✓ Migrated ${result.rows.length} symptom entries`);
  } catch (error) {
    const errorMsg = `Symptom entries migration error: ${error.message}`;
    migrationStats.errors.push(errorMsg);
    console.error(errorMsg);
  }
}

async function migrateJournalEntries() {
  try {
    const result = await pool.query(`
      SELECT je.*, u.firebase_uid 
      FROM journal_entries je 
      JOIN users u ON je.user_id = u.id 
      ORDER BY je.created_at
    `);
    
    for (const entry of result.rows) {
      const userId = entry.firebase_uid || entry.user_id;
      
      await firestoreDb.collection('journalEntries').add({
        userId: userId,
        title: entry.title,
        content: entry.content,
        mediaUrls: entry.media_urls || [],
        linkedSymptomEntry: entry.linked_symptom_entry,
        createdAt: admin.firestore.Timestamp.fromDate(new Date(entry.created_at)),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date(entry.updated_at))
      });
      
      migrationStats.journalEntries++;
    }
    console.log(`✓ Migrated ${result.rows.length} journal entries`);
  } catch (error) {
    const errorMsg = `Journal entries migration error: ${error.message}`;
    migrationStats.errors.push(errorMsg);
    console.error(errorMsg);
  }
}

async function migrateForumPosts() {
  try {
    const result = await pool.query(`
      SELECT fp.*, u.firebase_uid 
      FROM forum_posts fp 
      JOIN users u ON fp.user_id = u.id 
      ORDER BY fp.created_at
    `);
    
    for (const post of result.rows) {
      const userId = post.firebase_uid || post.user_id;
      
      await firestoreDb.collection('forumPosts').add({
        userId: userId,
        category: post.category,
        title: post.title,
        content: post.content,
        isModerated: post.is_moderated || false,
        likes: 0, // Reset likes for Firestore
        replies: 0, // Will be calculated from replies
        isAnonymous: false, // Default value
        tags: [], // Default empty tags
        createdAt: admin.firestore.Timestamp.fromDate(new Date(post.created_at)),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date(post.updated_at))
      });
      
      migrationStats.forumPosts++;
    }
    console.log(`✓ Migrated ${result.rows.length} forum posts`);
  } catch (error) {
    const errorMsg = `Forum posts migration error: ${error.message}`;
    migrationStats.errors.push(errorMsg);
    console.error(errorMsg);
  }
}

async function migrateForumReplies() {
  try {
    const result = await pool.query(`
      SELECT fr.*, u.firebase_uid 
      FROM forum_replies fr 
      JOIN users u ON fr.user_id = u.id 
      ORDER BY fr.created_at
    `);
    
    for (const reply of result.rows) {
      const userId = reply.firebase_uid || reply.user_id;
      
      await firestoreDb.collection('forumReplies').add({
        postId: reply.post_id,
        userId: userId,
        content: reply.content,
        isModerated: reply.is_moderated || false,
        likes: 0, // Reset likes for Firestore
        isAnonymous: false, // Default value
        createdAt: admin.firestore.Timestamp.fromDate(new Date(reply.created_at)),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date(reply.updated_at))
      });
      
      migrationStats.forumReplies++;
    }
    console.log(`✓ Migrated ${result.rows.length} forum replies`);
  } catch (error) {
    const errorMsg = `Forum replies migration error: ${error.message}`;
    migrationStats.errors.push(errorMsg);
    console.error(errorMsg);
  }
}

async function migrateDoctors() {
  try {
    const result = await pool.query('SELECT * FROM doctors ORDER BY created_at');
    
    for (const doctor of result.rows) {
      await firestoreDb.collection('doctors').doc(doctor.id).set({
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty,
        license: doctor.license,
        verified: doctor.verified || false,
        morgellonsExperience: doctor.morgellons_experience || false,
        location: doctor.location,
        rating: doctor.rating || 0,
        reviewCount: doctor.review_count || 0,
        createdAt: admin.firestore.Timestamp.fromDate(new Date(doctor.created_at)),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date(doctor.updated_at))
      });
      
      migrationStats.doctors++;
    }
    console.log(`✓ Migrated ${result.rows.length} doctors`);
  } catch (error) {
    const errorMsg = `Doctors migration error: ${error.message}`;
    migrationStats.errors.push(errorMsg);
    console.error(errorMsg);
  }
}

async function migrateMedicalProfiles() {
  try {
    const result = await pool.query(`
      SELECT mp.*, u.firebase_uid 
      FROM medical_profiles mp 
      JOIN users u ON mp.user_id = u.id
    `);
    
    for (const profile of result.rows) {
      const userId = profile.firebase_uid || profile.user_id;
      
      await firestoreDb.collection('medicalProfiles').doc(userId).set({
        userId: userId,
        age: profile.age,
        gender: profile.gender,
        location: profile.location,
        diagnosisYear: profile.diagnosis_year,
        symptoms: profile.symptoms || [],
        treatments: profile.treatments || [],
        allergies: profile.allergies || [],
        medications: profile.medications || [],
        lifestyle: profile.lifestyle || {},
        createdAt: admin.firestore.Timestamp.fromDate(new Date(profile.created_at)),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date(profile.updated_at))
      });
      
      migrationStats.medicalProfiles++;
    }
    console.log(`✓ Migrated ${result.rows.length} medical profiles`);
  } catch (error) {
    const errorMsg = `Medical profiles migration error: ${error.message}`;
    migrationStats.errors.push(errorMsg);
    console.error(errorMsg);
  }
}

async function migrateResearchConsent() {
  try {
    const result = await pool.query(`
      SELECT rc.*, u.firebase_uid 
      FROM research_consent rc 
      JOIN users u ON rc.user_id = u.id
    `);
    
    for (const consent of result.rows) {
      const userId = consent.firebase_uid || consent.user_id;
      
      await firestoreDb.collection('researchConsent').doc(userId).set({
        userId: userId,
        consentGiven: consent.consent_given || false,
        dataSharing: consent.data_sharing || {},
        anonymousParticipation: consent.anonymous_participation || false,
        contactForStudies: consent.contact_for_studies || false,
        consentDate: admin.firestore.Timestamp.fromDate(new Date(consent.consent_date)),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date(consent.updated_at))
      });
      
      migrationStats.researchConsent++;
    }
    console.log(`✓ Migrated ${result.rows.length} research consent records`);
  } catch (error) {
    const errorMsg = `Research consent migration error: ${error.message}`;
    migrationStats.errors.push(errorMsg);
    console.error(errorMsg);
  }
}

async function migratePeerConnections() {
  try {
    const result = await pool.query(`
      SELECT pc.*, u1.firebase_uid as user1_firebase_uid, u2.firebase_uid as user2_firebase_uid
      FROM peer_connections pc 
      JOIN users u1 ON pc.user1_id = u1.id
      JOIN users u2 ON pc.user2_id = u2.id
    `);
    
    for (const connection of result.rows) {
      const user1Id = connection.user1_firebase_uid || connection.user1_id;
      const user2Id = connection.user2_firebase_uid || connection.user2_id;
      
      await firestoreDb.collection('peerConnections').add({
        user1Id: user1Id,
        user2Id: user2Id,
        status: connection.status || 'pending',
        connectionType: connection.connection_type || 'peer_support',
        createdAt: admin.firestore.Timestamp.fromDate(new Date(connection.created_at)),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date(connection.updated_at))
      });
      
      migrationStats.peerConnections++;
    }
    console.log(`✓ Migrated ${result.rows.length} peer connections`);
  } catch (error) {
    const errorMsg = `Peer connections migration error: ${error.message}`;
    migrationStats.errors.push(errorMsg);
    console.error(errorMsg);
  }
}

// Run the migration
migrateAllData();
```

#### 3.4 Complete PostgreSQL Removal Process

**Step 1: Run Migration Script**
```bash
# Install migration dependencies temporarily
npm install firebase-admin pg

# Set environment variables
export DATABASE_URL="your-postgresql-url"
export GOOGLE_APPLICATION_CREDENTIALS="path/to/firebase-service-account.json"

# Run migration script
node migrate-to-firestore.js

# Verify migration was successful
node verify-firestore-data.js
```

**Step 2: Remove PostgreSQL Dependencies**
```bash
# Remove all PostgreSQL and Drizzle packages
npm uninstall @neondatabase/serverless drizzle-orm drizzle-kit @types/connect-pg-simple connect-pg-simple ws

# Remove migration dependencies (temporary)
npm uninstall pg firebase-admin
```

**Step 3: Remove Database Files and Configurations**
```bash
# Remove PostgreSQL-specific files
rm server/db.ts
rm drizzle.config.ts
rm -rf drizzle/
rm -rf migrations/

# Remove migration scripts after successful migration
rm migrate-to-firestore.js
rm verify-firestore-data.js
```

**Step 4: Clean Environment Variables**
Remove from `.env` and hosting environment:
```bash
# Remove PostgreSQL environment variables
unset DATABASE_URL
unset PGDATABASE
unset PGHOST
unset PGPASSWORD
unset PGPORT
unset PGUSER
```

**Step 5: Completely Replace shared/schema.ts**
Remove all Drizzle/PostgreSQL code and replace with Firestore TypeScript interfaces:
```typescript
// Remove all Drizzle imports
// Replace with TypeScript interfaces for Firestore

export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  researchOptIn: boolean;
  onboardingCompleted: boolean;
}

export interface SymptomEntry {
  id: string;
  userId: string;
  symptoms: string[];
  severity: number;
  location: string[];
  environmentalFactors: string[];
  notes?: string;
  timestamp: Date;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood?: number;
  photoUrls: string[];
  treatments: string[];
  timestamp: Date;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  authorId: string;
  authorName: string;
  timestamp: Date;
  likes: number;
  replies: number;
  isAnonymous: boolean;
  tags: string[];
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  license: string;
  verified: boolean;
  morgellonsExperience: boolean;
  location: string;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
}

// Add validation schemas using Zod
import { z } from 'zod';

export const createSymptomEntrySchema = z.object({
  symptoms: z.array(z.string()),
  severity: z.number().min(1).max(10),
  location: z.array(z.string()),
  environmentalFactors: z.array(z.string()),
  notes: z.string().optional(),
});

export const createJournalEntrySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  mood: z.number().min(1).max(10).optional(),
  treatments: z.array(z.string()),
});

export const createForumPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.string(),
  isAnonymous: z.boolean(),
  tags: z.array(z.string()),
});

// Additional interfaces for complete schema coverage
export interface ForumReply {
  id: string;
  postId: string;
  userId: string;
  authorName: string;
  content: string;
  likes: number;
  isAnonymous: boolean;
  timestamp: Date;
}

export interface MedicalProfile {
  userId: string;
  age?: number;
  gender?: string;
  location?: string;
  diagnosisYear?: number;
  symptoms: string[];
  treatments: string[];
  allergies: string[];
  medications: string[];
  lifestyle: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResearchConsent {
  userId: string;
  consentGiven: boolean;
  dataSharing: Record<string, boolean>;
  anonymousParticipation: boolean;
  contactForStudies: boolean;
  consentDate: Date;
  updatedAt: Date;
}

export interface PeerConnection {
  id: string;
  user1Id: string;
  user2Id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  connectionType: 'peer_support' | 'mentor' | 'research_partner';
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchingPreferences {
  userId: string;
  ageRange: { min: number; max: number };
  location?: string;
  supportTypes: string[];
  interests: string[];
  communicationStyle: string;
  privacyLevel: string;
  experienceLevel: string;
  updatedAt: Date;
}

// Additional validation schemas
export const createMedicalProfileSchema = z.object({
  age: z.number().min(18).max(120).optional(),
  gender: z.string().optional(),
  location: z.string().optional(),
  diagnosisYear: z.number().min(1900).max(new Date().getFullYear()).optional(),
  symptoms: z.array(z.string()),
  treatments: z.array(z.string()),
  allergies: z.array(z.string()),
  medications: z.array(z.string()),
  lifestyle: z.record(z.any()),
});

export const createResearchConsentSchema = z.object({
  consentGiven: z.boolean(),
  dataSharing: z.record(z.boolean()),
  anonymousParticipation: z.boolean(),
  contactForStudies: z.boolean(),
});
```

#### 3.5 Update Server Code

**Step 1: Replace server/storage.ts with Complete Firestore Implementation**
```typescript
import { getFirestore } from 'firebase-admin/firestore';
import { User, SymptomEntry, JournalEntry } from '@shared/schema';

const db = getFirestore();

export class FirestoreStorage {
  async getUser(id: string): Promise<User | undefined> {
    const doc = await db.collection('users').doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data() } as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const snapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (snapshot.empty) return undefined;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const docRef = await db.collection('users').add({
      ...userData,
      createdAt: new Date(),
    });
    
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as User;
  }

  async createSymptomEntry(entry: Omit<SymptomEntry, 'id'>): Promise<SymptomEntry> {
    const docRef = await db.collection('symptomEntries').add({
      ...entry,
      timestamp: new Date(),
    });
    
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as SymptomEntry;
  }

  async getSymptomEntries(userId: string): Promise<SymptomEntry[]> {
    const snapshot = await db.collection('symptomEntries')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SymptomEntry));
  }
}

  // Medical Profiles
  async createMedicalProfile(userId: string, profile: Partial<MedicalProfile>): Promise<MedicalProfile> {
    const docRef = db.collection('medicalProfiles').doc(userId);
    const profileData = {
      ...profile,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await docRef.set(profileData);
    return profileData as MedicalProfile;
  }

  async getMedicalProfile(userId: string): Promise<MedicalProfile | undefined> {
    const doc = await db.collection('medicalProfiles').doc(userId).get();
    if (!doc.exists) return undefined;
    return { ...doc.data(), userId: doc.id } as MedicalProfile;
  }

  // Forum Posts
  async createForumPost(post: Omit<ForumPost, 'id'>): Promise<ForumPost> {
    const docRef = await db.collection('forumPosts').add({
      ...post,
      timestamp: new Date(),
      likes: 0,
      replies: 0,
    });
    
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as ForumPost;
  }

  async getForumPosts(category?: string): Promise<ForumPost[]> {
    let query = db.collection('forumPosts').orderBy('timestamp', 'desc');
    
    if (category) {
      query = query.where('category', '==', category);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ForumPost));
  }

  // Doctors
  async createDoctor(doctor: Omit<Doctor, 'id'>): Promise<Doctor> {
    const docRef = await db.collection('doctors').add({
      ...doctor,
      createdAt: new Date(),
      verified: false,
      rating: 0,
      reviewCount: 0,
    });
    
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Doctor;
  }

  async getVerifiedDoctors(): Promise<Doctor[]> {
    const snapshot = await db.collection('doctors')
      .where('verified', '==', true)
      .orderBy('rating', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Doctor));
  }

  // Research Consent
  async createResearchConsent(userId: string, consent: Omit<ResearchConsent, 'userId'>): Promise<ResearchConsent> {
    const docRef = db.collection('researchConsent').doc(userId);
    const consentData = {
      ...consent,
      userId,
      consentDate: new Date(),
      updatedAt: new Date(),
    };
    
    await docRef.set(consentData);
    return consentData as ResearchConsent;
  }

  async getResearchConsent(userId: string): Promise<ResearchConsent | undefined> {
    const doc = await db.collection('researchConsent').doc(userId).get();
    if (!doc.exists) return undefined;
    return { ...doc.data(), userId: doc.id } as ResearchConsent;
  }

  // Peer Connections
  async createPeerConnection(connection: Omit<PeerConnection, 'id'>): Promise<PeerConnection> {
    const docRef = await db.collection('peerConnections').add({
      ...connection,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as PeerConnection;
  }

  async getPeerConnections(userId: string): Promise<PeerConnection[]> {
    const snapshot = await db.collection('peerConnections')
      .where('user1Id', '==', userId)
      .get();
    
    const snapshot2 = await db.collection('peerConnections')
      .where('user2Id', '==', userId)
      .get();
    
    const connections = [
      ...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PeerConnection)),
      ...snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() } as PeerConnection))
    ];
    
    return connections;
  }
}

export const storage = new FirestoreStorage();
```

**Step 2: Update server/routes.ts with Complete API Routes**
```typescript
import express from 'express';
import { storage } from './storage';
import { 
  createSymptomEntrySchema, 
  createJournalEntrySchema,
  createForumPostSchema,
  createMedicalProfileSchema,
  createResearchConsentSchema
} from '@shared/schema';

export function registerRoutes(app: express.Express) {
  // Middleware to verify Firebase Auth token
  const verifyFirebaseToken = async (req: any, res: any, next: any) => {
    try {
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // Symptom Entries Routes
  app.post('/api/symptoms', verifyFirebaseToken, async (req, res) => {
    try {
      const validatedData = createSymptomEntrySchema.parse(req.body);
      const entry = await storage.createSymptomEntry({
        ...validatedData,
        userId: req.user.uid,
      });
      res.json(entry);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/symptoms', verifyFirebaseToken, async (req, res) => {
    try {
      const entries = await storage.getSymptomEntries(req.user.uid);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Journal Entries Routes
  app.post('/api/journal', verifyFirebaseToken, async (req, res) => {
    try {
      const validatedData = createJournalEntrySchema.parse(req.body);
      const entry = await storage.createJournalEntry({
        ...validatedData,
        userId: req.user.uid,
      });
      res.json(entry);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/journal', verifyFirebaseToken, async (req, res) => {
    try {
      const entries = await storage.getJournalEntries(req.user.uid);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Forum Routes
  app.post('/api/forum/posts', verifyFirebaseToken, async (req, res) => {
    try {
      const validatedData = createForumPostSchema.parse(req.body);
      const post = await storage.createForumPost({
        ...validatedData,
        authorId: req.user.uid,
        authorName: req.user.name || req.user.email,
      });
      res.json(post);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/forum/posts', async (req, res) => {
    try {
      const category = req.query.category as string;
      const posts = await storage.getForumPosts(category);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Medical Profile Routes
  app.post('/api/medical-profile', verifyFirebaseToken, async (req, res) => {
    try {
      const validatedData = createMedicalProfileSchema.parse(req.body);
      const profile = await storage.createMedicalProfile(req.user.uid, validatedData);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/medical-profile', verifyFirebaseToken, async (req, res) => {
    try {
      const profile = await storage.getMedicalProfile(req.user.uid);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Research Consent Routes
  app.post('/api/research-consent', verifyFirebaseToken, async (req, res) => {
    try {
      const validatedData = createResearchConsentSchema.parse(req.body);
      const consent = await storage.createResearchConsent(req.user.uid, validatedData);
      res.json(consent);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/research-consent', verifyFirebaseToken, async (req, res) => {
    try {
      const consent = await storage.getResearchConsent(req.user.uid);
      res.json(consent);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Doctors Routes
  app.get('/api/doctors', async (req, res) => {
    try {
      const doctors = await storage.getVerifiedDoctors();
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Peer Connections Routes
  app.get('/api/peer-connections', verifyFirebaseToken, async (req, res) => {
    try {
      const connections = await storage.getPeerConnections(req.user.uid);
      res.json(connections);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/peer-connections', verifyFirebaseToken, async (req, res) => {
    try {
      const connection = await storage.createPeerConnection({
        user1Id: req.user.uid,
        user2Id: req.body.targetUserId,
        status: 'pending',
        connectionType: req.body.connectionType || 'peer_support',
      });
      res.json(connection);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
}
```

#### 3.6 Update All Client-Side Components

**Step 1: Remove PostgreSQL API Calls**
Search and replace all API calls that might reference PostgreSQL data structures:

```bash
# Find all API calls in client code
grep -r "api/" client/src --include="*.ts" --include="*.tsx"

# Common patterns to update:
# - Remove any Drizzle type imports
# - Update API response handling for Firestore data structures
# - Ensure all forms use new Zod schemas
```

**Step 2: Update Hooks to Match New API Structure**

**Complete Hook Updates:**
```typescript
// client/src/hooks/useSymptomData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export function useSymptomEntries() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['symptomEntries', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      
      const q = query(
        collection(db, 'symptomEntries'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
    enabled: !!user,
  });
}

export function useCreateSymptomEntry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      if (!user) throw new Error('User not authenticated');
      
      return await addDoc(collection(db, 'symptomEntries'), {
        ...data,
        userId: user.uid,
        timestamp: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['symptomEntries'] });
    },
  });
}

// Add similar hooks for all other data types
export function useJournalEntries() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['journalEntries', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      
      const response = await fetch('/api/journal', {
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });
      return response.json();
    },
    enabled: !!user,
  });
}

export function useForumPosts(category?: string) {
  return useQuery({
    queryKey: ['forumPosts', category],
    queryFn: async () => {
      const url = category ? `/api/forum/posts?category=${category}` : '/api/forum/posts';
      const response = await fetch(url);
      return response.json();
    },
  });
}

export function useMedicalProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['medicalProfile', user?.uid],
    queryFn: async () => {
      if (!user) return null;
      
      const response = await fetch('/api/medical-profile', {
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });
      return response.json();
    },
    enabled: !!user,
  });
}

export function useVerifiedDoctors() {
  return useQuery({
    queryKey: ['doctors', 'verified'],
    queryFn: async () => {
      const response = await fetch('/api/doctors');
      return response.json();
    },
  });
}
```

#### 3.7 Create Data Verification Script

**Create verify-firestore-data.js:**
```javascript
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

async function verifyFirestoreData() {
  console.log('Verifying Firestore data migration...\n');
  
  const collections = [
    'users',
    'symptomEntries', 
    'journalEntries',
    'forumPosts',
    'forumReplies',
    'doctors',
    'medicalProfiles',
    'researchConsent',
    'peerConnections'
  ];
  
  for (const collectionName of collections) {
    try {
      const snapshot = await db.collection(collectionName).limit(5).get();
      console.log(`✓ ${collectionName}: ${snapshot.size} documents (showing first 5)`);
      
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`  ${index + 1}. ID: ${doc.id}`);
        console.log(`     Created: ${data.createdAt?.toDate?.() || 'No timestamp'}`);
        console.log(`     Sample data: ${JSON.stringify(Object.keys(data)).substring(0, 80)}...`);
      });
      console.log('');
    } catch (error) {
      console.error(`✗ Error checking ${collectionName}:`, error.message);
    }
  }
  
  // Check for data consistency
  console.log('Checking data relationships...');
  
  try {
    // Check user-symptom relationship
    const symptomsSnapshot = await db.collection('symptomEntries').limit(3).get();
    for (const symptomDoc of symptomsSnapshot.docs) {
      const symptomData = symptomDoc.data();
      const userDoc = await db.collection('users').doc(symptomData.userId).get();
      if (userDoc.exists) {
        console.log(`✓ Symptom entry ${symptomDoc.id} linked to user ${symptomData.userId}`);
      } else {
        console.log(`✗ Orphaned symptom entry ${symptomDoc.id} - user ${symptomData.userId} not found`);
      }
    }
  } catch (error) {
    console.error('Error checking relationships:', error.message);
  }
  
  console.log('\nVerification complete.');
}

verifyFirestoreData();
```

#### 3.8 Testing Complete Migration

**Step 1: Pre-Migration Testing**
```bash
# Backup current environment
cp .env .env.backup

# Test current functionality before migration
npm run dev

# Document working features for comparison
echo "Working features before migration:" > migration-test-log.txt
curl -X GET http://localhost:5000/api/symptoms >> migration-test-log.txt
```

**Step 2: Run Complete Migration Process**
```bash
# 1. Run data migration
node migrate-to-firestore.js > migration-log.txt 2>&1

# 2. Verify data migration
node verify-firestore-data.js >> migration-log.txt 2>&1

# 3. Remove PostgreSQL code and dependencies
npm uninstall @neondatabase/serverless drizzle-orm drizzle-kit ws
rm server/db.ts drizzle.config.ts

# 4. Update schema file
# (Replace content as shown in step 3.5)

# 5. Update storage implementation  
# (Replace content as shown in step 3.5)

# 6. Update route handlers
# (Replace content as shown in step 3.5)
```

**Step 3: Test Application After Migration**
```bash
# Remove PostgreSQL environment variables
unset DATABASE_URL
unset PGDATABASE PGHOST PGPASSWORD PGPORT PGUSER

# Start application with Firestore only
npm run dev

# Test all endpoints
curl -X GET http://localhost:5000/api/forum/posts
curl -X GET http://localhost:5000/api/doctors

# Test authentication flow
# Test symptom entry creation  
# Test journal entry creation
# Test community posting
# Test doctor listing
# Test medical profile creation
# Test research consent flow
```

**Step 4: Comprehensive Feature Testing**
Create `test-migration.js`:
```javascript
// Automated testing script for post-migration functionality
const axios = require('axios');

async function testMigration() {
  const baseURL = 'http://localhost:5000';
  
  console.log('Testing migrated application...\n');
  
  const tests = [
    { name: 'Forum Posts', endpoint: '/api/forum/posts' },
    { name: 'Doctors List', endpoint: '/api/doctors' },
    { name: 'Health Check', endpoint: '/api/health' }
  ];
  
  for (const test of tests) {
    try {
      const response = await axios.get(`${baseURL}${test.endpoint}`);
      console.log(`✓ ${test.name}: ${response.status} - ${response.data.length || 'OK'}`);
    } catch (error) {
      console.log(`✗ ${test.name}: ${error.response?.status || 'ERROR'} - ${error.message}`);
    }
  }
  
  console.log('\nMigration testing complete.');
}

testMigration();
```

#### 3.8 Performance Optimization

**Firestore Indexes (firestore.indexes.json):**
```json
{
  "indexes": [
    {
      "collectionGroup": "symptomEntries",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "userId", "order": "ASCENDING"},
        {"fieldPath": "timestamp", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "journalEntries",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "userId", "order": "ASCENDING"},
        {"fieldPath": "timestamp", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "forumPosts",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "category", "order": "ASCENDING"},
        {"fieldPath": "timestamp", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "doctors",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "verified", "order": "ASCENDING"},
        {"fieldPath": "specialty", "order": "ASCENDING"}
      ]
    }
  ]
}
```

#### 3.9 Final Cleanup and Verification

**Step 1: Remove All PostgreSQL References**
```bash
# Search for any remaining PostgreSQL references
grep -r "DATABASE_URL\|drizzle\|pg\|postgresql" . --exclude-dir=node_modules --exclude="*.md"

# Remove any found references and update code accordingly
```

**Step 2: Update Package.json Scripts**
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && tsc -p server",
    "start": "NODE_ENV=production node dist/index.js",
    "migrate": "echo 'PostgreSQL removed - using Firestore only'",
    "db:push": "echo 'PostgreSQL removed - using Firestore only'"
  }
}
```

**Step 3: Create Final Documentation**
Create `MIGRATION_COMPLETED.md`:
```markdown
# Migration Completed - PostgreSQL to Firestore

## Summary
- ✅ All PostgreSQL dependencies removed
- ✅ All data migrated to Firestore  
- ✅ All API routes updated for Firestore
- ✅ All client hooks updated
- ✅ All validation schemas converted
- ✅ Environment variables cleaned up

## Verification Results
[Include results from migration-log.txt]

## Next Steps for Firebase Hosting
1. Follow Firebase deployment steps in main migration guide
2. Deploy Cloud Functions for API routes
3. Deploy static assets to Firebase Hosting
4. Update environment variables in Firebase Console

Migration completed on: [DATE]
```

**Step 4: Performance Optimization Post-Migration**
```bash
# Deploy Firestore indexes for optimal performance
firebase deploy --only firestore:indexes

# Monitor initial performance
firebase emulators:start --only firestore
# Run performance tests with real data load
```

This completes the comprehensive PostgreSQL to Firestore migration, ensuring zero PostgreSQL dependencies remain and all functionality operates exclusively through Firebase services.

### Phase 4: Backend Migration to Cloud Functions

#### 4.1 Cloud Functions Setup
```bash
# Create functions directory
mkdir functions
cd functions
npm init -y

# Install dependencies
npm install firebase-admin firebase-functions express cors
npm install -D typescript @types/node
```

#### 4.2 Convert Express Routes to Cloud Functions
Create `functions/src/index.ts`:
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));

// Import existing routes
import { registerRoutes } from './routes';
registerRoutes(app);

export const api = functions.https.onRequest(app);
```

#### 4.3 Migrate Existing Routes
Copy all route files from `server/routes/` to `functions/src/routes/`:
- `ai.ts` - AI health insights and analysis
- `peer-recommendations.ts` - Peer matching system
- `research.ts` - Research data aggregation

Update imports to use Firebase Admin SDK instead of direct Firestore client.

### Phase 5: Frontend Build Configuration

#### 5.1 Update Vite Configuration
Modify `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
      '@assets': path.resolve(__dirname, './attached_assets'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', 'lucide-react'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
```

#### 5.2 Update Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && firebase deploy"
  }
}
```

### Phase 6: Environment Variables and Configuration

#### 6.1 Firebase Environment Configuration
```bash
# Set environment variables for Cloud Functions
firebase functions:config:set gemini.api_key="your-gemini-api-key"
firebase functions:config:set app.environment="production"

# For local development, create .env.local
echo "VITE_FIREBASE_API_KEY=your-api-key" >> .env.local
echo "VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com" >> .env.local
echo "VITE_FIREBASE_PROJECT_ID=your-project-id" >> .env.local
echo "VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com" >> .env.local
echo "VITE_FIREBASE_APP_ID=your-app-id" >> .env.local
```

#### 6.2 Update Firebase Configuration
Modify `client/src/lib/firebase.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
```

### Phase 7: Code Modifications Required

#### 7.1 Remove Replit-Specific Code
- Remove `server/vite.ts` (Replit's Vite integration)
- Remove PostgreSQL connection code
- Remove Replit environment detection

#### 7.2 Update API Calls
Change all API calls from relative paths to Firebase Functions:
```typescript
// Before (Replit)
const response = await fetch('/api/symptoms');

// After (Firebase)
const response = await fetch('https://your-region-your-project.cloudfunctions.net/api/symptoms');
```

#### 7.3 Update File Upload Logic
Ensure all file uploads use Firebase Storage URLs:
```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

const uploadFile = async (file: File, userId: string) => {
  const storageRef = ref(storage, `journal-photos/${userId}/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};
```

### Phase 8: Testing and Deployment

#### 8.1 Local Testing
```bash
# Install dependencies
npm install

# Start Firebase emulators
firebase emulators:start

# In another terminal, start development server
npm run dev
```

#### 8.2 Build and Deploy
```bash
# Build the application
npm run build

# Deploy to Firebase
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions
```

### Phase 9: DNS and Domain Configuration

#### 9.1 Custom Domain Setup (Optional)
```bash
# Add custom domain
firebase hosting:sites:create your-custom-site

# Connect custom domain
firebase target:apply hosting production your-custom-site
firebase hosting:channel:deploy live --expires 30d
```

### Phase 10: Monitoring and Performance

#### 10.1 Enable Analytics
```typescript
import { getAnalytics } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';

const analytics = getAnalytics(app);
const performance = getPerformance(app);
```

#### 10.2 Set up Monitoring
- Enable Firebase Performance Monitoring
- Set up Cloud Functions monitoring
- Configure error tracking

## Migration Checklist

### Pre-Migration
- [ ] Export complete codebase from Replit
- [ ] Document all environment variables
- [ ] Test all current functionality
- [ ] Backup Firebase data

### Firebase Setup
- [ ] Create Firebase project (if not exists)
- [ ] Enable required services (Auth, Firestore, Storage, Functions, Hosting)
- [ ] Configure billing (Functions require Blaze plan)
- [ ] Set up Firebase CLI locally

### Code Migration
- [ ] Remove PostgreSQL dependencies and code
- [ ] Convert Express routes to Cloud Functions
- [ ] Update API endpoints to use Functions URLs
- [ ] Modify build configuration for Firebase Hosting
- [ ] Update environment variable handling

### Testing
- [ ] Test authentication flow
- [ ] Test all CRUD operations with Firestore
- [ ] Test file uploads to Firebase Storage
- [ ] Test AI functionality with Google Generative AI
- [ ] Test all user journeys end-to-end

### Deployment
- [ ] Deploy Cloud Functions
- [ ] Deploy Firebase Hosting
- [ ] Configure custom domain (if needed)
- [ ] Set up monitoring and analytics

### Post-Migration
- [ ] Monitor application performance
- [ ] Check error logs in Firebase Console
- [ ] Verify all features work correctly
- [ ] Update documentation
- [ ] Inform users of any changes

## Cost Considerations

### Firebase Pricing
- **Hosting**: Free tier includes 10GB storage, 10GB/month transfer
- **Functions**: Free tier includes 2M invocations/month
- **Firestore**: Free tier includes 1GB storage, 50K reads/day, 20K writes/day
- **Storage**: Free tier includes 5GB storage, 1GB/day downloads
- **Authentication**: Free tier includes 50K MAU

### Upgrade Requirements
- Cloud Functions require Blaze (pay-as-you-go) plan
- Consider usage patterns and scale appropriately

## Security Considerations

### Firestore Security Rules
- Implement proper security rules for all collections
- Test rules thoroughly with Firebase Emulator
- Use field-level security where needed

### Cloud Functions Security
- Validate all inputs
- Use Firebase Admin SDK for privileged operations
- Implement proper error handling

### Environment Variables
- Never commit secrets to version control
- Use Firebase Functions configuration for sensitive data
- Rotate API keys after migration

## Troubleshooting Common Issues

### Build Errors
- Ensure all dependencies are properly installed
- Check TypeScript configuration
- Verify file paths and imports

### Function Deployment Issues
- Check Node.js version compatibility
- Verify Firebase project configuration
- Review function logs in Firebase Console

### Authentication Issues
- Verify Firebase Auth configuration
- Check domain authorization
- Test OAuth redirect URLs

## Support and Resources

### Documentation
- [Firebase Hosting Guide](https://firebase.google.com/docs/hosting)
- [Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules-structure)

### Community
- Firebase Community Slack
- Stack Overflow Firebase tag
- Firebase GitHub repositories

## Conclusion

This migration will move Fiber Friends from Replit's hosting to Firebase's robust infrastructure while maintaining all existing functionality. The key benefits include:

- Better scalability with Cloud Functions
- Integrated Firebase services
- Improved performance with CDN
- Professional hosting infrastructure
- Enhanced security with Firebase Auth integration

Follow this guide step-by-step, testing thoroughly at each phase to ensure a smooth migration with minimal downtime.