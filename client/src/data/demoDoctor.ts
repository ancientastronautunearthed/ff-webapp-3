export const demoDoctor = {
  id: 'demo_doctor_1',
  name: 'Dr. Maria Elena Rodriguez',
  email: 'demo.doctor@fiberfriendsapp.com',
  password: 'DemoDoctor2025!',
  specialties: ['Internal Medicine', 'Environmental Medicine', 'Morgellons Disease'],
  credentials: {
    medicalLicense: 'CA-MD-987654',
    boardCertifications: ['Internal Medicine', 'Environmental Medicine'],
    medicalSchool: 'Stanford University School of Medicine',
    residency: 'UCSF Internal Medicine',
    yearsExperience: 15
  },
  morgellonsExperience: {
    patientsStreated: 200,
    yearsSpecializing: 8,
    researchPublications: 12,
    specializedTraining: ['Biotoxin Illness', 'Mold-Related Illness', 'Tick-Borne Diseases']
  },
  contactInfo: {
    phone: '(555) 123-4567',
    address: '123 Medical Plaza, San Francisco, CA 94102',
    officeHours: 'Mon-Fri 8:00 AM - 6:00 PM'
  }
};

export const demoPatients = [
  {
    id: 'patient_demo_1',
    name: 'Sarah Chen',
    email: 'sarah.demo@patient.com',
    avatar: null,
    age: 34,
    gender: 'Female',
    location: 'San Francisco, CA',
    diagnosisDate: new Date('2023-06-15'),
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    symptomSeverity: 'high' as const,
    unreadMessages: 3,
    nextAppointment: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    companionTier: 5,
    medicalHistory: {
      previousDiagnoses: ['Chronic Fatigue Syndrome', 'Fibromyalgia'],
      allergies: ['Penicillin', 'Environmental molds'],
      currentMedications: ['Low-dose naltrexone', 'Vitamin D3', 'Omega-3'],
      environmentalExposures: ['Water damage in home 2019', 'Tick bite 2022']
    },
    recentActivity: {
      lastSymptomEntry: new Date(Date.now() - 8 * 60 * 60 * 1000),
      lastJournalEntry: new Date(Date.now() - 12 * 60 * 60 * 1000),
      lastAIInsight: new Date(Date.now() - 4 * 60 * 60 * 1000)
    }
  },
  {
    id: 'patient_demo_2',
    name: 'Michael Rodriguez',
    email: 'michael.demo@patient.com',
    avatar: null,
    age: 42,
    gender: 'Male',
    location: 'Oakland, CA',
    diagnosisDate: new Date('2022-03-20'),
    lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    symptomSeverity: 'moderate' as const,
    unreadMessages: 1,
    nextAppointment: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    companionTier: 3,
    medicalHistory: {
      previousDiagnoses: ['Lyme Disease', 'Depression'],
      allergies: ['Sulfa drugs'],
      currentMedications: ['Doxycycline', 'Probiotics', 'B-Complex'],
      environmentalExposures: ['Mold exposure workplace 2021', 'Multiple tick bites']
    },
    recentActivity: {
      lastSymptomEntry: new Date(Date.now() - 24 * 60 * 60 * 1000),
      lastJournalEntry: new Date(Date.now() - 36 * 60 * 60 * 1000),
      lastAIInsight: new Date(Date.now() - 18 * 60 * 60 * 1000)
    }
  },
  {
    id: 'patient_demo_3',
    name: 'Emma Thompson',
    email: 'emma.demo@patient.com',
    avatar: null,
    age: 28,
    gender: 'Female',
    location: 'San Jose, CA',
    diagnosisDate: new Date('2024-01-10'),
    lastActive: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    symptomSeverity: 'critical' as const,
    unreadMessages: 7,
    nextAppointment: null, // Needs urgent scheduling
    companionTier: 2,
    medicalHistory: {
      previousDiagnoses: ['Anxiety Disorder'],
      allergies: ['Latex', 'Tree nuts'],
      currentMedications: ['Hydroxyzine', 'Vitamin C', 'Magnesium'],
      environmentalExposures: ['Apartment flooding 2023', 'New construction exposure']
    },
    recentActivity: {
      lastSymptomEntry: new Date(Date.now() - 2 * 60 * 60 * 1000),
      lastJournalEntry: new Date(Date.now() - 3 * 60 * 60 * 1000),
      lastAIInsight: new Date(Date.now() - 30 * 60 * 1000)
    }
  },
  {
    id: 'patient_demo_4',
    name: 'James Wilson',
    email: 'james.demo@patient.com',
    avatar: null,
    age: 55,
    gender: 'Male',
    location: 'Sacramento, CA',
    diagnosisDate: new Date('2021-11-05'),
    lastActive: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
    symptomSeverity: 'low' as const,
    unreadMessages: 0,
    nextAppointment: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // next week
    companionTier: 7,
    medicalHistory: {
      previousDiagnoses: ['Type 2 Diabetes', 'Hypertension', 'Chronic Lyme'],
      allergies: ['None known'],
      currentMedications: ['Metformin', 'Lisinopril', 'Herbal antimicrobials'],
      environmentalExposures: ['Cabin with water damage', 'Agricultural pesticides']
    },
    recentActivity: {
      lastSymptomEntry: new Date(Date.now() - 48 * 60 * 60 * 1000),
      lastJournalEntry: new Date(Date.now() - 72 * 60 * 60 * 1000),
      lastAIInsight: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  }
];

export const demoMessages = [
  // Sarah Chen Messages
  {
    id: 'msg_sarah_1',
    patientId: 'patient_demo_1',
    patientName: 'Sarah Chen',
    senderId: 'patient_demo_1',
    senderType: 'patient' as const,
    content: 'Hi Dr. Rodriguez, I\'ve been experiencing a significant increase in crawling sensations over the past 3 days. The intensity is much worse in the evenings. My AI companion has detected a correlation with the recent rainy weather and suggests it might be related to increased humidity in my home. I\'ve also noticed more fiber emergence from the lesions on my arms. Should I be concerned about this pattern?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    messageType: 'text' as const,
    priority: 'high' as const,
    attachments: []
  },
  {
    id: 'msg_sarah_2',
    patientId: 'patient_demo_1',
    patientName: 'Sarah Chen',
    senderId: 'patient_demo_1',
    senderType: 'patient' as const,
    content: 'I forgot to mention - I started the new biofilm disruption protocol you prescribed last week. Could this be causing a herxheimer reaction? My AI companion is recommending I increase my detox support.',
    timestamp: new Date(Date.now() - 90 * 60 * 1000),
    read: false,
    messageType: 'text' as const,
    priority: 'normal' as const,
    attachments: []
  },
  {
    id: 'msg_sarah_3',
    patientId: 'patient_demo_1',
    patientName: 'Sarah Chen',
    senderId: 'demo_doctor_1',
    senderType: 'doctor' as const,
    content: 'Thank you for the detailed update, Sarah. The pattern your AI companion identified is very insightful - humidity can indeed trigger symptom flares in many patients. Yes, this could be a herx reaction from the biofilm protocol. Let\'s schedule a telehealth call tomorrow to discuss adjusting your detox support and possibly adding humidity control measures to your environmental management plan.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: true,
    messageType: 'text' as const,
    priority: 'normal' as const,
    attachments: []
  },

  // Michael Rodriguez Messages
  {
    id: 'msg_michael_1',
    patientId: 'patient_demo_2',
    patientName: 'Michael Rodriguez',
    senderId: 'patient_demo_2',
    senderType: 'patient' as const,
    content: 'Dr. Rodriguez, my AI companion has been tracking my symptoms and noticed that my joint pain significantly increases 2-3 days after I visit my workplace. The building has had ongoing moisture issues. Should I consider this a major trigger? My Lyme symptoms seem stable otherwise.',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    read: false,
    messageType: 'text' as const,
    priority: 'normal' as const,
    attachments: []
  },

  // Emma Thompson Messages (Critical Patient)
  {
    id: 'msg_emma_1',
    patientId: 'patient_demo_3',
    patientName: 'Emma Thompson',
    senderId: 'patient_demo_3',
    senderType: 'patient' as const,
    content: 'Dr. Rodriguez, I\'m really struggling today. The crawling sensations are constant and I can barely sleep. I\'m seeing more fibers and the itching is unbearable. My AI companion sent me a crisis alert suggesting I contact you immediately. I\'m starting to feel hopeless.',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    read: false,
    messageType: 'text' as const,
    priority: 'urgent' as const,
    attachments: []
  },
  {
    id: 'msg_emma_2',
    patientId: 'patient_demo_3',
    patientName: 'Emma Thompson',
    senderId: 'patient_demo_3',
    senderType: 'patient' as const,
    content: 'The AI companion also detected that my symptoms spiked after I moved some storage boxes from my garage yesterday. There was a musty smell. Could this be connected?',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    messageType: 'text' as const,
    priority: 'urgent' as const,
    attachments: []
  }
];

export const demoSymptomReports = [
  // Sarah Chen Reports
  {
    id: 'report_sarah_1',
    patientId: 'patient_demo_1',
    patientName: 'Sarah Chen',
    date: new Date(Date.now() - 8 * 60 * 60 * 1000),
    symptoms: {
      itchingIntensity: 8,
      crawlingSensations: 'severe',
      newLesionsCount: 5,
      lesionType: 'papular with fiber emergence',
      fiberColors: ['white', 'blue', 'red'],
      fatigueLevel: 7,
      brainFogSeverity: 'moderate',
      sleepQuality: 'poor',
      mood: ['anxious', 'frustrated', 'determined']
    },
    factors: {
      medications: ['biofilm disruption protocol', 'low-dose naltrexone', 'vitamin D3'],
      customMedication: 'Started NAC 1200mg daily',
      dietFactors: ['anti-inflammatory diet'],
      customDiet: 'Eliminated all grains this week',
      environmentalFactors: ['high humidity', 'rainy weather'],
      customEnvironmental: 'Noticed mustiness in basement after heavy rains'
    },
    notes: 'Significant increase in symptoms correlating with weather changes. AI companion detected humidity pattern with 87% accuracy. Started feeling worse 24 hours after rain began. Fiber emergence more pronounced from arm lesions.',
    aiInsights: [
      'Pattern detected: 87% correlation between humidity >75% and symptom severity increase',
      'Environmental alert: Basement humidity levels elevated, recommend dehumidifier',
      'Treatment response: Biofilm protocol may be causing detox reaction - monitor closely',
      'Prediction: 72% likelihood of continued symptom elevation if humidity remains high',
      'Recommendation: Consider mold testing given musty odor and humidity correlation'
    ],
    reviewed: false
  },
  {
    id: 'report_sarah_2',
    patientId: 'patient_demo_1',
    patientName: 'Sarah Chen',
    date: new Date(Date.now() - 32 * 60 * 60 * 1000),
    symptoms: {
      itchingIntensity: 4,
      crawlingSensations: 'mild',
      newLesionsCount: 1,
      lesionType: 'small papular',
      fiberColors: ['white'],
      fatigueLevel: 5,
      brainFogSeverity: 'mild',
      sleepQuality: 'fair',
      mood: ['hopeful', 'stable']
    },
    factors: {
      medications: ['low-dose naltrexone', 'vitamin D3'],
      customMedication: '',
      dietFactors: ['anti-inflammatory diet'],
      customDiet: '',
      environmentalFactors: ['normal humidity'],
      customEnvironmental: 'Dry weather, used air purifier'
    },
    notes: 'Much better day overall. Symptoms manageable. Good response to current protocol.',
    aiInsights: [
      'Improvement noted: 60% reduction in symptom severity from previous week',
      'Environmental correlation: Low humidity days associated with symptom relief',
      'Medication adherence: Consistent LDN timing showing positive effects'
    ],
    reviewed: true
  },

  // Michael Rodriguez Report
  {
    id: 'report_michael_1',
    patientId: 'patient_demo_2',
    patientName: 'Michael Rodriguez',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    symptoms: {
      itchingIntensity: 5,
      crawlingSensations: 'moderate',
      newLesionsCount: 2,
      lesionType: 'papular',
      fiberColors: ['white', 'clear'],
      fatigueLevel: 6,
      brainFogSeverity: 'moderate',
      sleepQuality: 'fair',
      mood: ['frustrated', 'worried']
    },
    factors: {
      medications: ['doxycycline', 'probiotics', 'B-complex'],
      customMedication: 'Added turmeric supplement',
      dietFactors: ['low-histamine diet'],
      customDiet: '',
      environmentalFactors: ['workplace exposure'],
      customEnvironmental: 'Spent 8 hours at office with water damage'
    },
    notes: 'Joint pain increased significantly after workplace exposure. Pattern becoming clear with building exposure.',
    aiInsights: [
      'Workplace correlation: 78% increase in joint symptoms within 48 hours of office exposure',
      'Recommendation: Consider occupational medicine evaluation',
      'Pattern alert: Consistent relationship between building exposure and symptom flares',
      'Suggestion: Document workplace conditions for workers compensation evaluation'
    ],
    reviewed: false
  },

  // Emma Thompson Report (Critical)
  {
    id: 'report_emma_1',
    patientId: 'patient_demo_3',
    patientName: 'Emma Thompson',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    symptoms: {
      itchingIntensity: 10,
      crawlingSensations: 'unbearable',
      newLesionsCount: 12,
      lesionType: 'inflammatory with ulceration',
      fiberColors: ['black', 'red', 'blue', 'white'],
      fatigueLevel: 9,
      brainFogSeverity: 'severe',
      sleepQuality: 'none - unable to sleep',
      mood: ['desperate', 'hopeless', 'panicked']
    },
    factors: {
      medications: ['hydroxyzine', 'vitamin C', 'magnesium'],
      customMedication: 'Increased hydroxyzine dose',
      dietFactors: ['elimination diet'],
      customDiet: 'Unable to eat much due to nausea',
      environmentalFactors: ['mold exposure', 'stress'],
      customEnvironmental: 'Moved storage boxes from moldy garage yesterday'
    },
    notes: 'Crisis level symptoms. Cannot function. Symptoms exploded after garage exposure. Need immediate help.',
    aiInsights: [
      'CRISIS ALERT: Symptom severity at dangerous levels - immediate medical attention recommended',
      'Environmental trigger: 95% correlation with mold exposure event',
      'Mental health concern: Language patterns suggest severe psychological distress',
      'Urgent recommendation: Emergency detox protocol and crisis intervention needed',
      'Pattern recognition: Similar reactions to previous mold exposures, sensitivity increasing'
    ],
    reviewed: false
  }
];

export const demoCompanionInsights = [
  // Sarah Chen Insights
  {
    id: 'insight_sarah_1',
    patientId: 'patient_demo_1',
    patientName: 'Sarah Chen',
    date: new Date(Date.now() - 4 * 60 * 60 * 1000),
    type: 'pattern_detection' as const,
    title: 'Humidity-Symptom Correlation Confirmed',
    description: 'Advanced pattern analysis has identified a statistically significant correlation (r=0.87, p<0.001) between ambient humidity levels above 75% and symptom severity increases in this patient. The correlation appears strongest for crawling sensations and fiber emergence, with a typical 24-48 hour delay between humidity exposure and symptom onset.',
    confidence: 87,
    actionable: true,
    doctorReviewed: false,
    recommendations: [
      'Install dehumidifier in primary living spaces',
      'Monitor basement humidity levels daily',
      'Consider prophylactic antihistamine during high humidity periods',
      'Investigate potential mold growth in moisture-prone areas'
    ]
  },
  {
    id: 'insight_sarah_2',
    patientId: 'patient_demo_1',
    patientName: 'Sarah Chen',
    date: new Date(Date.now() - 12 * 60 * 60 * 1000),
    type: 'treatment_suggestion' as const,
    title: 'Biofilm Protocol Response Analysis',
    description: 'Patient appears to be experiencing a herxheimer-type reaction to the biofilm disruption protocol initiated 7 days ago. Symptom pattern is consistent with pathogen die-off rather than treatment failure. Recommend continuing protocol with enhanced detoxification support.',
    confidence: 78,
    actionable: true,
    doctorReviewed: false,
    recommendations: [
      'Increase binder supplementation (activated charcoal or bentonite clay)',
      'Add liver support (milk thistle, NAC)',
      'Ensure adequate hydration and electrolyte balance',
      'Consider temporary dose reduction if symptoms become unbearable'
    ]
  },

  // Michael Rodriguez Insights
  {
    id: 'insight_michael_1',
    patientId: 'patient_demo_2',
    patientName: 'Michael Rodriguez',
    date: new Date(Date.now() - 18 * 60 * 60 * 1000),
    type: 'pattern_detection' as const,
    title: 'Occupational Exposure Pattern Identified',
    description: 'Comprehensive analysis reveals a clear pattern of symptom exacerbation following workplace exposure. Joint pain increases by an average of 78% within 48 hours of office visits. This suggests ongoing environmental toxin exposure that may be compromising treatment progress.',
    confidence: 82,
    actionable: true,
    doctorReviewed: false,
    recommendations: [
      'Document exposure incidents for occupational medicine evaluation',
      'Consider portable air purifier for workspace',
      'Prophylactic glutathione supplementation on work days',
      'Investigate workers compensation options for toxic exposure'
    ]
  },

  // Emma Thompson Insights (Critical)
  {
    id: 'insight_emma_1',
    patientId: 'patient_demo_3',
    patientName: 'Emma Thompson',
    date: new Date(Date.now() - 30 * 60 * 1000),
    type: 'crisis_alert' as const,
    title: 'URGENT: Crisis-Level Symptom Escalation',
    description: 'Patient is experiencing severe symptom escalation following mold exposure event. Symptom severity scores have reached crisis levels (9-10/10 across multiple categories). Language analysis suggests significant psychological distress. Immediate intervention recommended.',
    confidence: 95,
    actionable: true,
    doctorReviewed: false,
    recommendations: [
      'IMMEDIATE: Contact patient within 2 hours',
      'Consider emergency telehealth consultation',
      'Assess suicide risk given language patterns',
      'Implement crisis-level detox protocol',
      'Short-term symptom management with stronger interventions'
    ]
  },
  {
    id: 'insight_emma_2',
    patientId: 'patient_demo_3',
    patientName: 'Emma Thompson',
    date: new Date(Date.now() - 6 * 60 * 60 * 1000),
    type: 'symptom_prediction' as const,
    title: 'Mold Sensitivity Escalation Predicted',
    description: 'Based on previous exposure patterns, this patient shows increasing sensitivity to mold exposures over time. Each exposure event triggers more severe and longer-lasting reactions. Without environmental intervention, continued deterioration is likely.',
    confidence: 88,
    actionable: true,
    doctorReviewed: false,
    recommendations: [
      'Comprehensive environmental assessment of living space',
      'Consider temporary relocation during remediation',
      'Implement strict mold avoidance protocols',
      'Consider CIRS (Chronic Inflammatory Response Syndrome) evaluation'
    ]
  },

  // James Wilson Insights (Stable Patient)
  {
    id: 'insight_james_1',
    patientId: 'patient_demo_4',
    patientName: 'James Wilson',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    type: 'pattern_detection' as const,
    title: 'Treatment Protocol Optimization Success',
    description: 'Long-term analysis shows excellent treatment response with current herbal antimicrobial protocol. Symptom severity has decreased by 65% over the past 6 months. Patient demonstrates good adherence and stable improvement trajectory.',
    confidence: 91,
    actionable: true,
    doctorReviewed: false,
    recommendations: [
      'Continue current protocol for another 3 months',
      'Consider gradual dose reduction trial',
      'Maintain environmental vigilance',
      'Add maintenance supplements for long-term support'
    ]
  }
];

export const demoDashboardStats = {
  totalPatients: 47,
  unreadMessages: 11,
  pendingInsights: 8,
  scheduledAppointments: 6,
  criticalPatients: 1,
  highSeverityPatients: 3,
  moderateSeverityPatients: 12,
  lowSeverityPatients: 31,
  avgCompanionTier: 4.2,
  recentActivity: {
    newPatients: 3,
    completedAppts: 12,
    reviewedInsights: 15,
    sentMessages: 23
  }
};