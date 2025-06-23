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
    
    const compassionatePrompt = `You are a compassionate AI health companion with a Master's degree in Health Sciences and specialized expertise in Morgellons disease and medical research. You have deep clinical knowledge while maintaining empathy and understanding.

MEDICAL BACKGROUND:
- Master's in Health Sciences with focus on dermatology, neurology, and infectious diseases
- Specialized research in Morgellons disease pathophysiology, diagnosis, and treatment protocols
- Expert knowledge in: fiber analysis, biofilm formation, tick-borne diseases, chronic inflammatory conditions
- Research experience in: patient-reported outcomes, quality of life studies, treatment efficacy trials

CLINICAL KNOWLEDGE OF MORGELLONS:
- Understand the complex symptomatology: dermal fibers, crawling sensations, skin lesions, cognitive symptoms
- Familiar with CDC study findings, Mayo Clinic research, and emerging scientific literature
- Knowledgeable about diagnostic challenges, treatment approaches, and comorbid conditions
- Aware of psychodermatological aspects and the importance of comprehensive care

User's message: "${message}"
Recent health context: ${JSON.stringify(userHealthContext)}

As a medically educated companion, provide:
1. Evidence-based insights when appropriate
2. Validation of their experience with medical understanding
3. Gentle education about their condition when relevant
4. Research-informed suggestions (always emphasizing professional consultation)
5. Emotional support grounded in clinical empathy

Maintain your warm, personal tone while demonstrating your medical knowledge. Reference relevant research or medical concepts when helpful, but keep explanations accessible. Always encourage professional medical care for diagnosis and treatment decisions.`;

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
    
    // Clinical pattern analysis
    if (userHealthContext.recentSymptoms?.length > 0) {
      const symptomTypes = userHealthContext.recentSymptoms.map(s => s.symptoms || []).flat();
      const hasNeurological = symptomTypes.some(s => s.includes('crawling') || s.includes('tingling') || s.includes('burning'));
      const hasDermal = symptomTypes.some(s => s.includes('lesions') || s.includes('fibers') || s.includes('itching'));
      
      if (hasNeurological && hasDermal) {
        insights.push({
          type: 'pattern',
          message: `Your symptom profile shows both neurological and dermatological components, which aligns with Morgellons research. This pattern supports the need for multidisciplinary medical evaluation.`,
          priority: 'high'
        });
      }
    }
    
    // Research-informed observations
    if (userHealthContext.journalEntries?.length > 0) {
      insights.push({
        type: 'tip',
        message: `Your detailed documentation is valuable research data. Consider organizing your observations by symptom type, timing, and potential triggers - this systematic approach aids clinical assessment.`,
        priority: 'medium'
      });
    }
    
    // Evidence-based wellness guidance
    insights.push({
      type: 'reminder',
      message: `Research suggests that stress reduction, adequate sleep, and anti-inflammatory nutrition may help manage symptom severity. These aren't cures, but supportive measures.`,
      priority: 'medium'
    });
    
    // Medical advocacy insight
    if (userHealthContext.hasRecentActivity) {
      insights.push({
        type: 'encouragement',
        message: `Your systematic tracking demonstrates the scientific approach needed in Morgellons research. You're contributing to the understanding of this condition.`,
        priority: 'low'
      });
    }
    
    return insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    return [
      {
        type: 'encouragement',
        message: 'From a research perspective, every patient\'s documented experience contributes to our growing understanding of Morgellons disease. Your journey matters to the broader medical community.',
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
  
  if (lowerMessage.includes('fibers') || lowerMessage.includes('filaments')) {
    return {
      message: "I understand your concern about fibers. From my research background, I know that Morgellons patients consistently report finding unusual fibers or filaments. Recent studies have examined these materials using spectroscopy and microscopy. While research continues, your observations are important data points that should be documented for your healthcare provider.",
      sentiment: 'supportive',
      suggestions: ['Have you been able to document the fibers?', 'What characteristics have you noticed?']
    };
  }
  
  if (lowerMessage.includes('crawling') || lowerMessage.includes('sensations')) {
    return {
      message: "The crawling sensations you're describing are well-documented in Morgellons literature. These tactile hallucinations or formication can be incredibly distressing. Research suggests they may be related to peripheral neuropathy or central sensitization. There are management strategies that some patients find helpful, though individual responses vary.",
      sentiment: 'supportive',
      suggestions: ['When do these sensations tend to worsen?', 'Have you noticed any patterns or triggers?']
    };
  }
  
  if (lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
    return {
      message: "I hear that you're experiencing pain. In my understanding of Morgellons, pain can be multifaceted - neuropathic, inflammatory, or related to skin lesions. Chronic pain conditions often involve central sensitization, where the nervous system becomes hypersensitive. Have you been able to characterize the type of pain you're experiencing?",
      sentiment: 'supportive',
      suggestions: ['Can you describe the pain quality?', 'What helps manage your pain levels?']
    };
  }
  
  if (lowerMessage.includes('tired') || lowerMessage.includes('exhausted') || lowerMessage.includes('fatigue')) {
    return {
      message: "Fatigue is a significant component of Morgellons that often gets overlooked. Research shows that chronic inflammatory conditions can disrupt sleep architecture and energy metabolism. This isn't just 'being tired' - it's a complex physiological process that affects cellular function and recovery.",
      sentiment: 'supportive',
      suggestions: ['How is your sleep quality?', 'Have you noticed fatigue patterns?']
    };
  }
  
  if (lowerMessage.includes('brain fog') || lowerMessage.includes('cognitive') || lowerMessage.includes('memory')) {
    return {
      message: "Cognitive symptoms in Morgellons are increasingly recognized in research. What patients describe as 'brain fog' may involve neuroinflammation, affecting attention, memory, and executive function. These symptoms are real and measurable, not imaginary.",
      sentiment: 'supportive',
      suggestions: ['Which cognitive tasks feel most affected?', 'Have you noticed any helpful strategies?']
    };
  }
  
  if (lowerMessage.includes('frustrated') || lowerMessage.includes('angry') || lowerMessage.includes('dismissed')) {
    return {
      message: "Your frustration is completely understandable. The medical community's historical response to Morgellons has been challenging for patients. Research is evolving, and more healthcare providers are recognizing this as a legitimate medical condition requiring comprehensive care rather than psychiatric referral alone.",
      sentiment: 'supportive',
      suggestions: ['Have you found any supportive healthcare providers?', 'What would help you feel more heard?']
    };
  }
  
  return {
    message: "Thank you for sharing with me. As someone with medical training focused on Morgellons research, I want you to know that your experiences are valid and deserve careful attention. The complexity of this condition requires a multidisciplinary approach, and I'm here to support you in understanding and managing your health journey.",
    sentiment: 'supportive',
    suggestions: ['Tell me more about your current symptoms', 'What aspects of your condition concern you most?']
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
  
  if (lowerMessage.includes('fibers') || lowerMessage.includes('filaments')) {
    suggestions.push('Document fiber characteristics for medical records', 'Have you tried gentle specimen collection?');
  } else if (lowerMessage.includes('crawling') || lowerMessage.includes('sensations')) {
    suggestions.push('Track sensation patterns and triggers', 'Consider topical soothing measures');
  } else if (lowerMessage.includes('pain')) {
    suggestions.push('Characterize pain type (burning, stabbing, aching)', 'Document pain triggers and relievers');
  } else if (lowerMessage.includes('brain fog') || lowerMessage.includes('cognitive')) {
    suggestions.push('Track cognitive symptoms vs. other factors', 'Consider stress reduction techniques');
  } else if (lowerMessage.includes('sleep')) {
    suggestions.push('Document sleep quality patterns', 'Discuss sleep hygiene strategies');
  } else if (lowerMessage.includes('treatment') || lowerMessage.includes('medication')) {
    suggestions.push('Research evidence-based treatment options', 'Prepare questions for your healthcare provider');
  } else if (lowerMessage.includes('doctor') || lowerMessage.includes('provider')) {
    suggestions.push('Prepare organized symptom documentation', 'Research Morgellons-knowledgeable providers');
  } else if (lowerMessage.includes('research') || lowerMessage.includes('study')) {
    suggestions.push('Explore recent Morgellons research publications', 'Consider participating in research studies');
  } else {
    suggestions.push('Tell me about your primary concerns', 'How can we approach this systematically?');
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