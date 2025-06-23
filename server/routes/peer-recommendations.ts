import { Router } from 'express';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db, adminDb } from '../firebase-admin';
import { PeerRecommendationEngine, type UserProfile, type RecommendationContext } from '../ai/peer-recommendation-engine';

export const peerRecommendationsRoutes = Router();

peerRecommendationsRoutes.post('/peer-recommendations', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get user profile data
    const userProfile = await buildUserProfile(userId);
    
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Get potential matches (other users)
    const potentialMatches = await getPotentialMatches(userId);
    
    // Build recommendation context
    const context = await buildRecommendationContext(userId);
    
    // Generate AI-powered recommendations
    const recommendations = await PeerRecommendationEngine.generateRecommendations(
      userProfile,
      potentialMatches,
      context
    );

    res.json({
      success: true,
      recommendations,
      totalEvaluated: potentialMatches.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating peer recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to generate recommendations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

peerRecommendationsRoutes.get('/connection-analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's connection history
    const connectionsSnapshot = await getDocs(
      query(
        collection(db, 'peerConnections'),
        where('fromUserId', '==', userId)
      )
    );
    
    const connections = connectionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Analyze connection success patterns
    const analytics = await PeerRecommendationEngine.analyzeConnectionSuccess(userId, connections);
    
    res.json({
      success: true,
      analytics,
      connectionCount: connections.length
    });

  } catch (error) {
    console.error('Error analyzing connections:', error);
    res.status(500).json({ error: 'Failed to analyze connections' });
  }
});

async function buildUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    // Get user basic info from Firebase Admin SDK
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData) return null;

    // Get symptom entries using Firebase Admin SDK
    const symptomSnapshot = await adminDb.collection('symptomEntries')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    
    const symptomEntries = symptomSnapshot.docs.map(doc => doc.data());
    
    // Get journal entries using Firebase Admin SDK
    const journalSnapshot = await adminDb.collection('journalEntries')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(30)
      .get();
    
    const journalEntries = journalSnapshot.docs.map(doc => doc.data());
    
    // Get matching preferences using Firebase Admin SDK
    const preferencesSnapshot = await adminDb.collection('matchingPreferences')
      .where('userId', '==', userId)
      .limit(1)
      .get();
    
    const preferences = preferencesSnapshot.docs[0]?.data() || {
      supportType: [],
      interests: [],
      communicationStyle: 'occasional',
      privacyLevel: 'selective'
    };

    // Extract symptoms from entries
    const symptoms = [...new Set(
      symptomEntries.flatMap(entry => entry.symptoms || [])
    )];

    // Calculate activity level
    const activityLevel = calculateActivityLevel(userData, symptomEntries, journalEntries);

    return {
      userId,
      symptoms,
      journalEntries,
      symptomEntries,
      demographics: {
        age: userData.age,
        location: userData.location,
        experienceLevel: userData.experienceLevel
      },
      preferences,
      activityLevel
    };

  } catch (error) {
    console.error('Error building user profile:', error);
    return null;
  }
}

async function getPotentialMatches(currentUserId: string): Promise<UserProfile[]> {
  try {
    // Get all users except current user using Firebase Admin SDK
    const usersSnapshot = await adminDb.collection('users').get();
    const users = usersSnapshot.docs
      .filter(doc => doc.id !== currentUserId)
      .map(doc => ({ id: doc.id, ...doc.data() }));

    // Build profiles for potential matches (limit to 20 for performance)
    const profiles: UserProfile[] = [];
    
    for (const user of users.slice(0, 20)) {
      const profile = await buildUserProfile(user.id);
      if (profile) {
        profiles.push(profile);
      }
    }

    return profiles;

  } catch (error) {
    console.error('Error getting potential matches:', error);
    return [];
  }
}

