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
The application currently uses both PostgreSQL (from Replit) and Firestore. PostgreSQL should be completely eliminated as all data operations should use Firestore exclusively.

**Current PostgreSQL Tables to Migrate:**
- `users` - User profile data (already in Firestore)
- `symptom_entries` - Symptom tracking data (already in Firestore)
- `journal_entries` - Digital matchbox entries (already in Firestore)
- `forum_posts` - Community posts (already in Firestore)
- `forum_replies` - Community replies (already in Firestore)
- `research_consent` - Research participation data (already in Firestore)
- `medical_profiles` - Medical onboarding data (already in Firestore)
- `doctors` - Verified doctor profiles (needs Firestore migration)

#### 3.2 Data Migration Strategy

**Step 1: Export PostgreSQL Data (if any critical data exists)**
```bash
# Connect to Replit PostgreSQL and export data
pg_dump $DATABASE_URL > backup.sql

# Or export specific tables
pg_dump $DATABASE_URL --table=doctors --data-only --inserts > doctors_data.sql
```

**Step 2: Import to Firestore (if needed)**
Create migration script `migrate-doctors.js`:
```javascript
const admin = require('firebase-admin');
const { Pool } = require('pg');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrateDoctors() {
  try {
    // Fetch doctors from PostgreSQL
    const result = await pool.query('SELECT * FROM doctors');
    const doctors = result.rows;
    
    // Migrate each doctor to Firestore
    for (const doctor of doctors) {
      await db.collection('doctors').doc(doctor.id).set({
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty,
        license: doctor.license,
        verified: doctor.verified,
        morgellonsExperience: doctor.morgellons_experience,
        location: doctor.location,
        createdAt: admin.firestore.Timestamp.fromDate(new Date(doctor.created_at)),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date(doctor.updated_at))
      });
      console.log(`Migrated doctor: ${doctor.name}`);
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrateDoctors();
```

#### 3.3 Remove PostgreSQL Dependencies

**Step 1: Update package.json**
Remove the following dependencies:
```bash
npm uninstall @neondatabase/serverless drizzle-orm drizzle-kit @types/connect-pg-simple connect-pg-simple
```

**Step 2: Remove Database Files**
```bash
# Remove PostgreSQL-specific files
rm server/db.ts
rm drizzle.config.ts
rm -rf drizzle/
```

**Step 3: Update shared/schema.ts**
Replace Drizzle schema with TypeScript interfaces:
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
```

#### 3.4 Update Server Code

**Step 1: Replace server/storage.ts**
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

export const storage = new FirestoreStorage();
```

**Step 2: Update server/routes.ts**
```typescript
import express from 'express';
import { storage } from './storage';
import { createSymptomEntrySchema } from '@shared/schema';

export function registerRoutes(app: express.Express) {
  // Remove all Drizzle/PostgreSQL imports
  // Update to use Firestore storage methods
  
  app.post('/api/symptoms', async (req, res) => {
    try {
      const validatedData = createSymptomEntrySchema.parse(req.body);
      const entry = await storage.createSymptomEntry({
        ...validatedData,
        userId: req.user.uid, // From Firebase Auth
      });
      res.json(entry);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/symptoms', async (req, res) => {
    try {
      const entries = await storage.getSymptomEntries(req.user.uid);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
```

#### 3.5 Environment Variables Cleanup

**Remove PostgreSQL Environment Variables:**
```bash
# Remove from environment configuration
unset DATABASE_URL
unset PGDATABASE
unset PGHOST
unset PGPASSWORD
unset PGPORT
unset PGUSER
```

**Keep Firebase Environment Variables:**
```bash
# Keep these for Firebase configuration
GOOGLE_GENAI_API_KEY
VITE_FIREBASE_API_KEY
VITE_FIREBASE_APP_ID
VITE_FIREBASE_PROJECT_ID
```

#### 3.6 Update Client-Side Data Hooks

**Update hooks to use Firestore directly:**
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
```

#### 3.7 Testing Database Migration

**Step 1: Verify Firestore Data**
```javascript
// Test script to verify Firestore data
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

async function verifyData() {
  // Check users collection
  const usersSnapshot = await db.collection('users').limit(5).get();
  console.log(`Users: ${usersSnapshot.size} documents`);
  
  // Check symptom entries
  const symptomsSnapshot = await db.collection('symptomEntries').limit(5).get();
  console.log(`Symptom entries: ${symptomsSnapshot.size} documents`);
  
  // Check doctors
  const doctorsSnapshot = await db.collection('doctors').limit(5).get();
  console.log(`Doctors: ${doctorsSnapshot.size} documents`);
}

verifyData();
```

**Step 2: Test Application Without PostgreSQL**
```bash
# Remove DATABASE_URL from environment
unset DATABASE_URL

# Start application and verify all features work
npm run dev

# Test key features:
# - User authentication
# - Symptom entry creation
# - Journal entries
# - Community posts
# - Doctor listings
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

This completes the DATABASE_URL migration by fully eliminating PostgreSQL dependencies and ensuring all data operations use Firestore exclusively.

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