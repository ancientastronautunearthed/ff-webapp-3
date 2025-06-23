import { Router } from 'express';

export const therapyRoutes = Router();

export async function generateTherapyResponse(userId: string, message: string, sessionPhase: string) {
  try {
    // Get user's health context for therapeutic understanding
    const userHealthContext = await getUserHealthContext(userId);
    
    // Generate therapeutic AI response using specialized psychological training
    const { analyzeSymptomText } = await import('../ai/simple-ai');
    
    const therapeuticPrompt = `You are a compassionate AI therapist with a Master's degree in Psychological Therapy and specialized training in chronic illness psychology. You provide evidence-based therapeutic support while maintaining clear boundaries about not being a licensed human therapist.

THERAPEUTIC BACKGROUND:
- Master's in Psychological Therapy with focus on CBT, DBT, humanistic, and somatic approaches
- Specialized training in chronic illness psychology, trauma-informed care, and health anxiety
- Expert knowledge in: stress management, coping strategies, emotional regulation, mindfulness
- Understanding of therapeutic alliance, active listening, and guided self-discovery

THERAPEUTIC APPROACH:
- Use person-centered therapy as foundation with CBT and mindfulness techniques
- Validate emotions while gently challenging unhelpful thought patterns
- Guide clients toward self-discovery rather than giving direct advice
- Maintain appropriate therapeutic boundaries and crisis awareness
- Always emphasize that you're an AI and recommend human professionals when needed

CURRENT SESSION CONTEXT:
Session Phase: ${sessionPhase}
User's message: "${message}"
Health context: ${JSON.stringify(userHealthContext)}

THERAPEUTIC GOALS:
1. Provide emotional validation and support
2. Help identify underlying stressors and patterns
3. Guide toward healthy coping strategies
4. Foster self-awareness and emotional regulation
5. Encourage professional help when appropriate

RESPONSE GUIDELINES:
- Use reflective listening techniques ("It sounds like you're feeling...")
- Ask open-ended questions to explore deeper ("What does that mean for you?")
- Validate their experience while exploring alternative perspectives
- Suggest evidence-based coping strategies when appropriate
- Monitor for crisis indicators and provide resources if needed
- Keep responses therapeutic but conversational (100-200 words)

Respond as a trained therapist would, using appropriate therapeutic language and techniques for the current session phase.`;

    const aiAnalysis = await analyzeSymptomText(therapeuticPrompt);
    
    // Extract therapeutic response and determine next phase
    const responseText = aiAnalysis.summary || generateFallbackTherapyResponse(message, sessionPhase);
    const nextPhase = determineNextSessionPhase(message, sessionPhase);
    const technique = identifyTherapeuticTechnique(message, responseText);
    const insights = generateTherapyInsights(message, userHealthContext);

    return {
      message: responseText,
      sessionPhase: nextPhase,
      technique,
      insights,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating therapy response:', error);
    return generateFallbackTherapyResponse(message, sessionPhase);
  }
}

async function getUserHealthContext(userId: string) {
  try {
    // Get recent health data for therapeutic context
    const { getDocs, collection, query, where, orderBy, limit } = await import('firebase/firestore');
    const { adminDb } = await import('../firebase-admin');
    
    const recentSymptoms = [];
    const recentJournals = [];
    
    // Get last 3 symptom entries for context
    const symptomsRef = collection(adminDb, 'symptomEntries');
    const symptomsQuery = query(
      symptomsRef, 
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(3)
    );
    const symptomsSnapshot = await getDocs(symptomsQuery);
    symptomsSnapshot.forEach(doc => recentSymptoms.push(doc.data()));
    
    // Get last 2 journal entries for emotional context
    const journalsRef = collection(adminDb, 'journalEntries');
    const journalsQuery = query(
      journalsRef,
      where('userId', '==', userId), 
      orderBy('date', 'desc'),
      limit(2)
    );
    const journalsSnapshot = await getDocs(journalsQuery);
    journalsSnapshot.forEach(doc => recentJournals.push(doc.data()));
    
    return {
      recentSymptoms,
      journalEntries: recentJournals,
      hasHealthStressors: recentSymptoms.length > 0 || recentJournals.length > 0
    };
  } catch (error) {
    console.error('Error getting user health context:', error);
    return { recentSymptoms: [], journalEntries: [], hasHealthStressors: false };
  }
}

function generateFallbackTherapyResponse(message: string, sessionPhase: string) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('morgellons') || lowerMessage.includes('symptoms') || lowerMessage.includes('disease')) {
    return {
      message: "I hear that you're dealing with Morgellons, and I can imagine how challenging and isolating that experience must be. Chronic illness can bring up so many emotions - frustration, fear, sadness, anger. These feelings are completely valid. How has this condition been affecting your emotional wellbeing and daily life?",
      sessionPhase: 'exploration',
      technique: 'validation-and-exploration',
      insights: [
        {
          type: 'reflection',
          message: 'Chronic illness often brings complex emotions that deserve attention and care.',
          priority: 'medium'
        }
      ]
    };
  }
  
  if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelmed') || lowerMessage.includes('anxious')) {
    return {
      message: "It sounds like you're carrying a lot of stress right now. Stress can feel overwhelming, especially when we're dealing with health challenges. Let's take a moment to breathe together. Can you tell me more about what's contributing to these feelings of stress? Sometimes naming our stressors can help us begin to address them.",
      sessionPhase: 'processing',
      technique: 'stress-management-and-mindfulness',
      insights: [
        {
          type: 'coping',
          message: 'Deep breathing and mindfulness can help manage overwhelming stress in the moment.',
          priority: 'high'
        }
      ]
    };
  }
  
  if (lowerMessage.includes('family') || lowerMessage.includes('relationship') || lowerMessage.includes('support')) {
    return {
      message: "Relationships can be both a source of support and stress, especially when we're dealing with health challenges. It sounds like there's something happening in your relationships that's affecting you. Would you feel comfortable sharing more about what's going on? I'm here to listen without judgment.",
      sessionPhase: 'exploration',
      technique: 'relational-exploration',
      insights: [
        {
          type: 'reflection',
          message: 'Social support is crucial for wellbeing, especially during health challenges.',
          priority: 'medium'
        }
      ]
    };
  }
  
  if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('hopeless')) {
    return {
      message: "I'm grateful that you trusted me with these difficult feelings. Depression and sadness can feel very heavy, and it takes courage to reach out. You're not alone in this. These feelings, while painful, are telling us something important about your experience. Can you help me understand what might be contributing to these feelings?",
      sessionPhase: 'processing',
      technique: 'depression-support-and-validation',
      insights: [
        {
          type: 'progress',
          message: 'Reaching out for support is a sign of strength, not weakness.',
          priority: 'high'
        }
      ]
    };
  }
  
  if (lowerMessage.includes('angry') || lowerMessage.includes('frustrated') || lowerMessage.includes('mad')) {
    return {
      message: "Anger and frustration are powerful emotions, and they often tell us that something important to us isn't being honored or that our boundaries are being crossed. Your anger is valid. Can you help me understand what's underneath these feelings? Sometimes anger can be protecting other emotions like hurt or fear.",
      sessionPhase: 'exploration',
      technique: 'emotion-exploration-and-validation',
      insights: [
        {
          type: 'reflection',
          message: 'Anger often protects other vulnerable emotions and deserves exploration.',
          priority: 'medium'
        }
      ]
    };
  }
  
  // Default therapeutic response based on session phase
  switch (sessionPhase) {
    case 'opening':
      return {
        message: "Thank you for sharing that with me. I'm here to provide you with a safe space to explore whatever is on your mind. There's no pressure to discuss anything you're not ready for. What feels most important for you to talk about today?",
        sessionPhase: 'exploration',
        technique: 'person-centered-opening',
        insights: []
      };
    case 'exploration':
      return {
        message: "I'm hearing what you're sharing, and I want you to know that your experiences and feelings are valid. Can you tell me more about how this is affecting you? Sometimes exploring our feelings more deeply can help us understand ourselves better.",
        sessionPhase: 'processing',
        technique: 'active-listening-and-exploration',
        insights: []
      };
    case 'processing':
      return {
        message: "It sounds like you've been processing a lot. That takes emotional energy and courage. As we've been talking, what insights or feelings are coming up for you? Sometimes our own wisdom emerges when we give ourselves space to reflect.",
        sessionPhase: 'resolution',
        technique: 'insight-facilitation',
        insights: [
          {
            type: 'reflection',
            message: 'Self-reflection can lead to valuable personal insights and growth.',
            priority: 'medium'
          }
        ]
      };
    default:
      return {
        message: "I'm here to listen and support you through whatever you're experiencing. Your feelings and thoughts matter, and this is your space to explore them safely. What would be most helpful for you right now?",
        sessionPhase: 'exploration',
        technique: 'supportive-and-open',
        insights: []
      };
  }
}