async function buildRecommendationContext(userId: string): Promise<RecommendationContext> {
  try {
    // Get recent symptom entries to detect changes using Firebase Admin SDK
    const recentSymptomsSnapshot = await adminDb.collection('symptomEntries')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    const recentSymptoms = recentSymptomsSnapshot.docs.map(doc => doc.data());
    
    // Analyze for recent changes
    const recentSymptomChanges = detectSymptomChanges(recentSymptoms);
    
    // Get recent journal entries to assess emotional state using Firebase Admin SDK
    const recentJournalSnapshot = await adminDb.collection('journalEntries')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
    
    const recentJournals = recentJournalSnapshot.docs.map(doc => doc.data());
    const emotionalState = assessEmotionalState(recentJournals);
    
    // Get previous connections using Firebase Admin SDK
    const connectionsSnapshot = await adminDb.collection('peerConnections')
      .where('fromUserId', '==', userId)
      .get();
    
    const previousConnections = connectionsSnapshot.docs.map(doc => doc.data().toUserId || '');

    return {
      recentSymptomChanges,
      emotionalState,
      supportNeeds: deriveSupportNeeds(recentSymptoms, recentJournals),
      timeOfRequest: new Date(),
      previousConnections
    };

  } catch (error) {
    console.error('Error building recommendation context:', error);
    return {
      recentSymptomChanges: false,
      emotionalState: 'stable',
      supportNeeds: [],
      timeOfRequest: new Date(),
      previousConnections: []
    };
  }
}

function calculateActivityLevel(userData: any, symptomEntries: any[], journalEntries: any[]) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Count recent activities
  const recentSymptoms = symptomEntries.filter(entry => 
    entry.createdAt?.toDate() > weekAgo
  ).length;
  
  const recentJournals = journalEntries.filter(entry =>
    entry.createdAt?.toDate() > weekAgo
  ).length;
  
  // Calculate engagement score (0-100)
  const engagementScore = Math.min(100, (recentSymptoms * 10) + (recentJournals * 15));
  
  return {
    lastActive: userData.lastLogin?.toDate() || new Date(),
    engagementScore,
    responseRate: 0.8 // Default - would be calculated from actual interaction data
  };
}

function detectSymptomChanges(recentSymptoms: any[]): boolean {
  if (recentSymptoms.length < 3) return false;
  
  // Simple heuristic: check if intensity has increased significantly
  const intensities = recentSymptoms.map(s => s.intensity || 0);
  const recent = intensities.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
  const baseline = intensities.slice(2).reduce((a, b) => a + b, 0) / Math.max(1, intensities.length - 2);
  
  return recent > baseline + 1; // Threshold for "significant" change
}

function assessEmotionalState(recentJournals: any[]): 'struggling' | 'stable' | 'improving' {
  if (recentJournals.length === 0) return 'stable';
  
  // Simple sentiment analysis based on keywords
  const content = recentJournals.map(j => (j.content || '').toLowerCase()).join(' ');
  
  const strugglingWords = ['painful', 'difficult', 'worse', 'struggling', 'hard', 'frustrated'];
  const improvingWords = ['better', 'improving', 'good', 'positive', 'hopeful', 'progress'];
  
  const strugglingCount = strugglingWords.filter(word => content.includes(word)).length;
  const improvingCount = improvingWords.filter(word => content.includes(word)).length;
  
  if (strugglingCount > improvingCount + 1) return 'struggling';
  if (improvingCount > strugglingCount + 1) return 'improving';
  return 'stable';
}

function deriveSupportNeeds(recentSymptoms: any[], recentJournals: any[]): string[] {
  const needs: string[] = [];
  
  // Analyze symptoms for support needs
  const highIntensitySymptoms = recentSymptoms.filter(s => (s.intensity || 0) > 7);
  if (highIntensitySymptoms.length > 0) {
    needs.push('Symptom management support');
  }
  
  // Analyze journal content for emotional needs
  const journalContent = recentJournals.map(j => (j.content || '').toLowerCase()).join(' ');
  
  if (journalContent.includes('sleep') || journalContent.includes('tired')) {
    needs.push('Sleep improvement strategies');
  }
  
  if (journalContent.includes('stress') || journalContent.includes('anxiety')) {
    needs.push('Stress management techniques');
  }
  
  if (journalContent.includes('medication') || journalContent.includes('treatment')) {
    needs.push('Treatment experience sharing');
  }
  
  return needs.slice(0, 3); // Limit to top 3 needs
}