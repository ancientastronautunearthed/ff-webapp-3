import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { db } from '../firebase-admin';

export const companionRoutes = Router();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY || '' });

interface CompanionMemory {
  userId: string;
  patterns: HealthPattern[];
  preferences: UserPreference[];
  insights: string[];
  learningProgress: number;
  lastInteraction: Date;
  personalityAdaptations: Record<string, any>;
  conversationHistory: ConversationSummary[];
}

interface HealthPattern {
  id: string;
  type: 'symptom' | 'trigger' | 'treatment' | 'lifestyle';
  pattern: string;
  confidence: number;
  frequency: number;
  lastObserved: Date;
  relatedFactors: string[];
}

interface UserPreference {
  category: string;
  preference: string;
  strength: number;
  learnedFrom: string[];
}

interface ConversationSummary {
  date: Date;
  topics: string[];
  insights: string[];
  userMood: string;
  keyPoints: string[];
}

// Initialize companion memory for a user
companionRoutes.post('/initialize', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Check if companion memory already exists
    const memoryDoc = await db.collection('companionMemory').doc(userId).get();
    
    if (memoryDoc.exists) {
      return res.json(memoryDoc.data());
    }

    // Create new companion memory by analyzing user's existing data
    const memory = await initializeCompanionMemory(userId);
    
    // Save to Firestore
    await db.collection('companionMemory').doc(userId).set(memory);
    
    res.json(memory);
  } catch (error) {
    console.error('Error initializing companion:', error);
    res.status(500).json({ error: 'Failed to initialize companion' });
  }
});