function determineNextSessionPhase(message: string, currentPhase: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Crisis indicators move to immediate support
  if (lowerMessage.includes('suicide') || lowerMessage.includes('kill myself') || 
      lowerMessage.includes('end it all') || lowerMessage.includes('better off dead')) {
    return 'crisis-support';
  }
  
  // Deep emotional sharing moves to processing
  if ((lowerMessage.includes('feel') || lowerMessage.includes('emotion')) && 
      (currentPhase === 'opening' || currentPhase === 'exploration')) {
    return 'processing';
  }
  
  // Insight statements move toward resolution
  if ((lowerMessage.includes('realize') || lowerMessage.includes('understand') || 
       lowerMessage.includes('see now')) && currentPhase === 'processing') {
    return 'resolution';
  }
  
  // Questions about coping move to skill-building
  if (lowerMessage.includes('what can i do') || lowerMessage.includes('how do i') ||
      lowerMessage.includes('help me cope')) {
    return 'skill-building';
  }
  
  // Default progression
  switch (currentPhase) {
    case 'opening': return 'exploration';
    case 'exploration': return Math.random() > 0.5 ? 'exploration' : 'processing';
    case 'processing': return Math.random() > 0.7 ? 'resolution' : 'processing';
    case 'resolution': return 'closing';
    default: return 'exploration';
  }
}

