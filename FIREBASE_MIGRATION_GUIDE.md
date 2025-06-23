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
The application currently uses both PostgreSQL (from Replit) and Firestore. PostgreSQL should be completely eliminated.

#### 3.2 Remove PostgreSQL Dependencies
Remove from `package.json`:
- `@neondatabase/serverless`
- `drizzle-orm`
- `drizzle-kit`
- `@types/connect-pg-simple`
- `connect-pg-simple`

#### 3.3 Update Database Connection Files
Modify `server/db.ts`:
```typescript
// Remove PostgreSQL imports
// Keep only Firebase imports
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = initializeApp();
export const db = getFirestore(app);
```

Remove `drizzle.config.ts` completely.

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