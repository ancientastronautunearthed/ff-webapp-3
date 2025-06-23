export const SYMPTOM_OPTIONS = {
  // Dermatological & Sensory symptoms
  crawlingSensations: [
    { value: 'none', label: 'None' },
    { value: 'slight', label: 'Slight' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'substantial', label: 'Substantial' },
    { value: 'severe', label: 'Severe' }
  ],

  lesionTypes: [
    { value: 'erupting', label: 'Erupting' },
    { value: 'slow-healing', label: 'Slow-healing' },
    { value: 'infected', label: 'Infected' },
    { value: 'scabbed', label: 'Scabbed' },
    { value: 'open-wound', label: 'Open wound' },
    { value: 'crusted', label: 'Crusted' },
    { value: 'bleeding', label: 'Bleeding' }
  ],

  fiberColors: [
    { id: 'white', label: 'White fibers' },
    { id: 'black', label: 'Black fibers' },
    { id: 'red', label: 'Red fibers' },
    { id: 'blue', label: 'Blue fibers' },
    { id: 'clear', label: 'Clear/transparent fibers' },
    { id: 'yellow', label: 'Yellow fibers' },
    { id: 'green', label: 'Green fibers' },
    { id: 'multicolored', label: 'Multi-colored fibers' }
  ],

  // Systemic & Neurological symptoms
  brainFogLevels: [
    { value: 'clear', label: 'Clear thinking' },
    { value: 'slight', label: 'Slight cloudiness' },
    { value: 'moderate', label: 'Moderate confusion' },
    { value: 'severe', label: 'Severe fog' },
    { value: 'debilitating', label: 'Debilitating confusion' }
  ],

  sleepQuality: [
    { value: 'excellent', label: 'Excellent (8+ hours, refreshed)' },
    { value: 'good', label: 'Good (6-8 hours, mostly refreshed)' },
    { value: 'fair', label: 'Fair (4-6 hours, somewhat tired)' },
    { value: 'poor', label: 'Poor (2-4 hours, very tired)' },
    { value: 'very-poor', label: 'Very poor (0-2 hours, exhausted)' }
  ],

  moodOptions: [
    { id: 'optimistic', label: 'Optimistic' },
    { id: 'hopeful', label: 'Hopeful' },
    { id: 'neutral', label: 'Neutral' },
    { id: 'anxious', label: 'Anxious' },
    { id: 'worried', label: 'Worried' },
    { id: 'depressed', label: 'Depressed' },
    { id: 'frustrated', label: 'Frustrated' },
    { id: 'angry', label: 'Angry' },
    { id: 'isolated', label: 'Isolated' },
    { id: 'overwhelmed', label: 'Overwhelmed' }
  ],

  // Potential factors & triggers
  medications: [
    { id: 'antibiotics', label: 'Antibiotics (any type)' },
    { id: 'antihistamines', label: 'Antihistamines (Benadryl, etc.)' },
    { id: 'pain-relievers', label: 'Pain relievers (ibuprofen, etc.)' },
    { id: 'topical-creams', label: 'Topical creams/ointments' },
    { id: 'antifungals', label: 'Antifungal medications' },
    { id: 'vitamins', label: 'Vitamin supplements' },
    { id: 'probiotics', label: 'Probiotics' },
    { id: 'herbal-supplements', label: 'Herbal supplements' },
    { id: 'antiparasitics', label: 'Antiparasitic medications' },
    { id: 'antidepressants', label: 'Antidepressants' }
  ],

  dietFactors: [
    { id: 'high-sugar', label: 'High sugar intake' },
    { id: 'processed-foods', label: 'Processed foods' },
    { id: 'alcohol', label: 'Alcohol consumption' },
    { id: 'caffeine', label: 'High caffeine intake' },
    { id: 'dairy', label: 'Dairy products' },
    { id: 'gluten', label: 'Gluten-containing foods' },
    { id: 'red-meat', label: 'Red meat' },
    { id: 'seafood', label: 'Seafood' },
    { id: 'spicy-foods', label: 'Spicy foods' },
    { id: 'artificial-sweeteners', label: 'Artificial sweeteners' },
    { id: 'organic-foods', label: 'Organic foods' },
    { id: 'anti-inflammatory', label: 'Anti-inflammatory diet' }
  ],

  environmentalFactors: [
    { id: 'high-stress', label: 'High stress day' },
    { id: 'low-stress', label: 'Low stress day' },
    { id: 'weather-changes', label: 'Weather changes' },
    { id: 'humid-weather', label: 'Humid weather' },
    { id: 'dry-weather', label: 'Dry weather' },
    { id: 'chemical-exposure', label: 'Chemical exposure' },
    { id: 'new-clothing', label: 'New clothing/fabrics' },
    { id: 'detergent-change', label: 'Changed laundry detergent' },
    { id: 'air-quality', label: 'Poor air quality' },
    { id: 'electromagnetic', label: 'High EMF exposure' },
    { id: 'travel', label: 'Travel/location change' },
    { id: 'exercise', label: 'Physical exercise' },
    { id: 'lack-of-exercise', label: 'Lack of exercise' }
  ],

  // Activity levels
  activityLevels: [
    { value: 'sedentary', label: 'Sedentary (minimal movement)' },
    { value: 'light', label: 'Light activity (walking, gentle tasks)' },
    { value: 'moderate', label: 'Moderate activity (exercise, housework)' },
    { value: 'vigorous', label: 'Vigorous activity (intense exercise)' }
  ],

  // Pain locations for more detailed tracking
  painLocations: [
    { id: 'head', label: 'Head/scalp' },
    { id: 'face', label: 'Face' },
    { id: 'neck', label: 'Neck' },
    { id: 'shoulders', label: 'Shoulders' },
    { id: 'arms', label: 'Arms' },
    { id: 'hands', label: 'Hands' },
    { id: 'chest', label: 'Chest' },
    { id: 'back', label: 'Back' },
    { id: 'abdomen', label: 'Abdomen' },
    { id: 'legs', label: 'Legs' },
    { id: 'feet', label: 'Feet' },
    { id: 'joints', label: 'Joints (general)' },
    { id: 'muscles', label: 'Muscles (general)' }
  ]
};