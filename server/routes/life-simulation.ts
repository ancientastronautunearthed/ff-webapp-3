import { Router } from 'express';

export const lifeSimulationRoutes = Router();

// Generate AI-powered life events
lifeSimulationRoutes.post('/generate-event', async (req, res) => {
  try {
    const { characterAge, lifePhase, currentSituation } = req.body;
    
    // AI-generated life events based on current character state
    const lifeEvents = [
      {
        type: 'career_opportunity',
        title: 'Unexpected Job Offer',
        description: 'A prestigious company in the AI-human collaboration sector has reached out with an offer.',
        choices: [
          { text: 'Accept the offer', impact: { salary: 15000, cryptoCoins: 50, satisfaction: 20 } },
          { text: 'Negotiate terms', impact: { salary: 10000, cryptoCoins: 30, satisfaction: 15 } },
          { text: 'Decline politely', impact: { currentJobSatisfaction: 10, cryptoCoins: 10 } }
        ]
      },
      {
        type: 'relationship_milestone',
        title: 'Relationship Deepens',
        description: 'A close relationship in your life is reaching a new milestone.',
        choices: [
          { text: 'Embrace the change', impact: { relationshipBonus: 20, cryptoCoins: 25 } },
          { text: 'Take it slow', impact: { relationshipBonus: 10, cryptoCoins: 15 } },
          { text: 'Set boundaries', impact: { relationshipBonus: 5, cryptoCoins: 10 } }
        ]
      },
      {
        type: 'housing_opportunity',
        title: 'Dream Home Available',
        description: 'The perfect property has come on the market in your desired neighborhood.',
        choices: [
          { text: 'Make an offer immediately', impact: { housing: 'upgrade', cryptoCoins: 100, debt: 50000 } },
          { text: 'Wait and save more', impact: { savings: 5000, cryptoCoins: 20 } },
          { text: 'Look for alternatives', impact: { cryptoCoins: 15 } }
        ]
      },
      {
        type: 'ai_integration_choice',
        title: 'AI Integration Decision',
        description: 'A new AI system offers to optimize your daily life, but requires access to personal data.',
        choices: [
          { text: 'Full integration', impact: { aiTrust: 30, efficiency: 20, privacy: -15, cryptoCoins: 40 } },
          { text: 'Limited access', impact: { aiTrust: 15, efficiency: 10, cryptoCoins: 25 } },
          { text: 'Decline completely', impact: { humanResistance: 20, privacy: 10, cryptoCoins: 20 } }
        ]
      }
    ];
    
    // Select event based on character's current situation
    let selectedEvent = lifeEvents[Math.floor(Math.random() * lifeEvents.length)];
    
    // Age-specific events
    if (characterAge >= 25 && characterAge <= 35) {
      const youngAdultEvents = [
        {
          type: 'education_opportunity',
          title: 'Advanced Learning Program',
          description: 'An opportunity to learn cutting-edge human-AI collaboration techniques.',
          choices: [
            { text: 'Enroll full-time', impact: { skills: ['AI Understanding'], cryptoCoins: 75, debt: 15000 } },
            { text: 'Part-time study', impact: { skills: ['AI Understanding'], cryptoCoins: 40, debt: 7500 } },
            { text: 'Self-study instead', impact: { skills: ['Focus'], cryptoCoins: 20 } }
          ]
        }
      ];
      
      if (Math.random() < 0.3) {
        selectedEvent = youngAdultEvents[0];
      }
    }
    
    res.json({
      event: selectedEvent,
      timestamp: new Date().toISOString(),
      aiGenerated: true
    });
    
  } catch (error) {
    console.error('Life simulation event generation error:', error);
    res.status(500).json({ error: 'Failed to generate life event' });
  }
});

// Track participation rewards
lifeSimulationRoutes.post('/participation-reward', async (req, res) => {
  try {
    const { userId, actionType, actionDetails } = req.body;
    
    const rewardMatrix = {
      'daily_login': 10,
      'quest_completion': 25,
      'relationship_building': 15,
      'career_advancement': 50,
      'housing_purchase': 100,
      'marriage': 200,
      'child_birth': 250,
      'life_goal_completion': 75,
      'ai_story_choice': 20,
      'npc_interaction': 10
    };
    
    const baseReward = rewardMatrix[actionType] || 5;
    const bonusMultiplier = actionDetails?.difficulty || 1;
    const finalReward = Math.floor(baseReward * bonusMultiplier);
    
    // In a real implementation, this would update the user's crypto coin balance
    // and track participation metrics for rewards
    
    res.json({
      cryptoCoinsEarned: finalReward,
      actionType,
      timestamp: new Date().toISOString(),
      message: `Earned ${finalReward} crypto coins for ${actionType.replace('_', ' ')}`
    });
    
  } catch (error) {
    console.error('Participation reward error:', error);
    res.status(500).json({ error: 'Failed to process participation reward' });
  }
});

