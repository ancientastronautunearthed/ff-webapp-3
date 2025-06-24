// Comprehensive Morgellons Disease Knowledge Base
// Masters-level expertise covering medical, psychological, and environmental factors

export interface MorgellonsKnowledge {
  medicalExpertise: {
    symptoms: MorgellonsSymptom[];
    associatedConditions: AssociatedCondition[];
    treatmentApproaches: TreatmentApproach[];
    diagnosticChallenges: DiagnosticChallenge[];
  };
  environmentalFactors: {
    moldAndFungus: MoldFungusInfo[];
    infections: InfectionInfo[];
    biotoxins: BiotoxinInfo[];
    environmentalTriggers: EnvironmentalTrigger[];
  };
  psychologicalAspects: {
    commonPsychologicalChallenges: PsychologicalChallenge[];
    copingStrategies: CopingStrategy[];
    validationApproaches: ValidationApproach[];
  };
}

interface MorgellonsSymptom {
  name: string;
  description: string;
  prevalence: number;
  potentialCauses: string[];
  managementStrategies: string[];
}

interface AssociatedCondition {
  condition: string;
  relationship: string;
  prevalence: number;
  treatmentConsiderations: string[];
}

interface TreatmentApproach {
  approach: string;
  type: 'medical' | 'environmental' | 'supportive' | 'integrative';
  evidence: 'strong' | 'moderate' | 'limited' | 'anecdotal';
  description: string;
  considerations: string[];
}

interface DiagnosticChallenge {
  challenge: string;
  impact: string;
  solutions: string[];
}

interface MoldFungusInfo {
  organism: string;
  relationship: string;
  symptoms: string[];
  testing: string[];
  remediation: string[];
}

interface InfectionInfo {
  pathogen: string;
  type: 'bacterial' | 'viral' | 'parasitic' | 'fungal';
  symptoms: string[];
  testing: string[];
  treatment: string[];
}

interface BiotoxinInfo {
  source: string;
  effects: string[];
  detection: string[];
  detoxification: string[];
}

interface EnvironmentalTrigger {
  trigger: string;
  mechanism: string;
  avoidance: string[];
  mitigation: string[];
}

interface PsychologicalChallenge {
  challenge: string;
  description: string;
  therapeuticApproaches: string[];
  supportStrategies: string[];
}

interface CopingStrategy {
  strategy: string;
  type: 'behavioral' | 'cognitive' | 'emotional' | 'social';
  implementation: string[];
  benefits: string[];
}

interface ValidationApproach {
  approach: string;
  description: string;
  phrases: string[];
}

