# Fiber Friends - Morgellons Health Companion

## Overview

Fiber Friends is a comprehensive health tracking and community support application specifically designed for people with Morgellons disease. The application provides secure symptom tracking, digital journaling, data visualization, community forums, and provider-ready reporting features.

The system is built as a full-stack web application with a React frontend and Express.js backend, utilizing Firebase for authentication and file storage, PostgreSQL for data persistence, and shadcn/ui for the user interface components.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Query (TanStack Query) for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite for development and production builds
- **Forms**: React Hook Form with Zod for validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js 20
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful APIs with /api prefix routing
- **Session Management**: Express sessions with PostgreSQL store

### Authentication & Authorization
- **Provider**: Firebase Authentication
- **Methods**: Email/password and Google OAuth
- **Security**: Secure session management with HTTP-only cookies
- **User Management**: Firebase user data synchronized with PostgreSQL user records

## Key Components

### Data Models
The application uses a comprehensive database schema with the following core entities:

- **Users**: Firebase UID integration with research opt-in preferences
- **Symptom Entries**: Structured symptom tracking with factors and notes
- **Journal Entries**: Digital "matchbox" for observations and media
- **Forum Posts & Replies**: Community discussion with moderation
- **File Storage**: Firebase Storage integration for media uploads

### Core Features
1. **Symptom Tracker**: Comprehensive symptom logging with severity scales, factors, and correlations
2. **Digital Matchbox**: Secure journaling with photo documentation capabilities
3. **Community Forums**: Moderated discussion spaces with category-based organization
4. **Data Visualization**: Charts and insights showing symptom trends and correlations
5. **Provider Reports**: HIPAA-compliant report generation for healthcare providers
6. **Research Participation**: Optional anonymized data contribution for research

### UI Component System
- Uses shadcn/ui components for consistent design
- Responsive design with mobile-first approach
- Dark/light mode support via CSS variables
- Accessible components with proper ARIA labels
- Toast notifications for user feedback

## Data Flow

### Authentication Flow
1. User authenticates via Firebase (email/password or Google)
2. Firebase user token validated on backend
3. User record created/updated in PostgreSQL
4. Express session established for subsequent requests

### Data Persistence Flow
1. Frontend forms validate data using Zod schemas
2. React Query manages API calls and caching
3. Backend APIs validate and process requests
4. Drizzle ORM handles database operations
5. Structured data stored in PostgreSQL with proper relationships

### File Upload Flow
1. User selects files in frontend components
2. Files uploaded directly to Firebase Storage
3. Storage URLs saved in PostgreSQL for reference
4. Media displayed via Firebase Storage URLs

## External Dependencies

### Core Services
- **Firebase**: Authentication, file storage, and user management
- **PostgreSQL**: Primary database (Neon serverless)
- **Recharts**: Data visualization and charting

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **ESLint/Prettier**: Code quality and formatting
- **Drizzle Kit**: Database migrations and schema management

### UI Libraries
- **Radix UI**: Headless component primitives
- **Lucide React**: Icon library
- **date-fns**: Date manipulation utilities

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with hot module replacement
- **Database**: PostgreSQL 16 via Replit modules
- **Build Process**: Vite dev server for frontend, tsx for backend
- **Port Configuration**: Backend on 5000, frontend proxied through Vite

### Production Build
- **Frontend**: Static build via Vite to dist/public
- **Backend**: Bundled via esbuild to dist/index.js
- **Deployment**: Replit autoscale with build/start scripts
- **Static Assets**: Served from dist/public directory

### Environment Configuration
- Firebase configuration via environment variables
- Database URL via DATABASE_URL environment variable
- Production/development mode switching via NODE_ENV

## Changelog
- June 23, 2025. Initial setup and Firebase integration complete
- June 23, 2025. Completed comprehensive tour system with full navigation and element highlighting
- June 23, 2025. Fixed Digital Matchbox submit functionality and community platform real data integration