// Generate AI relationships
lifeSimulationRoutes.post('/generate-relationship', async (req, res) => {
  try {
    const { characterAge, currentRelationships, preferences } = req.body;
    
    const aiGeneratedRelationship = {
      id: `ai_rel_${Date.now()}`,
      name: generateRandomName(),
      type: determineRelationshipType(currentRelationships),
      age: characterAge + (Math.floor(Math.random() * 20) - 10),
      personality: generatePersonalityTraits(),
      occupation: generateOccupation(),
      backstory: generateBackstory(),
      compatibilityScore: Math.floor(Math.random() * 40) + 60, // 60-100
      meetingScenario: generateMeetingScenario()
    };
    
    res.json({
      relationship: aiGeneratedRelationship,
      aiGenerated: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('AI relationship generation error:', error);
    res.status(500).json({ error: 'Failed to generate AI relationship' });
  }
});

function generateRandomName(): string {
  const firstNames = ['Alex', 'Jordan', 'Casey', 'Riley', 'Avery', 'Morgan', 'Taylor', 'Cameron'];
  const lastNames = ['Chen', 'Singh', 'Rodriguez', 'Kim', 'Okafor', 'Santos', 'Wu', 'Davis'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function determineRelationshipType(currentRelationships: any[]): string {
  const hasSpouse = currentRelationships?.some(rel => rel.type === 'spouse');
  const hasRomanticPartner = currentRelationships?.some(rel => rel.type === 'romantic_partner');
  
  if (!hasSpouse && !hasRomanticPartner && Math.random() < 0.4) {
    return 'romantic_partner';
  } else if (Math.random() < 0.7) {
    return 'friend';
  } else {
    return 'coworker';
  }
}

function generatePersonalityTraits(): string[] {
  const traits = [
    'Creative', 'Analytical', 'Empathetic', 'Adventurous', 'Loyal',
    'Optimistic', 'Curious', 'Independent', 'Collaborative', 'Innovative',
    'Patient', 'Energetic', 'Thoughtful', 'Spontaneous', 'Reliable'
  ];
  
  const numTraits = Math.floor(Math.random() * 3) + 2; // 2-4 traits
  const selectedTraits = [];
  
  for (let i = 0; i < numTraits; i++) {
    const randomTrait = traits[Math.floor(Math.random() * traits.length)];
    if (!selectedTraits.includes(randomTrait)) {
      selectedTraits.push(randomTrait);
    }
  }
  
  return selectedTraits;
}

function generateOccupation(): string {
  const occupations = [
    'AI Ethics Consultant',
    'Bio-Digital Integration Specialist',
    'Neural Network Designer',
    'Human-AI Translator',
    'Quantum Reality Programmer',
    'Digital Rights Advocate',
    'Consciousness Researcher',
    'Hybrid Systems Engineer',
    'Empathy Algorithm Developer',
    'Future Studies Analyst'
  ];
  
  return occupations[Math.floor(Math.random() * occupations.length)];
}

function generateBackstory(): string {
  const backstories = [
    'Grew up during the AI emergence of 2034 and chose to work toward human-AI cooperation.',
    'Former skeptic of AI who had a transformative experience that changed their perspective.',
    'Third-generation tech worker adapting family traditions to the new AI-integrated world.',
    'Artist exploring the intersection of human creativity and artificial intelligence.',
    'Researcher studying the psychological impacts of human-AI relationships.',
    'Community organizer working to ensure AI benefits reach all socioeconomic levels.'
  ];
  
  return backstories[Math.floor(Math.random() * backstories.length)];
}

function generateMeetingScenario(): string {
  const scenarios = [
    'Met at a human-AI cooperation conference while discussing ethical implications.',
    'Encountered during a community event focused on bridging digital divides.',
    'Connected through a mutual interest in preserving human culture in an AI world.',
    'Met while volunteering for a project that helps elderly people adapt to AI assistants.',
    'Crossed paths at an underground coffee shop that still serves human-made beverages.',
    'Introduced by a mutual friend who thought you\'d have great conversations about the future.'
  ];
  
  return scenarios[Math.floor(Math.random() * scenarios.length)];
}