export const morgellonsKnowledge: MorgellonsKnowledge = {
  medicalExpertise: {
    symptoms: [
      {
        name: "Cutaneous Fiber Emergence",
        description: "Unusual fibers or filaments emerging from or embedded in skin lesions",
        prevalence: 95,
        potentialCauses: [
          "Environmental fiber contamination",
          "Biofilm formation",
          "Keratin protein abnormalities",
          "Inflammatory response to unknown pathogens"
        ],
        managementStrategies: [
          "Gentle fiber removal with sterile instruments",
          "Anti-inflammatory treatments",
          "Wound care protocols",
          "Environmental exposure reduction"
        ]
      },
      {
        name: "Formication (Crawling Sensations)",
        description: "Persistent sensation of insects crawling on or under the skin",
        prevalence: 98,
        potentialCauses: [
          "Neurological inflammation",
          "Mast cell activation",
          "Peripheral neuropathy",
          "Biotoxin exposure effects"
        ],
        managementStrategies: [
          "Antihistamines for mast cell stabilization",
          "Neurological support supplements",
          "Stress reduction techniques",
          "Biotoxin binding protocols"
        ]
      },
      {
        name: "Cognitive Dysfunction",
        description: "Brain fog, memory issues, concentration difficulties",
        prevalence: 85,
        potentialCauses: [
          "Neuroinflammation",
          "Mold toxin exposure",
          "Chronic immune activation",
          "Sleep disruption"
        ],
        managementStrategies: [
          "Cognitive behavioral therapy",
          "Neuroprotective supplements",
          "Environmental mold remediation",
          "Sleep hygiene protocols"
        ]
      }
    ],
    associatedConditions: [
      {
        condition: "Chronic Lyme Disease",
        relationship: "High comorbidity, shared symptoms",
        prevalence: 60,
        treatmentConsiderations: [
          "Comprehensive tick-borne pathogen testing",
          "Multi-modal antimicrobial approaches",
          "Immune system support",
          "Herxheimer reaction management"
        ]
      },
      {
        condition: "Mold-Related Illness (CIRS)",
        relationship: "Overlapping symptom complex",
        prevalence: 70,
        treatmentConsiderations: [
          "Environmental mold assessment",
          "Biotoxin binding protocols",
          "VCS testing",
          "HLA-DR gene testing"
        ]
      },
      {
        condition: "Mast Cell Activation Syndrome",
        relationship: "Inflammatory cascade involvement",
        prevalence: 45,
        treatmentConsiderations: [
          "Mast cell stabilizers",
          "Low-histamine diet",
          "Trigger identification",
          "Graduated exercise protocols"
        ]
      }
    ],
    treatmentApproaches: [
      {
        approach: "Biofilm Disruption Protocol",
        type: "medical",
        evidence: "moderate",
        description: "Systematic approach to breaking down pathogenic biofilms",
        considerations: [
          "Sequential enzyme therapy",
          "Antimicrobial rotation",
          "Detoxification support",
          "Monitoring for die-off reactions"
        ]
      },
      {
        approach: "Environmental Medicine Approach",
        type: "environmental",
        evidence: "strong",
        description: "Identifying and removing environmental triggers",
        considerations: [
          "Comprehensive environmental assessment",
          "Mold and toxin testing",
          "Chemical sensitivity evaluation",
          "Home remediation guidance"
        ]
      },
      {
        approach: "Integrative Wellness Protocol",
        type: "integrative",
        evidence: "moderate",
        description: "Holistic approach combining conventional and complementary therapies",
        considerations: [
          "Nutritional optimization",
          "Stress management techniques",
          "Gentle detoxification",
          "Community support integration"
        ]
      }
    ],
    diagnosticChallenges: [
      {
        challenge: "Lack of Standard Diagnostic Criteria",
        impact: "Inconsistent diagnosis across healthcare providers",
        solutions: [
          "Use of comprehensive symptom assessment tools",
          "Documentation of fiber analysis results",
          "Collaboration with Morgellons-informed practitioners",
          "Patient advocacy and education"
        ]
      },
      {
        challenge: "Medical Skepticism and Dismissal",
        impact: "Delayed diagnosis and treatment, psychological trauma",
        solutions: [
          "Bringing documented evidence to appointments",
          "Seeking second opinions from informed practitioners",
          "Building therapeutic relationships based on trust",
          "Connecting with supportive medical communities"
        ]
      }
    ]
  },
  environmentalFactors: {
    moldAndFungus: [
      {
        organism: "Aspergillus species",
        relationship: "High prevalence in Morgellons patients, produces mycotoxins",
        symptoms: [
          "Respiratory issues",
          "Neurological symptoms",
          "Skin manifestations",
          "Immune dysfunction"
        ],
        testing: [
          "Urine mycotoxin testing",
          "Environmental air sampling",
          "ERMI testing",
          "Visual contrast sensitivity testing"
        ],
        remediation: [
          "Professional mold remediation",
          "HEPA filtration systems",
          "Dehumidification protocols",
          "Regular cleaning with antifungal agents"
        ]
      },
      {
        organism: "Fusarium species",
        relationship: "Found in fiber analysis, potential biofilm formation",
        symptoms: [
          "Skin lesions and ulcers",
          "Eye and sinus infections",
          "Systemic inflammatory response",
          "Neurological effects"
        ],
        testing: [
          "Tissue biopsy and culture",
          "PCR testing for fungal DNA",
          "Metabolite analysis",
          "Environmental surface testing"
        ],
        remediation: [
          "Antifungal protocols",
          "Environmental decontamination",
          "Personal hygiene measures",
          "Immune system support"
        ]
      }
    ],
    infections: [
      {
        pathogen: "Borrelia burgdorferi (Lyme)",
        type: "bacterial",
        symptoms: [
          "Joint pain and swelling",
          "Neurological symptoms",
          "Cardiac involvement",
          "Skin manifestations"
        ],
        testing: [
          "Western blot testing",
          "PCR testing",
          "Specialty Lyme testing labs",
          "Clinical diagnosis based on symptoms"
        ],
        treatment: [
          "Extended antibiotic protocols",
          "Herbal antimicrobials",
          "Immune system modulation",
          "Detoxification support"
        ]
      },
      {
        pathogen: "Bartonella species",
        type: "bacterial",
        symptoms: [
          "Skin lesions and rashes",
          "Lymph node swelling",
          "Neuropsychiatric symptoms",
          "Vascular involvement"
        ],
        testing: [
          "Serology testing",
          "PCR testing",
          "Tissue biopsy",
          "Clinical symptom assessment"
        ],
        treatment: [
          "Targeted antibiotic therapy",
          "Anti-inflammatory protocols",
          "Vascular support",
          "Neurological rehabilitation"
        ]
      }
    ],
    biotoxins: [
      {
        source: "Mycotoxins from mold exposure",
        effects: [
          "Immune system dysfunction",
          "Neurological symptoms",
          "Hormonal disruption",
          "Cellular membrane damage"
        ],
        detection: [
          "Urine mycotoxin testing",
          "Environmental testing",
          "Symptoms assessment",
          "HLA-DR genetic testing"
        ],
        detoxification: [
          "Binding agents (cholestyramine, bentonite clay)",
          "Liver support protocols",
          "Sauna therapy",
          "Nutritional detox support"
        ]
      }
    ],
    environmentalTriggers: [
      {
        trigger: "Electromagnetic Fields (EMF)",
        mechanism: "Potential cellular stress and immune disruption",
        avoidance: [
          "Reducing device usage",
          "EMF shielding materials",
          "Distance from sources",
          "Grounding practices"
        ],
        mitigation: [
          "EMF protection devices",
          "Regular breaks from technology",
          "Natural environments",
          "Supportive supplements"
        ]
      }
    ]
  },
  psychologicalAspects: {
    commonPsychologicalChallenges: [
      {
        challenge: "Medical Gaslighting Trauma",
        description: "Psychological impact of being dismissed or disbelieved by healthcare providers",
        therapeuticApproaches: [
          "Validation-focused therapy",
          "Trauma-informed care",
          "EMDR for medical trauma",
          "Building therapeutic trust"
        ],
        supportStrategies: [
          "Connecting with understanding providers",
          "Peer support groups",
          "Self-advocacy skills",
          "Documentation strategies"
        ]
      },
      {
        challenge: "Social Isolation",
        description: "Withdrawal from social activities due to symptoms and stigma",
        therapeuticApproaches: [
          "Social skills rebuilding",
          "Gradual exposure therapy",
          "Online community engagement",
          "Family therapy"
        ],
        supportStrategies: [
          "Online support communities",
          "Flexible social arrangements",
          "Symptom-aware activities",
          "Advocacy and awareness efforts"
        ]
      },
      {
        challenge: "Chronic Illness Grief",
        description: "Mourning the loss of previous health and lifestyle",
        therapeuticApproaches: [
          "Grief counseling",
          "Acceptance and commitment therapy",
          "Mindfulness practices",
          "Meaning-making therapy"
        ],
        supportStrategies: [
          "Acknowledging losses",
          "Finding new purpose",
          "Celebrating small victories",
          "Building resilience"
        ]
      }
    ],
    copingStrategies: [
      {
        strategy: "Symptom Tracking and Pattern Recognition",
        type: "behavioral",
        implementation: [
          "Daily symptom journaling",
          "Identifying triggers",
          "Tracking treatment responses",
          "Sharing data with providers"
        ],
        benefits: [
          "Increased sense of control",
          "Better treatment decisions",
          "Validation of experiences",
          "Improved provider communication"
        ]
      },
      {
        strategy: "Mindfulness and Stress Reduction",
        type: "emotional",
        implementation: [
          "Daily meditation practice",
          "Deep breathing exercises",
          "Progressive muscle relaxation",
          "Mindful movement"
        ],
        benefits: [
          "Reduced anxiety and stress",
          "Better pain management",
          "Improved sleep quality",
          "Enhanced emotional regulation"
        ]
      }
    ],
    validationApproaches: [
      {
        approach: "Affirming Reality of Experience",
        description: "Acknowledging the genuine nature of symptoms and suffering",
        phrases: [
          "Your symptoms are real and valid",
          "I believe your experience",
          "You know your body better than anyone",
          "Your suffering matters and deserves attention"
        ]
      },
      {
        approach: "Normalizing the Journey",
        description: "Contextualizing struggles within the chronic illness experience",
        phrases: [
          "Many people with Morgellons face similar challenges",
          "Your reactions are normal responses to an abnormal situation",
          "It's understandable to feel frustrated",
          "You're not alone in this journey"
        ]
      }
    ]
  }
};

