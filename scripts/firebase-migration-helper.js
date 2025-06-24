#!/usr/bin/env node

/**
 * Firebase Migration Helper Script
 * Automates the migration process for Fiber Friends to Firebase App Hosting
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = 'C:\\Users\\cmill\\Projects\\ff-webapp-3';

console.log('🚀 Firebase Migration Helper for Fiber Friends');
console.log('==================================================');

function runCommand(command, description) {
  console.log(`\n📝 ${description}`);
  console.log(`Running: ${command}`);
  try {
    execSync(command, { stdio: 'inherit', cwd: PROJECT_ROOT });
    console.log('✅ Success!');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

function createFile(filePath, content, description) {
  console.log(`\n📄 Creating ${description}`);
  const fullPath = path.join(PROJECT_ROOT, filePath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(fullPath, content);
  console.log(`✅ Created: ${filePath}`);
}

function updatePackageJson() {
  const packagePath = path.join(PROJECT_ROOT, 'package.json');
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Add Firebase-specific scripts
    pkg.scripts = {
      ...pkg.scripts,
      "build": "npm run build:client && npm run build:server",
      "build:client": "vite build",
      "build:server": "tsx build server/index.ts",
      "deploy": "npm run build && firebase deploy",
      "serve": "firebase serve",
      "emulator": "firebase emulators:start",
      "functions:serve": "npm run build && firebase emulators:start --only functions",
      "functions:deploy": "firebase deploy --only functions"
    };
    
    // Add Firebase dependencies
    pkg.devDependencies = {
      ...pkg.devDependencies,
      "firebase-tools": "^13.0.0"
    };
    
    fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
    console.log('✅ Updated package.json with Firebase scripts');
  }
}

function createFirebaseConfig() {
  const firebaseJson = {
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
  };
  
  createFile('firebase.json', JSON.stringify(firebaseJson, null, 2), 'Firebase configuration');
}

function createCloudFunction() {
  const functionIndex = `import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import cors from "cors";
import { registerRoutes } from "../../server/routes";

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register all existing API routes
registerRoutes(app);

export const api = onRequest({
  timeoutSeconds: 60,
  memory: "1GiB",
  maxInstances: 10
}, app);
`;

  const functionPackageJson = {
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
  };

  const tsConfig = {
    "compilerOptions": {
      "module": "commonjs",
      "noImplicitReturns": true,
      "noUnusedLocals": true,
      "outDir": "lib",
      "sourceMap": true,
      "strict": true,
      "target": "es2017"
    },
    "compileOnSave": true,
    "include": [
      "src"
    ]
  };
  
  createFile('functions/src/index.ts', functionIndex, 'Cloud Functions entry point');
  createFile('functions/package.json', JSON.stringify(functionPackageJson, null, 2), 'Functions package.json');
  createFile('functions/tsconfig.json', JSON.stringify(tsConfig, null, 2), 'Functions TypeScript config');
}

function createFirestoreRules() {
  const firestoreRules = `rules_version = '2';
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
    
    // Research data - special permissions
    match /research_data/{dataId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Game progress data
    match /game_progress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;

  const storageRules = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User uploads
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public assets
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Generated images
    match /generated-images/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}`;

  createFile('firestore.rules', firestoreRules, 'Firestore security rules');
  createFile('storage.rules', storageRules, 'Storage security rules');
  createFile('firestore.indexes.json', '{"indexes":[],"fieldOverrides":[]}', 'Firestore indexes');
}

function createBuildScript() {
  const buildScript = `#!/bin/bash
echo "🚀 Building Fiber Friends for Firebase..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build client
echo "🏗️ Building client..."
npm run build:client

# Prepare functions
echo "⚡ Preparing Cloud Functions..."
cd functions
npm install
npm run build
cd ..

# Copy static assets
echo "📁 Copying static assets..."
mkdir -p dist/assets
cp -r public/* dist/ 2>/dev/null || true
cp -r attached_assets/* dist/assets/ 2>/dev/null || true

echo "✅ Build complete! Ready for deployment."
echo ""
echo "Next steps:"
echo "1. firebase login"
echo "2. firebase init (if not done)"
echo "3. firebase deploy"
`;

  createFile('build.sh', buildScript, 'Build script');
  
  // Make executable on Unix systems
  try {
    execSync('chmod +x build.sh', { cwd: PROJECT_ROOT });
  } catch (error) {
    // Ignore on Windows
  }
}

function createEnvTemplate() {
  const envTemplate = `# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-app-id

# External APIs
GOOGLE_GENAI_API_KEY=your-google-genai-key
VITE_WEATHERAPI_KEY=your-weather-api-key

# Database (if still using PostgreSQL during transition)
DATABASE_URL=your-database-url

# Other Services
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
`;

  createFile('.env.template', envTemplate, 'Environment variables template');
}

async function main() {
  console.log(`\n🔍 Working in directory: ${PROJECT_ROOT}`);
  
  if (!fs.existsSync(PROJECT_ROOT)) {
    console.error(`❌ Project directory not found: ${PROJECT_ROOT}`);
    console.log('Please ensure you have downloaded and extracted the project files to this location.');
    process.exit(1);
  }
  
  console.log('\n🏗️ Starting Firebase migration setup...\n');
  
  // Step 1: Update package.json
  updatePackageJson();
  
  // Step 2: Create Firebase configuration
  createFirebaseConfig();
  
  // Step 3: Create Cloud Functions
  createCloudFunction();
  
  // Step 4: Create Firestore rules
  createFirestoreRules();
  
  // Step 5: Create build script
  createBuildScript();
  
  // Step 6: Create environment template
  createEnvTemplate();
  
  console.log('\n🎉 Firebase migration setup complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. cd ' + PROJECT_ROOT);
  console.log('2. npm install');
  console.log('3. firebase login');
  console.log('4. firebase init (select your existing project)');
  console.log('5. Copy .env.template to .env and fill in your values');
  console.log('6. npm run build');
  console.log('7. firebase deploy');
  
  console.log('\n📖 For detailed instructions, see FIREBASE_DEPLOYMENT_GUIDE.md');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };