# Firebase App Hosting Deployment Guide
## Fiber Friends - Morgellons Health Companion

This guide will walk you through deploying your Fiber Friends application to Firebase App Hosting from your local project folder.

## Prerequisites

- Node.js 18 or higher installed
- Firebase CLI installed globally
- Google Cloud account with billing enabled
- Your project files downloaded to `C:\Users\cmill\Projects\ff-webapp-3`

## Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

Verify installation:
```bash
firebase --version
```

## Step 2: Login to Firebase

```bash
firebase login
```

This will open a browser window for Google authentication.

## Step 3: Project Setup

### 3.1 Navigate to Project Directory
```bash
cd C:\Users\cmill\Projects\ff-webapp-3
```

### 3.2 Initialize Firebase Project
```bash
firebase init
```

Select the following options:
- ✅ Hosting: Configure files for Firebase Hosting
- ✅ Functions: Configure a Cloud Functions directory
- ✅ Firestore: Configure security rules and indexes
- ✅ Storage: Configure security rules for Cloud Storage

### 3.3 Firebase Project Configuration

When prompted:
1. **Use an existing project**: Select your existing Firebase project (or create new)
2. **Firestore Rules**: Use default (`firestore.rules`)
3. **Firestore Indexes**: Use default (`firestore.indexes.json`)
4. **Functions Language**: TypeScript
5. **ESLint**: Yes
6. **Install dependencies**: Yes
7. **Public directory**: `dist` (not `public`)
8. **Single-page app**: Yes
9. **Automatic builds**: Yes
10. **Storage Rules**: Use default (`storage.rules`)

## Step 4: Project Structure Updates

### 4.1 Update package.json
Add deployment scripts:

```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "tsx build server/index.ts",
    "deploy": "npm run build && firebase deploy",
    "serve": "firebase serve",
    "postbuild": "cp -r public/* dist/ 2>/dev/null || :"
  }
}
```

### 4.2 Create firebase.json
```json
{
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
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
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

## Step 5: Cloud Functions Setup

### 5.1 Create functions/src/index.ts
```typescript
import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import cors from "cors";

// Import your existing server routes
import { registerRoutes } from "../../server/routes";

const app = express();

// Configure CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Register all your existing API routes
registerRoutes(app);

// Export the Express app as a Cloud Function
export const api = onRequest({
  timeoutSeconds: 60,
  memory: "1GiB"
}, app);
```

### 5.2 Update functions/package.json
```json
{
  "name": "functions",
  "scripts": {
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "shell": "npm run build && firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "main": "lib/index.js",
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^4.8.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "@google/genai": "^0.2.1",
    "@neondatabase/serverless": "^0.7.2",
    "drizzle-orm": "^0.29.0",
    "ws": "^8.14.2"
  },
  "devDependencies": {
    "typescript": "^5.2.2",
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13"
  }
}
```

## Step 6: Environment Variables Configuration

### 6.1 Set Firebase Environment Variables
```bash
firebase functions:config:set \
  app.google_genai_api_key="your-google-genai-key" \
  app.database_url="your-database-url" \
  app.weatherapi_key="your-weather-api-key"
```

### 6.2 Create .env for local development
```env
GOOGLE_GENAI_API_KEY=your-google-genai-key
DATABASE_URL=your-database-url
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_WEATHERAPI_KEY=your-weather-api-key
```

## Step 7: Database Migration (Neon to Firestore)

### 7.1 Export Current Data (if needed)
```bash
# Run this on your current Replit environment
node scripts/export-data.js > data-export.json
```

### 7.2 Update Database Configuration
Replace Neon PostgreSQL with Firestore in your application:

```typescript
// Replace server/db.ts content
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = initializeApp();
export const db = getFirestore(app);
```

### 7.3 Update Data Models
Convert your Drizzle schema to Firestore collections:

```typescript
// Example: Convert users table to Firestore collection
export const createUser = async (userData: any) => {
  const userRef = db.collection('users').doc();
  await userRef.set({
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return userRef.id;
};
```

## Step 8: Build Configuration

### 8.1 Update vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
      '@assets': path.resolve(__dirname, './attached_assets')
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
});
```

### 8.2 Create build script
```bash
# Create build.sh
#!/bin/bash
echo "Building Fiber Friends for Firebase..."

# Build client
echo "Building client..."
npm run build:client

# Copy functions
echo "Preparing functions..."
cp -r server/* functions/src/
cd functions
npm install
npm run build
cd ..

# Copy static assets
echo "Copying assets..."
cp -r public/* dist/ 2>/dev/null || :
cp -r attached_assets dist/assets/ 2>/dev/null || :

echo "Build complete!"
```

## Step 9: Firestore Security Rules

### 9.1 Create firestore.rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Symptom entries - user owns their data
    match /symptom_entries/{entryId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Journal entries - user owns their data
    match /journal_entries/{entryId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Forum posts - authenticated users can read, write own
    match /forum_posts/{postId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
    }
    
    // Research data - read-only for researchers
    match /research_data/{dataId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'researcher';
      allow write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

### 9.2 Create storage.rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User uploads - images and documents
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public assets
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Generated AI images
    match /generated-images/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Step 10: Deployment Process

### 10.1 Test Locally
```bash
# Install dependencies
npm install

# Install functions dependencies
cd functions
npm install
cd ..

# Build the project
npm run build

# Test with Firebase emulators
firebase emulators:start
```

### 10.2 Deploy to Production
```bash
# Deploy everything
firebase deploy

# Or deploy incrementally
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### 10.3 Verify Deployment
After deployment, verify:
1. Visit your Firebase Hosting URL
2. Test user authentication
3. Verify API endpoints work
4. Test file uploads
5. Check Firestore data operations

## Step 11: Post-Deployment Configuration

### 11.1 Configure Custom Domain (Optional)
```bash
firebase hosting:channel:deploy production --only hosting
```

### 11.2 Set up CI/CD (Optional)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Firebase
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
```

## Step 12: Monitoring and Maintenance

### 12.1 Enable Firebase Analytics
Add to your app initialization:
```typescript
import { getAnalytics } from "firebase/analytics";
const analytics = getAnalytics(app);
```

### 12.2 Set up Error Monitoring
```bash
npm install @firebase/crashlytics
```

### 12.3 Monitor Performance
- Check Firebase Console for performance metrics
- Monitor Cloud Functions execution
- Track Firestore usage and costs

## Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check import paths after migration

2. **Function Timeout**
   - Increase timeout in functions configuration
   - Optimize database queries
   - Add proper error handling

3. **CORS Issues**
   - Update CORS configuration in functions
   - Check firebase.json headers configuration

4. **Authentication Issues**
   - Verify Firebase Auth configuration
   - Check authorized domains in Firebase Console
   - Update redirect URLs

### Support Resources:
- Firebase Documentation: https://firebase.google.com/docs
- Firebase CLI Reference: https://firebase.google.com/docs/cli
- Cloud Functions Guide: https://firebase.google.com/docs/functions

## Cost Optimization Tips

1. **Firestore**: Use compound queries to reduce reads
2. **Cloud Functions**: Set appropriate memory allocation
3. **Storage**: Implement file size limits
4. **Hosting**: Enable compression and caching

---

**Note**: This migration will move you from a Node.js server architecture to a serverless Firebase architecture. Test thoroughly in the Firebase emulator before deploying to production.