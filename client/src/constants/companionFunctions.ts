// Centralized function definitions to ensure consistency across all components
export const COMPANION_FUNCTIONS = [
  { 
    id: 'basic-chat',
    name: 'Basic Chat', 
    tier: 1, 
    category: 'communication',
    description: 'Simple health-focused conversations with your AI companion',
    pointsRequired: 0
  },
  { 
    id: 'symptom-logging',
    name: 'Symptom Logging', 
    tier: 1, 
    category: 'tracking',
    description: 'Track and log your daily symptoms with AI assistance',
    pointsRequired: 0
  },
  { 
    id: 'daily-checkins',
    name: 'Daily Check-ins', 
    tier: 2, 
    category: 'tracking',
    description: 'Structured daily health assessments and mood tracking',
    pointsRequired: 100
  },
  { 
    id: 'meal-suggestions',
    name: 'Meal Suggestions', 
    tier: 3, 
    category: 'recommendations',
    description: 'AI-powered personalized meal recommendations based on your symptoms',
    pointsRequired: 250
  },
  { 
    id: 'pattern-analysis',
    name: 'Pattern Analysis', 
    tier: 4, 
    category: 'analysis',
    description: 'Advanced pattern recognition in your health data and correlations',
    pointsRequired: 450
  },
  { 
    id: 'supplement-recommendations',
    name: 'Supplement Recommendations', 
    tier: 5, 
    category: 'recommendations',
    description: 'Personalized supplement plans with dosage and timing guidance',
    pointsRequired: 700
  },
  { 
    id: 'symptom-predictions',
    name: 'Symptom Predictions', 
    tier: 6, 
    category: 'predictions',
    description: 'Predictive modeling to forecast symptom patterns and flares',
    pointsRequired: 1000
  },
  { 
    id: 'treatment-optimization',
    name: 'Treatment Optimization', 
    tier: 7, 
    category: 'optimization',
    description: 'Optimized treatment scheduling based on response patterns',
    pointsRequired: 1350
  },
  { 
    id: 'research-matching',
    name: 'Research Matching', 
    tier: 8, 
    category: 'research',
    description: 'Find relevant clinical trials and research studies',
    pointsRequired: 1750
  },
  { 
    id: 'advanced-analytics',
    name: 'Advanced Analytics', 
    tier: 9, 
    category: 'analytics',
    description: 'Comprehensive health analytics and trend analysis',
    pointsRequired: 2200
  },
  { 
    id: 'comprehensive-reports',
    name: 'Comprehensive Reports', 
    tier: 10, 
    category: 'reports',
    description: 'Complete health reports for healthcare providers',
    pointsRequired: 2700
  }
];

export const getFunctionByTier = (tier: number) => {
  return COMPANION_FUNCTIONS.filter(func => func.tier === tier);
};

export const getFunctionById = (id: string) => {
  return COMPANION_FUNCTIONS.find(func => func.id === id);
};

export const getFunctionsByCategory = (category: string) => {
  return COMPANION_FUNCTIONS.filter(func => func.category === category);
};