## Recent Changes
- ✓ Created comprehensive patient demo video script showcasing all features
- ✓ Fixed doctor portal logout functionality with proper session management
- ✓ Resolved patient login redirect issues - patients now properly access patient dashboard
- ✓ Enhanced Ask a Doctor forum with complete patient-doctor interaction workflow
- ✓ Implemented Firebase Authentication with Google OAuth
- ✓ Created Firestore data models for users, symptoms, journal entries, and forum posts
- ✓ Added Firebase Storage integration for secure media uploads
- ✓ Built comprehensive symptom tracking with real-time data analysis
- ✓ Implemented Digital Matchbox with encrypted file storage
- ✓ Created patient-centric UI with extensive preset options for easy data entry
- ✓ Added data visualization with real symptom correlation analysis
- ✓ Integrated React Query for efficient data management and caching
- ✓ Added Calendar Integration with monthly view and yearly heatmap
- ✓ Visual calendar showing symptom entries and journal entries by date
- ✓ Symptom intensity heatmap for yearly overview
- ✓ Quick date navigation and entry creation from calendar
- ✓ Implemented Firebase AI Logic with Google Genkit integration
- ✓ AI-powered symptom pattern analysis and correlation detection
- ✓ Intelligent health insights generation based on user data
- ✓ Symptom trend prediction using machine learning
- ✓ Natural language processing for journal entry analysis
- ✓ Created Research Dashboard for doctors and researchers
- ✓ Aggregated analytics from opted-in patient data
- ✓ Statistical correlations between symptoms and environmental factors
- ✓ Treatment effectiveness analysis and demographic insights
- ✓ Geographic distribution mapping and data export capabilities
- ✓ Comprehensive User Onboarding Experience
- ✓ Multi-step onboarding with medical profile completion
- ✓ Interactive feature tour and privacy education
- ✓ Welcome tour integrated into dashboard for returning users
- ✓ Progress tracking and completion states
- ✓ Telemedicine Appointment Scheduling System
- ✓ Provider search with specialty and Morgellons experience filters
- ✓ Comprehensive provider profiles with ratings and credentials
- ✓ Calendar-based appointment booking with time slot selection
- ✓ Support for both telehealth and in-person appointments
- ✓ Enhanced Interactive Tour System
- ✓ Contextual tour that navigates to actual pages during explanation
- ✓ Visual highlighting of specific features and interface elements
- ✓ Live demonstration of each feature as it's being explained
- ✓ Pro tips specific to each page's functionality
- ✓ Fixed Tour Navigation and Persistence Issues
- ✓ Resolved React hooks order problems and DOM nesting warnings
- ✓ Implemented proper element highlighting with data-tour attributes
- ✓ Tour advances through all 8 steps across different app pages
- ✓ Clean Next/Previous button functionality with step progression
- ✓ Complete Digital Matchbox Journal System
- ✓ Fixed submit button visibility and form submission workflow
- ✓ Real Firebase data integration without fallback data
- ✓ Full entry viewing system with modal dialogs
- ✓ Photo upload capabilities and media management
- ✓ Community Platform with Real Data Integration
- ✓ Removed all mock data and implemented Firebase backend
- ✓ Post creation, categorization, and viewing functionality
- ✓ Authentication-gated access with proper error handling
- ✓ Patient-Led Research Data Aggregation System
- ✓ Comprehensive consent preference management interface
- ✓ Granular data sharing controls by category
- ✓ Enhanced research dashboard with analytics
- ✓ IRB compliance and ethics tracking
- ✓ Robust Medical Onboarding for Research Data Pooling
- ✓ Multi-step medical profile collection during registration
- ✓ Comprehensive demographic, medical, and lifestyle data capture
- ✓ Integrated research consent flow with medical profile setup
- ✓ Enhanced onboarding flow with research participation emphasis
- ✓ Integrated Medical Onboarding into Registration Flow
- ✓ New users now required to complete comprehensive medical profile
- ✓ 50+ data points collected including demographics, symptoms, lifestyle
- ✓ Registration flows directly from signup into medical profile setup
- ✓ Onboarding completion tracked to prevent dashboard access without profile
- ✓ Fixed Research Opt-in Checkbox Display Issues
- ✓ Research consent checkboxes now properly visible and functional in step 5
- ✓ Enhanced Tour Navigation with Page Loading Delays
- ✓ Tour pages now load properly with content before highlighting elements
- ✓ Comprehensive Research Consent Validation
- ✓ Medical profile submission now requires research consent completion
- ✓ Toast notifications confirm research participation enrollment
- ✓ Enhanced tour highlighting with CSS animations and longer load delays
- ✓ Fixed Medical Profile to Tour Transition
- ✓ Medical profile completion now properly transitions to interactive tour
- ✓ Added completion message with automatic tour start after delay
- ✓ Enhanced completion flow with proper navigation to dashboard
- ✓ Fixed Duplicate Completion Triggers
- ✓ Resolved medical profile calling completion handler multiple times
- ✓ Fixed step navigation to prevent premature completion messages
- ✓ Ensured proper phase transitions from medical profile to tour
- ✓ Fixed Tour Content Loading with Page Navigation
- ✓ Tour now shows actual page content with overlay instead of blank screens
- ✓ Enhanced highlighting system with multiple retry attempts
- ✓ Tour activates on dashboard after onboarding completion
- ✓ Enhanced Tour Button Visibility and Form Dropdowns
- ✓ Fixed tour Next button visibility with enhanced styling and z-index
- ✓ Added comprehensive pre-populated dropdown options for symptoms
- ✓ Converted triggers, locations, and treatments to dropdown selections
- ✓ Improved user experience with clickable options instead of text input
- ✓ Fixed Medical Profile Form Navigation Buttons
- ✓ Enhanced Next/Previous button visibility with proper styling and borders
- ✓ Added background color and shadow to buttons for better contrast
- ✓ Fixed CardFooter styling with proper background and spacing
- ✓ Implemented AI Health Coach and Smart Daily Check-ins
- ✓ Added personalized daily insights with weather correlation detection
- ✓ Created symptom prediction system with confidence levels
- ✓ Built gamified streak tracking with achievement system
- ✓ Integrated adaptive questionnaires that learn from user patterns
- ✓ Comprehensive Gamification System with Multi-tier Achievements
- ✓ Health tracking streaks with AI-generated encouragement and milestone rewards
- ✓ Pattern discovery achievements that unlock when AI identifies correlations
- ✓ Community challenges with group goals and leaderboards
- ✓ Level progression system with XP points and rarity-based rewards
- ✓ Community Engagement Reward System
- ✓ Community badges for helpful posts, support, and participation
- ✓ Weekly missions and quick actions to encourage forum engagement
- ✓ Leaderboard showcasing most helpful community members
- ✓ Points system for posts, replies, helpful votes, and topic creation
- ✓ Peer Matching System with Detailed Preference Selections
- ✓ Comprehensive preference system for symptoms, age, location, experience level
- ✓ Support type preferences (emotional, practical, crisis support, etc.)
- ✓ Interest-based matching with hobbies and coping strategies
- ✓ Privacy controls and communication style preferences
- ✓ Match percentage calculation with common symptoms and interests
- ✓ Connection request system with mutual friend tracking
- ✓ Streamlined Dashboard with Daily Task List
- ✓ Comprehensive daily task system incorporating all features
- ✓ Task categorization (health, community, data, wellness)
- ✓ Point-based rewards and streak tracking for task completion
- ✓ Simplified navigation menu focused on core functionality
- ✓ Progress visualization and completion celebrations
- ✓ Separate Doctor Login/Registration System
- ✓ Medical license verification and credential validation
- ✓ State-based user statistics dashboard for doctors
- ✓ Research insights with geographic patient distribution
- ✓ Ask a Doctor forum for patient consultations
- ✓ Doctor verification badges and consultation scheduling

## User Preferences

Preferred communication style: Simple, everyday language.
Form requirements: All data entry forms need Submit buttons, not just Save buttons.
Draft functionality: Users should be able to save entries as drafts before final submission.
Research focus: Registration should collect comprehensive medical/demographic data for research analysis.
Medical profile: New users need robust registration with all health factors for pattern analysis.
Onboarding requirement: New users must complete comprehensive medical profile before accessing main application.
Dropdown preferences: All questions should have dropdown or checkmark boxes with pre-populated selections for frequently used answers instead of text input.
AI engagement focus: Implement AI features that encourage daily login and symptom tracking through personalized insights, predictions, and gamification.