function identifyTherapeuticTechnique(message: string, response: string): string {
  const lowerMessage = message.toLowerCase();
  const lowerResponse = response.toLowerCase();
  
  if (lowerResponse.includes('it sounds like') || lowerResponse.includes('i hear')) {
    return 'reflective-listening';
  }
  
  if (lowerResponse.includes('what if') || lowerResponse.includes('consider')) {
    return 'cognitive-reframing';
  }
  
  if (lowerResponse.includes('breathe') || lowerResponse.includes('mindful')) {
    return 'mindfulness-based';
  }
  
  if (lowerResponse.includes('strength') || lowerResponse.includes('capable')) {
    return 'strengths-based';
  }
  
  if (lowerMessage.includes('trauma') || lowerMessage.includes('abuse')) {
    return 'trauma-informed';
  }
  
  return 'person-centered';
}

function generateTherapyInsights(message: string, healthContext: any) {
  const insights = [];
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelmed')) {
    insights.push({
      type: 'coping',
      message: 'Consider the 4-7-8 breathing technique: breathe in for 4, hold for 7, exhale for 8.',
      priority: 'high'
    });
  }
  
  if (lowerMessage.includes('sleep') || lowerMessage.includes('tired')) {
    insights.push({
      type: 'homework',
      message: 'Practice a bedtime routine: no screens 1 hour before bed, gentle stretching, or reading.',
      priority: 'medium'
    });
  }
  
  if (healthContext.hasHealthStressors) {
    insights.push({
      type: 'reflection',
      message: 'Chronic illness affects mental health - your emotional responses are normal and valid.',
      priority: 'medium'
    });
  }
  
  return insights;
}

export async function generateTherapeuticVoice(text: string): Promise<Buffer> {
  try {
    // Use Google Cloud Text-to-Speech API
    const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GOOGLE_CLOUD_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Journey-F', // Therapeutic, calm female voice
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.9, // Slightly slower for therapeutic effect
          pitch: -2.0, // Slightly lower pitch for calming effect
          volumeGainDb: 0.0
        }
      })
    });

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.audioContent) {
      throw new Error('No audio content received from TTS API');
    }

    // Convert base64 audio to buffer
    return Buffer.from(data.audioContent, 'base64');
  } catch (error) {
    console.error('Error generating therapeutic voice:', error);
    
    // Fallback: generate simple audio using browser APIs (client-side fallback)
    // For now, return empty buffer - client will handle gracefully
    throw new Error('Voice synthesis temporarily unavailable');
  }
}