// Handle chat messages and learning
companionRoutes.post('/chat', async (req, res) => {
  try {
    const { userId, message, context } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'User ID and message required' });
    }

    // Get current companion memory
    const memoryDoc = await db.collection('companionMemory').doc(userId).get();
    let memory: CompanionMemory = memoryDoc.exists ? memoryDoc.data() as CompanionMemory : await initializeCompanionMemory(userId);

    // Analyze the message and generate response
    const response = await generateCompanionResponse(userId, message, memory);

    // Update memory with new learning
    const updatedMemory = await updateCompanionLearning(userId, message, response, memory);

    // Save updated memory
    await db.collection('companionMemory').doc(userId).set(updatedMemory);

    // Save chat message
    await saveChatMessage(userId, message, response);

    res.json({
      reply: response,
      updatedMemory,
      insights: response.newInsights || []
    });

  } catch (error) {
    console.error('Error in companion chat:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Get chat history
companionRoutes.get('/chat-history', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const chatSnapshot = await db.collection('companionChats')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const messages = chatSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(messages.reverse()); // Return in chronological order
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Get companion learning insights
companionRoutes.get('/insights', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const memoryDoc = await db.collection('companionMemory').doc(userId).get();
    if (!memoryDoc.exists) {
      return res.json({ patterns: [], insights: [], learningProgress: 0 });
    }

    const memory = memoryDoc.data() as CompanionMemory;
    
    res.json({
      patterns: memory.patterns,
      insights: memory.insights,
      learningProgress: memory.learningProgress,
      preferences: memory.preferences
    });

  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

// Helper Functions

async function initializeCompanionMemory(userId: string): Promise<CompanionMemory> {
  // Fetch user's existing data to bootstrap learning
  const [symptomsSnapshot, journalsSnapshot, userDoc] = await Promise.all([
    db.collection('symptomEntries').where('userId', '==', userId).orderBy('timestamp', 'desc').limit(50).get(),
    db.collection('journalEntries').where('userId', '==', userId).orderBy('timestamp', 'desc').limit(20).get(),
    db.collection('users').doc(userId).get()
  ]);

  const symptoms = symptomsSnapshot.docs.map(doc => doc.data());
  const journals = journalsSnapshot.docs.map(doc => doc.data());
  const userData = userDoc.exists ? userDoc.data() : {};

  // Analyze existing data to identify initial patterns
  const initialPatterns = await analyzeInitialPatterns(symptoms, journals);
  const initialPreferences = await identifyInitialPreferences(userData, journals);

  return {
    userId,
    patterns: initialPatterns,
    preferences: initialPreferences,
    insights: [],
    learningProgress: initialPatterns.length > 0 ? 0.1 : 0,
    lastInteraction: new Date(),
    personalityAdaptations: {},
    conversationHistory: []
  };
}

export async function generateCompanionResponse(userId: string, message: string) {
  try {
    // Get user's recent health data for context
    const userHealthContext = await getUserHealthContext(userId);
    
    // Generate empathetic AI response using Google AI
    const { analyzeSymptomText } = await import('../ai/simple-ai');
    
    const compassionatePrompt = `You are a compassionate AI health companion for someone with Morgellons disease. 
    
User's message: "${message}"
Recent health context: ${JSON.stringify(userHealthContext)}

Respond with empathy, understanding, and gentle support. Acknowledge their feelings, validate their experience, and offer practical comfort or insights. Keep responses warm, personal, and under 150 words.

If they mention symptoms or health concerns, provide supportive guidance while encouraging professional medical consultation when appropriate.

Respond in a conversational, caring tone as if you're a trusted friend who understands their health journey.`;

    const aiAnalysis = await analyzeSymptomText(compassionatePrompt);
    
    // Extract response and determine sentiment
    const responseText = aiAnalysis.summary || generateFallbackCompassionateResponse(message);
    const sentiment = determineSentiment(message, responseText);
    const suggestions = generateSuggestions(message, userHealthContext);

    return {
      message: responseText,
      sentiment,
      suggestions,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating companion response:', error);
    return generateFallbackCompassionateResponse(message);
  }
}

export async function generateCompanionInsights(userId: string) {
  try {
    const userHealthContext = await getUserHealthContext(userId);
    
    const insights = [];
    
    // Pattern insights
    if (userHealthContext.recentSymptoms?.length > 0) {
      insights.push({
        type: 'pattern',
        message: `I've noticed patterns in your recent entries that might be worth discussing with your healthcare provider.`,
        priority: 'medium'
      });
    }
    
    // Encouragement insights
    if (userHealthContext.journalEntries?.length > 0) {
      insights.push({
        type: 'encouragement',
        message: `Your consistent tracking shows real dedication to understanding your health. That's something to be proud of.`,
        priority: 'low'
      });
    }
    
    // Self-care reminders
    insights.push({
      type: 'reminder',
      message: `Remember to take breaks and practice gentle self-care. Your wellbeing matters beyond just tracking symptoms.`,
      priority: 'low'
    });
    
    return insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    return [
      {
        type: 'encouragement',
        message: 'Remember that you\'re not alone in this journey. Each day you\'re taking steps to better understand your health.',
        priority: 'medium'
      }
    ];
  }
}

async function getUserHealthContext(userId: string) {
  try {
    // Get recent symptom entries and journal entries from Firebase
    const { getDocs, collection, query, where, orderBy, limit } = await import('firebase/firestore');
    const { adminDb } = await import('../firebase-admin');
    
    const recentSymptoms = [];
    const recentJournals = [];
    
    // Get last 5 symptom entries
    const symptomsRef = collection(adminDb, 'symptomEntries');
    const symptomsQuery = query(
      symptomsRef, 
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(5)
    );
    const symptomsSnapshot = await getDocs(symptomsQuery);
    symptomsSnapshot.forEach(doc => recentSymptoms.push(doc.data()));
    
    // Get last 3 journal entries
    const journalsRef = collection(adminDb, 'journalEntries');
    const journalsQuery = query(
      journalsRef,
      where('userId', '==', userId), 
      orderBy('date', 'desc'),
      limit(3)
    );
    const journalsSnapshot = await getDocs(journalsQuery);
    journalsSnapshot.forEach(doc => recentJournals.push(doc.data()));
    
    return {
      recentSymptoms,
      journalEntries: recentJournals,
      hasRecentActivity: recentSymptoms.length > 0 || recentJournals.length > 0
    };
  } catch (error) {
    console.error('Error getting user health context:', error);
    return { recentSymptoms: [], journalEntries: [], hasRecentActivity: false };
  }
}

function generateFallbackCompassionateResponse(message: string) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
    return {
      message: "I hear that you're experiencing pain, and I want you to know that I'm here with you. Your feelings are valid, and it's okay to acknowledge when things are difficult. Have you been able to rest today?",
      sentiment: 'supportive',
      suggestions: ['Tell me more about your pain levels', 'What helps when you feel this way?']
    };
  }
  
  if (lowerMessage.includes('tired') || lowerMessage.includes('exhausted')) {
    return {
      message: "Feeling tired or exhausted can be so challenging, especially when you're managing health concerns. Your body is working hard, and it's natural to feel this way. Remember to be gentle with yourself.",
      sentiment: 'supportive',
      suggestions: ['What does rest look like for you?', 'How can I support you today?']
    };
  }
  
  if (lowerMessage.includes('frustrated') || lowerMessage.includes('angry')) {
    return {
      message: "I can understand feeling frustrated - managing health challenges can bring up so many difficult emotions. Your feelings are completely valid. It's okay to feel angry sometimes.",
      sentiment: 'supportive',
      suggestions: ['What triggered these feelings?', 'How do you usually cope with frustration?']
    };
  }
  
  return {
    message: "Thank you for sharing with me. I'm here to listen and support you through whatever you're experiencing. Your feelings and experiences matter, and I want you to know you're not alone in this journey.",
    sentiment: 'supportive',
    suggestions: ['Tell me more about how you\'re feeling', 'What would be most helpful right now?']
  };
}

function determineSentiment(userMessage: string, aiResponse: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('pain') || lowerMessage.includes('hurt') || 
      lowerMessage.includes('bad') || lowerMessage.includes('worse')) {
    return 'concerned';
  }
  
  if (lowerMessage.includes('better') || lowerMessage.includes('good') || 
      lowerMessage.includes('improved') || lowerMessage.includes('happy')) {
    return 'positive';
  }
  
  return 'supportive';
}

function generateSuggestions(userMessage: string, healthContext: any): string[] {
  const lowerMessage = userMessage.toLowerCase();
  const suggestions = [];
  
  if (lowerMessage.includes('pain')) {
    suggestions.push('What helps manage your pain?', 'Rate your pain level 1-10');
  } else if (lowerMessage.includes('sleep')) {
    suggestions.push('Tell me about your sleep routine', 'What affects your sleep quality?');
  } else if (lowerMessage.includes('mood') || lowerMessage.includes('feeling')) {
    suggestions.push('What influences your mood?', 'How can I support you today?');
  } else {
    suggestions.push('Tell me more', 'How are your energy levels?', 'What would help most right now?');
  }
  
  return suggestions.slice(0, 2); // Limit to 2 suggestions
}

async function updateCompanionLearning(userId: string, userMessage: string, response: any, memory: CompanionMemory): Promise<CompanionMemory> {
  // Extract potential new patterns from conversation
  const newPatterns = await extractPatternsFromConversation(userMessage, response.content, memory);
  
  // Update learning progress based on new interactions
  const progressIncrease = newPatterns.length > 0 ? 0.05 : 0.01;
  const newLearningProgress = Math.min(memory.learningProgress + progressIncrease, 1.0);

  // Add conversation summary
  const conversationSummary: ConversationSummary = {
    date: new Date(),
    topics: extractTopicsFromMessage(userMessage),
    insights: response.newInsights || [],
    userMood: analyzeMoodFromMessage(userMessage),
    keyPoints: [userMessage.substring(0, 100)]
  };

  return {
    ...memory,
    patterns: [...memory.patterns, ...newPatterns].slice(0, 50), // Keep most recent 50 patterns
    insights: [...memory.insights, ...(response.newInsights || [])].slice(-20), // Keep most recent 20 insights
    learningProgress: newLearningProgress,
    lastInteraction: new Date(),
    conversationHistory: [...memory.conversationHistory, conversationSummary].slice(-10)
  };
}

async function analyzeInitialPatterns(symptoms: any[], journals: any[]): Promise<HealthPattern[]> {
  const patterns: HealthPattern[] = [];

  // Analyze symptom frequency patterns
  const symptomCounts: Record<string, number> = {};
  symptoms.forEach(entry => {
    if (entry.symptoms) {
      entry.symptoms.forEach((symptom: string) => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    }
  });

  // Create patterns for frequent symptoms
  Object.entries(symptomCounts).forEach(([symptom, count]) => {
    if (count >= 3) {
      patterns.push({
        id: `symptom-${symptom.replace(/\s+/g, '-')}`,
        type: 'symptom',
        pattern: `Frequently experiences ${symptom}`,
        confidence: Math.min(count / 10, 1.0),
        frequency: count,
        lastObserved: new Date(),
        relatedFactors: []
      });
    }
  });

  // Analyze trigger patterns from journals
  const triggers: string[] = [];
  journals.forEach(entry => {
    if (entry.content) {
      // Simple keyword extraction for triggers
      const content = entry.content.toLowerCase();
      if (content.includes('stress')) triggers.push('stress');
      if (content.includes('weather')) triggers.push('weather');
      if (content.includes('food')) triggers.push('dietary');
      if (content.includes('sleep')) triggers.push('sleep');
    }
  });

  // Create trigger patterns
  const triggerCounts: Record<string, number> = {};
  triggers.forEach(trigger => {
    triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
  });

  Object.entries(triggerCounts).forEach(([trigger, count]) => {
    if (count >= 2) {
      patterns.push({
        id: `trigger-${trigger}`,
        type: 'trigger',
        pattern: `${trigger} appears to be a trigger`,
        confidence: Math.min(count / 5, 1.0),
        frequency: count,
        lastObserved: new Date(),
        relatedFactors: [trigger]
      });
    }
  });

  return patterns;
}

async function identifyInitialPreferences(userData: any, journals: any[]): Promise<UserPreference[]> {
  const preferences: UserPreference[] = [];

  // Communication style preference from journal entries
  const journalLengths = journals.map(j => j.content?.length || 0);
  const avgLength = journalLengths.reduce((a, b) => a + b, 0) / journalLengths.length;
  
  if (avgLength > 200) {
    preferences.push({
      category: 'communication',
      preference: 'detailed_responses',
      strength: 0.7,
      learnedFrom: ['journal_analysis']
    });
  } else {
    preferences.push({
      category: 'communication',
      preference: 'concise_responses',
      strength: 0.6,
      learnedFrom: ['journal_analysis']
    });
  }

  return preferences;
}

async function extractPatternsFromConversation(userMessage: string, responseContent: string, memory: CompanionMemory): Promise<HealthPattern[]> {
  const patterns: HealthPattern[] = [];

  // Simple pattern detection - could be enhanced with more sophisticated NLP
  const message = userMessage.toLowerCase();
  
  // Time-based patterns
  if (message.includes('morning') || message.includes('evening') || message.includes('night')) {
    const timePattern = message.includes('morning') ? 'morning' : 
                      message.includes('evening') ? 'evening' : 'night';
    
    // Check if this is a new pattern
    const existingPattern = memory.patterns.find(p => p.pattern.includes(timePattern));
    if (!existingPattern) {
      patterns.push({
        id: `time-${timePattern}-${Date.now()}`,
        type: 'lifestyle',
        pattern: `Symptoms vary by ${timePattern}`,
        confidence: 0.6,
        frequency: 1,
        lastObserved: new Date(),
        relatedFactors: [timePattern]
      });
    }
  }

  // Activity-based patterns
  if (message.includes('after') && (message.includes('exercise') || message.includes('work') || message.includes('eating'))) {
    const activity = message.includes('exercise') ? 'exercise' :
                    message.includes('work') ? 'work' : 'eating';
    
    const existingPattern = memory.patterns.find(p => p.pattern.includes(activity));
    if (!existingPattern) {
      patterns.push({
        id: `activity-${activity}-${Date.now()}`,
        type: 'trigger',
        pattern: `Symptoms related to ${activity}`,
        confidence: 0.7,
        frequency: 1,
        lastObserved: new Date(),
        relatedFactors: [activity]
      });
    }
  }

  return patterns;
}

async function identifyNewInsights(userMessage: string, responseContent: string, memory: CompanionMemory): Promise<any[]> {
  const insights = [];

  // If user mentions improvement, create positive insight
  if (userMessage.toLowerCase().includes('better') || userMessage.toLowerCase().includes('improvement')) {
    insights.push({
      content: "I notice you're experiencing some improvement - this is valuable data for tracking your progress!",
      type: 'insight',
      confidence: 0.8
    });
  }

  // If user mentions new symptoms, create awareness insight
  if (userMessage.toLowerCase().includes('new') && userMessage.toLowerCase().includes('symptom')) {
    insights.push({
      content: "Tracking new symptoms helps me understand how your condition evolves over time.",
      type: 'pattern',
      confidence: 0.9
    });
  }

  return insights;
}

function extractTopicsFromMessage(message: string): string[] {
  const topics = [];
  const content = message.toLowerCase();
  
  if (content.includes('symptom')) topics.push('symptoms');
  if (content.includes('pain')) topics.push('pain');
  if (content.includes('stress')) topics.push('stress');
  if (content.includes('sleep')) topics.push('sleep');
  if (content.includes('treatment')) topics.push('treatment');
  if (content.includes('mood')) topics.push('mood');
  
  return topics;
}

function analyzeMoodFromMessage(message: string): string {
  const content = message.toLowerCase();
  
  if (content.includes('good') || content.includes('better') || content.includes('happy')) return 'positive';
  if (content.includes('bad') || content.includes('worse') || content.includes('sad') || content.includes('frustrated')) return 'negative';
  
  return 'neutral';
}

async function saveChatMessage(userId: string, userMessage: string, response: any) {
  const batch = db.batch();

  // Save user message
  const userMsgRef = db.collection('companionChats').doc();
  batch.set(userMsgRef, {
    userId,
    role: 'user',
    content: userMessage,
    timestamp: new Date()
  });

  // Save companion response
  const compMsgRef = db.collection('companionChats').doc();
  batch.set(compMsgRef, {
    userId,
    role: 'companion',
    content: response.content,
    type: response.type,
    confidence: response.confidence,
    relatedData: response.relatedData,
    timestamp: new Date()
  });

  await batch.commit();
}