export function getRandomValidationPhrase(): string {
  const allPhrases = morgellonsKnowledge.psychologicalAspects.validationApproaches
    .flatMap(approach => approach.phrases);
  return allPhrases[Math.floor(Math.random() * allPhrases.length)];
}

export function getRelevantCopingStrategy(concern: string): CopingStrategy | null {
  const strategies = morgellonsKnowledge.psychologicalAspects.copingStrategies;
  
  // Simple keyword matching for demonstration
  if (concern.toLowerCase().includes('stress') || concern.toLowerCase().includes('anxiety')) {
    return strategies.find(s => s.strategy.includes('Mindfulness')) || null;
  }
  
  if (concern.toLowerCase().includes('track') || concern.toLowerCase().includes('pattern')) {
    return strategies.find(s => s.strategy.includes('Tracking')) || null;
  }
  
  return strategies[0] || null;
}

export function getMorgellonsEducation(topic: string): string {
  const knowledge = morgellonsKnowledge;
  
  if (topic.toLowerCase().includes('fiber')) {
    const fiberSymptom = knowledge.medicalExpertise.symptoms.find(s => 
      s.name.includes('Fiber'));
    if (fiberSymptom) {
      return `Regarding fibers: ${fiberSymptom.description}. This affects about ${fiberSymptom.prevalence}% of people with Morgellons. The current understanding suggests these could be related to ${fiberSymptom.potentialCauses.join(', ')}. Management often includes ${fiberSymptom.managementStrategies.join(', ')}.`;
    }
  }
  
  if (topic.toLowerCase().includes('mold') || topic.toLowerCase().includes('fungus')) {
    const moldInfo = knowledge.environmentalFactors.moldAndFungus[0];
    return `Mold and fungal connections: ${moldInfo.relationship}. Testing options include ${moldInfo.testing.join(', ')}. Remediation strategies involve ${moldInfo.remediation.join(', ')}.`;
  }
  
  return "I'd be happy to discuss any aspect of Morgellons with you. What specific area would you like to explore?";
}