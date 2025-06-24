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
- ✓ Daily Check-in button now fully functional and clickable in dashboard header
- ✓ 4-step health assessment workflow: wellbeing scales, sleep/mood, symptoms/activities, notes
- ✓ Real Firebase integration with duplicate prevention and symptom tracking
- ✓ AI Health Coach fully integrated with Firebase data and Google AI API
- ✓ Real-time health pattern analysis using Google Genkit AI flows
- ✓ Personalized insights from symptom entries, journals, and daily check-ins
- ✓ AI Insights component completely rebuilt to use only Firebase/Firestore and Google AI
- ✓ Removed all mock and fallback data - now uses exclusively real user data
- ✓ Enhanced AI prompts with actual data for comprehensive pattern analysis
- ✓ Made Community Forum completely functional with real Firebase integration
- ✓ Added post creation, reply system, like functionality, and real-time updates
- ✓ Implemented category filtering, tag support, and anonymous posting options
- ✓ Created interactive landing page with live feature demos and user testimonials
- ✓ Added comprehensive demo modals for symptom tracking, journaling, AI insights, and data visualization
- ✓ Integrated landing page into app routing with demo access from login page
- ✓ Fixed tour navigation issues - tour now progresses through all steps without disappearing
- ✓ Removed tour persistence mechanism per user request - keeping tour simple and functional
- ✓ Updated application tour to include all new features: Daily Tasks, AI Health Coach, Peer Matching, Ask a Doctor Forum, and Gamified Progress
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
- ✓ Complete Firebase/Firestore Peer Matching Integration
- ✓ Real user data matching based on symptom overlap and preferences
- ✓ AI-powered compatibility calculation using actual health tracking data
- ✓ Comprehensive preference system with age, support type, and interest filtering
- ✓ Connection request system with Firebase persistence
- ✓ Dashboard integration with live peer matching widget
- ✓ No mock data - exclusively Firebase/Firestore integration
- ✓ AI-Powered Peer Connection Recommendation Engine
- ✓ Advanced machine learning compatibility analysis using Google AI
- ✓ Multi-factor recommendation scoring: symptoms, interests, communication, experience, activity
- ✓ Intelligent recommendation types: urgent support, peer buddy, mentor, research partner
- ✓ Real-time emotional state analysis from journal entries and symptom patterns
- ✓ Connection success analytics with personalized improvement recommendations
- ✓ Dynamic preference learning and adaptation based on user behavior
- ✓ Advanced compatibility insights with confidence scoring and detailed reasoning
- ✓ Eliminated All Fallback and Mock Data
- ✓ Pure Firebase/Firestore and Google AI integration with no synthetic data
- ✓ Real-time data calculations from actual user entries and AI analysis
- ✓ Enhanced error handling to show empty states when AI is unavailable
- ✓ Authentic peer matching based on real user preferences and compatibility
- ✓ Fixed icon imports and server-side Firebase integration errors
- ✓ Robust error handling for AI analysis with proper data validation
- ✓ All components now handle empty data states gracefully without fallbacks
- ✓ Converted gamification system to pure Firebase/Firestore integration
- ✓ Eliminated localStorage fallbacks from points, achievements, and streaks
- ✓ Real-time sync of user progress, tasks, and rewards with Firebase
- ✓ Fixed AI health analysis data validation errors
- ✓ Created doctors table in database schema with verification system
- ✓ Updated Find Support navigation to show only registered application doctors
- ✓ Fixed routing from peer-matching to telemedicine scheduling page
- ✓ Enhanced doctor verification workflow with proper database integration
- ✓ Completed interactive Take Tour function with step-by-step walkthroughs
- ✓ Added visual element highlighting and step navigation
- ✓ Enhanced tour with detailed feature explanations and pro tips
- ✓ Implemented tour progress tracking and completion states
- ✓ Created comprehensive Firebase migration guide for deployment transition
- ✓ Documented complete process for moving from Replit to Firebase hosting
- ✓ Provided step-by-step instructions for Cloud Functions, Hosting, and database migration
- ✓ Included security configurations, testing procedures, and troubleshooting guide
- ✓ Updated migration guide with detailed PostgreSQL removal process
- ✓ Created complete data migration script for all PostgreSQL tables to Firestore
- ✓ Documented comprehensive code changes for pure Firestore implementation
- ✓ Added testing procedures and verification scripts for successful migration
- ✓ Created AI Health Companion Creator with Google AI image generation
- ✓ 5-step personality builder with creative questions about companion traits
- ✓ Integrated companion creation into user registration onboarding flow
- ✓ Uses Google Gemini for personalized AI character generation based on user preferences
- ✓ Implemented Companion Knowledge Base and Learning Mechanics
- ✓ AI companion learns from user interactions and builds personalized health patterns
- ✓ Real-time chat interface with intelligent response generation
- ✓ Pattern recognition system identifies symptoms, triggers, and lifestyle factors
- ✓ Adaptive learning adjusts companion personality and responses over time
- ✓ Comprehensive insights dashboard showing learning progress and discoveries
- ✓ Updated Firebase migration guide with AI Companion system migration instructions
- ✓ Created Cloud Functions for companion chat, memory management, and pattern analysis
- ✓ Documented Firestore security rules and performance optimization strategies
- ✓ Provided complete client-side migration from Express API to Firebase Functions
- ✓ Fixed "Complete Profile & Create Companion" button functionality
- ✓ Added dropdown selectable options for State and Ethnicity fields in medical profile form
- ✓ Extended State/Province dropdown to include Canada and Mexico (13 provinces, 32 states)
- ✓ Fixed companion creation error and form submission issues
- ✓ Changed symptom onset to year-only input for better user experience
- ✓ Implemented AI companion image display throughout application
- ✓ Companion images now appear as profile pictures in layout header and community forum
- ✓ Added companion status indicators with heart icons and "AI Companion Active" text
- ✓ Created comprehensive tiered AI companion progression system with 10 levels
- ✓ Designed companion functions that unlock per tier: meal suggestions, supplements, predictions, scheduling, research matching
- ✓ Built companion tier system UI with progress tracking and feature previews
- ✓ Implemented companion functionality system with AI-powered features for each tier
- ✓ Built comprehensive tier progression tracking mechanism with Firebase integration
- ✓ Created point system with 15+ action types earning different point values
- ✓ Added real-time progress tracking, tier unlock celebrations, and point history
- ✓ Implemented CompanionProgressContext for global state management across app
- ✓ Removed demo system components as requested - production-ready companion tier system maintained
- ✓ Cleaned up manual point addition functions and demo-specific code
- ✓ Streamlined companion dashboard with 7 core tabs: Progress, Access, Chat, Functions, Evolution, Insights, Settings
- ✓ Enhanced doctor profile system with comprehensive professional information capture
- ✓ Added profile image upload, contact details, office location, bio, and credentials management
- ✓ Implemented detailed medical background fields: medical school, residency, board certifications
- ✓ Added practice information: hospital affiliations, insurance accepted, telehealth availability
- ✓ Created comprehensive doctor profile form with array field management for certifications and affiliations
- ✓ Completely rebuilt doctor registration with multi-step form including profile picture upload
- ✓ Added 50+ comprehensive professional fields: NPI number, DEA number, license state, graduation year
- ✓ Implemented board certifications, languages, specialties, practice information with dropdown selections
- ✓ Created 5-step registration process with validation and progress tracking
- ✓ Enhanced with Morgellons-specific training options and experience fields
- ✓ Completely redesigned Dashboard with clean sidebar navigation and organized sections
- ✓ Implemented collapsible sidebar with mobile responsiveness
- ✓ Organized features into logical sections: Overview, Health Tracking, AI & Support, Community, Professional Care, Research
- ✓ Added quick stats cards, daily tasks overview, and streamlined quick actions
- ✓ Fixed database errors in companion routes with proper error handling
- ✓ Implemented live weather data integration with OpenWeatherMap API
- ✓ Added comprehensive weather tracking: current conditions, forecasts, air quality, pollutants
- ✓ Created symptom-relevant weather factor analysis (barometric pressure, humidity, allergens, mold risk)
- ✓ Integrated live weather widget into Dashboard and Symptom Tracker
- ✓ Added geolocation support for automatic local weather detection
- ✓ Enhanced user profile system with comprehensive personal information management
- ✓ Added user profile editing with personal info, contact details, location, emergency contacts
- ✓ Implemented secure password change functionality with Firebase Authentication
- ✓ Created notification preferences, privacy settings, and data sharing controls
- ✓ Added user settings page with profile, security, privacy, and data management tabs
- ✓ Integrated settings page into navigation with proper routing and authentication
- ✓ Enhanced existing doctor schema with comprehensive profile fields including contact info, credentials, affiliations
- ✓ Updated doctor registration system to capture enhanced profile information during signup
- ✓ Integrated DoctorProfileForm into doctor dashboard with dedicated Profile tab
- ✓ Added comprehensive API endpoints for doctor profile management with mock data
- ✓ Updated doctor registration validation schema to include all new profile fields
- ✓ Enhanced users table schema with comprehensive personal information fields
- ✓ Created comprehensive DoctorProfileForm with education, credentials, office info, and services management
- ✓ Integrated tabbed doctor dashboard with dedicated Profile management section
- ✓ Added array field management for certifications, languages, affiliations, and insurance
- ✓ Enhanced Layout component with dropdown menu for user profile and settings access
- ✓ Fixed daily task list to always show 7 default activities for new users
- ✓ Reorganized tasks into focused categories: Health Tracking (2), Community (2), Data & Research (2), Wellness (3)
- ✓ Enhanced task descriptions and point values for better user engagement
- ✓ Removed fallback empty states - tasks now always populate with meaningful activities
- ✓ Eliminated all demo and fallback data from companion system and points tracking
- ✓ Fixed AI Companion detection and data persistence issues with proper Firebase integration
- ✓ Removed manual point addition buttons - points now only earned through real user actions
- ✓ Enhanced companion widget to show only authentic user-created companion data
- ✓ Implemented Gamified Point Earning Challenge System
- ✓ Created daily, weekly, and special challenges with varying difficulty levels
- ✓ Added challenge progress tracking with Firebase integration
- ✓ Built reward system with badges and bonus points for challenge completion
- ✓ Integrated challenge progress updates into existing user actions (symptom tracking, journaling, forum participation)
- ✓ Fixed challenge system to track real user actions instead of button clicks
- ✓ Added navigation from challenges to relevant app pages (tracker, journal, community, etc.)
- ✓ Implemented AI Companion tier gating system for premium features
- ✓ Created TierGate components to restrict access based on companion tier level
- ✓ Enhanced AI Insights with tiered access (basic, advanced, predictive analytics)
- ✓ Implemented Therapeutic AI Companion with Google Cloud Text-to-Speech integration
- ✓ Created comprehensive Morgellons expertise knowledge base with master's level understanding
- ✓ Built therapeutic AI system with psychotherapy training and crisis support capabilities
- ✓ Added voice synthesis with therapeutic voice styles (calming, encouraging, validating)
- ✓ Developed therapeutic mode selector with guided sessions for different support needs
- ✓ Integrated specialized knowledge of mold, fungal infections, biotoxins, and environmental factors
- ✓ Enhanced Doctor Dashboard with Patient Communication Hub
- ✓ Secure messaging system between doctors and patients
- ✓ Real-time symptom report review with AI companion insights
- ✓ Telehealth integration for appointment scheduling and video calls
- ✓ Comprehensive patient analytics dashboard with communication metrics
- ✓ Created comprehensive demo doctor account with realistic patient scenarios
- ✓ Demo includes 4 patients with varying severity levels and detailed medical histories
- ✓ Real-world clinical scenarios: crisis patient, environmental triggers, workplace exposure, treatment success
- ✓ Complete AI companion insights with pattern detection, symptom prediction, and treatment suggestions
- ✓ Demo dashboard with authentic statistics and patient communication examples
- ✓ Created complete Firebase/Firestore migration guide for production deployment
- ✓ Comprehensive migration from PostgreSQL to Firestore with Cloud Functions
- ✓ Full Firebase App Hosting deployment configuration
- ✓ Data migration scripts for all tables to Firestore collections
- ✓ Security rules, performance optimization, and rollback procedures included
- ✓ Implemented Patient Community Network Integration with advanced peer matching
- ✓ Built comprehensive peer connection system with AI-powered recommendations
- ✓ Created community event management with registration, waitlists, and resources
- ✓ Added support group functionality with scheduled meetings and moderation
- ✓ Integrated challenge progress tracking for community engagement activities

## User Preferences

Preferred communication style: Simple, everyday language.
Form requirements: All data entry forms need Submit buttons, not just Save buttons.
Draft functionality: Users should be able to save entries as drafts before final submission.
Research focus: Registration should collect comprehensive medical/demographic data for research analysis.
Medical profile: New users need robust registration with all health factors for pattern analysis.
Onboarding requirement: New users must complete comprehensive medical profile before accessing main application.
Dropdown preferences: All questions should have dropdown or checkmark boxes with pre-populated selections for frequently used answers instead of text input.
State and Ethnicity fields: User requested dropdown selectable options for State and Ethnicity fields in medical profile form.
AI engagement focus: Implement AI features that encourage daily login and symptom tracking through personalized insights, predictions, and gamification.