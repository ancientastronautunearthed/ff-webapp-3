import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY || '' });

export interface RelationshipProfile {
  id: string;
  characterId: string;
  relationshipType: 'romantic' | 'friendship' | 'family' | 'professional' | 'mentor' | 'rival';
  intimacyLevel: number; // 0-100
  trustLevel: number; // 0-100
  conflictHistory: ConflictEvent[];
  sharedMemories: SharedMemory[];
  communicationStyle: 'direct' | 'diplomatic' | 'emotional' | 'analytical' | 'humorous';
  emotionalNeeds: string[];
  personalityCompatibility: number; // 0-100
  growthTogether: RelationshipGrowth[];
  adaptiveTraits: AdaptiveRelationshipTrait[];
  lastInteraction: Date;
  relationshipDynamics: RelationshipDynamic[];
}

export interface ConflictEvent {
  id: string;
  date: Date;
  type: 'misunderstanding' | 'value_clash' | 'jealousy' | 'work_stress' | 'external_pressure';
  severity: number; // 1-10
  resolution: 'resolved' | 'ongoing' | 'escalated' | 'avoided';
  impact: number; // -50 to +20 (negative for damage, positive for growth)
  lessons_learned: string[];
  relationshipChange: string;
}

export interface SharedMemory {
  id: string;
  date: Date;
  type: 'milestone' | 'adventure' | 'crisis_support' | 'celebration' | 'discovery' | 'intimacy';
  description: string;
  emotionalWeight: number; // 1-100
  characterPerspective: string;
  partnerPerspective: string;
  bondingEffect: number; // 0-50
  significanceLevel: 'minor' | 'moderate' | 'major' | 'life_changing';
}

export interface RelationshipGrowth {
  phase: 'initial' | 'developing' | 'deepening' | 'challenging' | 'mature' | 'transforming';
  startDate: Date;
  keyEvents: string[];
  personalChanges: string[];
  partnerChanges: string[];
  newDynamics: string[];
  challengesOvercome: string[];
  futureGoals: string[];
}

export interface AdaptiveRelationshipTrait {
  trait: string;
  strength: number; // 0-100
  development: 'emerging' | 'developing' | 'established' | 'evolving';
  triggers: string[];
  manifestations: string[];
  impactOnRelationship: string;
  adaptationHistory: TraitAdaptation[];
}

export interface TraitAdaptation {
  date: Date;
  situation: string;
  adaptation: string;
  outcome: string;
  strengthChange: number;
}

export interface RelationshipDynamic {
  type: 'power_balance' | 'emotional_support' | 'intellectual_stimulation' | 'physical_affection' | 'shared_goals';
  currentLevel: number; // 0-100
  trend: 'improving' | 'stable' | 'declining' | 'fluctuating';
  factors: string[];
  adaptiveResponses: string[];
}

export interface CareerProfile {
  id: string;
  characterId: string;
  currentPosition: string;
  industry: string;
  skillSet: CareerSkill[];
  careerGoals: CareerGoal[];
  networkConnections: ProfessionalConnection[];
  adaptiveStrategies: CareerStrategy[];
  marketAdaptation: MarketAdaptation[];
  leadershipStyle: 'collaborative' | 'directive' | 'coaching' | 'delegating' | 'adaptive';
  workPersonality: WorkPersonality;
  careerPhase: 'exploration' | 'establishment' | 'advancement' | 'maintenance' | 'transition' | 'legacy';
  aiCollaborationLevel: number; // 0-100, how well they work with AI systems
  futureProofingScore: number; // 0-100, adaptation to 2035 job market
}

export interface CareerSkill {
  name: string;
  level: number; // 0-100
  category: 'technical' | 'soft' | 'leadership' | 'creative' | 'analytical' | 'ai_collaboration';
  relevanceToFuture: number; // 0-100
  developmentPlan: SkillDevelopment[];
  adaptiveApplication: string[];
}

export interface SkillDevelopment {
  phase: string;
  timeline: string;
  methods: string[];
  milestones: string[];
  adaptiveAdjustments: string[];
}

export interface CareerGoal {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeline: string;
  progress: number; // 0-100
  adaptiveSteps: AdaptiveCareerStep[];
  obstacles: CareerObstacle[];
  opportunityMap: Opportunity[];
  personalMotivation: string;
  impactOnLife: string;
}

export interface AdaptiveCareerStep {
  step: string;
  adaptationTriggers: string[];
  alternativeApproaches: string[];
  successMetrics: string[];
  pivotOptions: string[];
}

export interface CareerObstacle {
  type: 'skill_gap' | 'market_change' | 'competition' | 'personal_constraint' | 'economic_factor';
  description: string;
  impact: number; // 1-10
  adaptiveResponse: string;
  mitigationStrategy: string;
  learningOpportunity: string;
}

export interface Opportunity {
  type: 'promotion' | 'new_field' | 'entrepreneurship' | 'collaboration' | 'innovation' | 'leadership';
  description: string;
  probability: number; // 0-100
  requirements: string[];
  adaptivePreparation: string[];
  riskAssessment: string;
  potentialReward: string;
}

export interface ProfessionalConnection {
  id: string;
  name: string;
  relationship: 'mentor' | 'peer' | 'subordinate' | 'client' | 'partner' | 'competitor';
  influence: number; // 0-100
  mutualBenefit: number; // 0-100
  collaborationHistory: Collaboration[];
  networkValue: number; // 0-100
  adaptiveRole: string;
}

export interface Collaboration {
  project: string;
  duration: string;
  outcome: 'successful' | 'challenging' | 'failed' | 'transformative';
  learnings: string[];
  relationshipImpact: number;
  futureOpportunities: string[];
}

export interface WorkPersonality {
  workStyle: 'independent' | 'collaborative' | 'structured' | 'flexible' | 'innovative';
  motivators: string[];
  stressors: string[];
  adaptabilityScore: number; // 0-100
  leadershipPotential: number; // 0-100
  teamDynamics: string[];
  decisionMakingStyle: 'analytical' | 'intuitive' | 'consensus' | 'quick' | 'deliberate';
}

export interface MarketAdaptation {
  marketChange: string;
  adaptationStrategy: string;
  implementation: string;
  success: number; // 0-100
  lessons: string[];
  futurePreparation: string[];
}

export class AdaptiveRelationshipEngine {
  static async analyzeRelationshipDynamics(
    relationship: RelationshipProfile,
    recentInteractions: any[],
    personalityTraits: string[]
  ): Promise<{
    adaptiveInsights: string[];
    recommendedActions: string[];
    relationshipPrediction: string;
    growthOpportunities: string[];
    warningSignals: string[];
  }> {
    try {
      const prompt = `
Analyze this relationship profile and provide adaptive insights for 2035:

Relationship Details:
- Type: ${relationship.relationshipType}
- Intimacy Level: ${relationship.intimacyLevel}/100
- Trust Level: ${relationship.trustLevel}/100
- Communication Style: ${relationship.communicationStyle}
- Compatibility: ${relationship.personalityCompatibility}/100

Recent Interactions: ${recentInteractions.length} interactions
Character Traits: ${personalityTraits.join(', ')}

Conflict History: ${relationship.conflictHistory.length} conflicts
Shared Memories: ${relationship.sharedMemories.length} significant memories
Growth Phases: ${relationship.growthTogether.length} phases

Provide analysis on:
1. Adaptive insights about relationship evolution
2. Recommended actions for deepening connection
3. Prediction of relationship trajectory
4. Growth opportunities based on patterns
5. Warning signals to watch for

Focus on how relationships adapt in 2035's AI-integrated society.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              adaptiveInsights: { type: "array", items: { type: "string" } },
              recommendedActions: { type: "array", items: { type: "string" } },
              relationshipPrediction: { type: "string" },
              growthOpportunities: { type: "array", items: { type: "string" } },
              warningSignals: { type: "array", items: { type: "string" } }
            }
          }
        },
        contents: prompt
      });

      return JSON.parse(response.text || '{}');

    } catch (error) {
      console.error('Relationship analysis failed:', error);
      return this.generateFallbackRelationshipAnalysis(relationship);
    }
  }

  static async adaptRelationshipToEvent(
    relationship: RelationshipProfile,
    event: any,
    characterPersonality: string[]
  ): Promise<RelationshipProfile> {
    try {
      const prompt = `
Adapt this relationship based on a significant event:

Current Relationship:
- Trust: ${relationship.trustLevel}/100
- Intimacy: ${relationship.intimacyLevel}/100
- Phase: ${relationship.growthTogether[relationship.growthTogether.length - 1]?.phase || 'initial'}

Event: ${event.type} - ${event.description}
Character Personality: ${characterPersonality.join(', ')}

How should this relationship adapt? Consider:
1. Trust level changes (-20 to +20)
2. Intimacy level changes (-20 to +20)
3. New adaptive traits developed
4. Communication style evolution
5. Future relationship dynamics

Return detailed adaptation plan.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              trustChange: { type: "number" },
              intimacyChange: { type: "number" },
              newTraits: { type: "array", items: { type: "string" } },
              communicationEvolution: { type: "string" },
              newDynamics: { type: "array", items: { type: "string" } }
            }
          }
        },
        contents: prompt
      });

      const adaptation = JSON.parse(response.text || '{}');
      
      // Apply adaptations
      const updatedRelationship = { ...relationship };
      updatedRelationship.trustLevel = Math.max(0, Math.min(100, updatedRelationship.trustLevel + (adaptation.trustChange || 0)));
      updatedRelationship.intimacyLevel = Math.max(0, Math.min(100, updatedRelationship.intimacyLevel + (adaptation.intimacyChange || 0)));
      
      // Add new adaptive traits
      if (adaptation.newTraits) {
        adaptation.newTraits.forEach((trait: string) => {
          updatedRelationship.adaptiveTraits.push({
            trait,
            strength: 25,
            development: 'emerging',
            triggers: [event.type],
            manifestations: [`Developed through ${event.description}`],
            impactOnRelationship: `Emerging trait influencing relationship dynamics`,
            adaptationHistory: [{
              date: new Date(),
              situation: event.description,
              adaptation: `Developed ${trait} trait`,
              outcome: 'Positive growth',
              strengthChange: 25
            }]
          });
        });
      }

      // Update communication style if evolved
      if (adaptation.communicationEvolution) {
        updatedRelationship.communicationStyle = adaptation.communicationEvolution as any;
      }

      // Add new dynamics
      if (adaptation.newDynamics) {
        adaptation.newDynamics.forEach((dynamic: string) => {
          updatedRelationship.relationshipDynamics.push({
            type: 'emotional_support' as any,
            currentLevel: 60,
            trend: 'improving',
            factors: [dynamic],
            adaptiveResponses: [`Responding to ${event.description}`]
          });
        });
      }

      return updatedRelationship;

    } catch (error) {
      console.error('Relationship adaptation failed:', error);
      return relationship;
    }
  }

  private static generateFallbackRelationshipAnalysis(relationship: RelationshipProfile) {
    return {
      adaptiveInsights: [
        `Relationship showing ${relationship.trustLevel > 70 ? 'strong' : 'developing'} trust patterns`,
        `Communication style (${relationship.communicationStyle}) matches current phase`,
        `${relationship.conflictHistory.length} conflicts provide growth opportunities`
      ],
      recommendedActions: [
        'Schedule regular check-ins to maintain connection',
        'Explore shared interests and new experiences together',
        'Practice active listening and empathy'
      ],
      relationshipPrediction: `Trajectory suggests ${relationship.trustLevel > 60 ? 'positive' : 'cautious'} development`,
      growthOpportunities: [
        'Deepen emotional intimacy through vulnerability',
        'Develop shared goals and future planning',
        'Strengthen conflict resolution skills'
      ],
      warningSignals: [
        'Decreased frequency of meaningful conversations',
        'Avoidance of difficult topics',
        'Reduced emotional support exchange'
      ]
    };
  }
}

export class AdaptiveCareerEngine {
  static async analyzeCareerTrajectory(
    career: CareerProfile,
    recentPerformance: any[],
    marketTrends: string[]
  ): Promise<{
    careerInsights: string[];
    adaptiveStrategies: string[];
    skillGapAnalysis: string[];
    opportunityMapping: string[];
    futureProofingPlan: string[];
  }> {
    try {
      const prompt = `
Analyze this career profile for 2035 adaptive strategies:

Career Details:
- Position: ${career.currentPosition}
- Industry: ${career.industry}
- Phase: ${career.careerPhase}
- AI Collaboration Level: ${career.aiCollaborationLevel}/100
- Future Proofing Score: ${career.futureProofingScore}/100

Skills: ${career.skillSet.map(s => `${s.name} (${s.level}/100)`).join(', ')}
Goals: ${career.careerGoals.map(g => g.title).join(', ')}
Network Size: ${career.networkConnections.length} connections

Market Trends: ${marketTrends.join(', ')}
Recent Performance: ${recentPerformance.length} data points

Provide analysis on:
1. Career insights and trajectory analysis
2. Adaptive strategies for market changes
3. Skill gap analysis for 2035 demands
4. Opportunity mapping based on trends
5. Future-proofing plan for AI integration

Focus on adaptability in the evolving 2035 job market.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              careerInsights: { type: "array", items: { type: "string" } },
              adaptiveStrategies: { type: "array", items: { type: "string" } },
              skillGapAnalysis: { type: "array", items: { type: "string" } },
              opportunityMapping: { type: "array", items: { type: "string" } },
              futureProofingPlan: { type: "array", items: { type: "string" } }
            }
          }
        },
        contents: prompt
      });

      return JSON.parse(response.text || '{}');

    } catch (error) {
      console.error('Career analysis failed:', error);
      return this.generateFallbackCareerAnalysis(career);
    }
  }

  static async adaptCareerToMarketChange(
    career: CareerProfile,
    marketChange: any,
    personalStrengths: string[]
  ): Promise<CareerProfile> {
    try {
      const prompt = `
Adapt this career profile to a market change:

Current Career:
- Position: ${career.currentPosition}
- Key Skills: ${career.skillSet.slice(0, 5).map(s => s.name).join(', ')}
- AI Collaboration: ${career.aiCollaborationLevel}/100
- Adaptability: ${career.workPersonality.adaptabilityScore}/100

Market Change: ${marketChange.type} - ${marketChange.description}
Personal Strengths: ${personalStrengths.join(', ')}

How should this career adapt? Consider:
1. Skill priority shifts (which skills become more/less important)
2. New skill development needs
3. Role evolution possibilities
4. Network adaptation strategies
5. AI collaboration enhancement

Return detailed adaptation strategy.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              skillPriorityShifts: { type: "object" },
              newSkillsNeeded: { type: "array", items: { type: "string" } },
              roleEvolution: { type: "string" },
              networkStrategy: { type: "string" },
              aiCollaborationBoost: { type: "number" }
            }
          }
        },
        contents: prompt
      });

      const adaptation = JSON.parse(response.text || '{}');
      const updatedCareer = { ...career };

      // Adapt skill priorities
      if (adaptation.skillPriorityShifts) {
        updatedCareer.skillSet.forEach(skill => {
          if (adaptation.skillPriorityShifts[skill.name]) {
            skill.relevanceToFuture = Math.max(0, Math.min(100, 
              skill.relevanceToFuture + adaptation.skillPriorityShifts[skill.name]
            ));
          }
        });
      }

      // Add new skills
      if (adaptation.newSkillsNeeded) {
        adaptation.newSkillsNeeded.forEach((skillName: string) => {
          updatedCareer.skillSet.push({
            name: skillName,
            level: 10,
            category: 'technical',
            relevanceToFuture: 90,
            developmentPlan: [{
              phase: 'Initial Learning',
              timeline: '3-6 months',
              methods: ['Online courses', 'Practice projects', 'Mentorship'],
              milestones: ['Basic proficiency', 'First project completion'],
              adaptiveAdjustments: ['Adjust based on market feedback']
            }],
            adaptiveApplication: [`Developed in response to ${marketChange.description}`]
          });
        });
      }

      // Boost AI collaboration level
      if (adaptation.aiCollaborationBoost) {
        updatedCareer.aiCollaborationLevel = Math.max(0, Math.min(100, 
          updatedCareer.aiCollaborationLevel + adaptation.aiCollaborationBoost
        ));
      }

      // Add market adaptation record
      updatedCareer.marketAdaptation.push({
        marketChange: marketChange.description,
        adaptationStrategy: adaptation.roleEvolution || 'Strategic adaptation',
        implementation: 'In progress',
        success: 70,
        lessons: ['Market changes require continuous adaptation'],
        futurePreparation: ['Monitor emerging trends', 'Develop adaptive skills']
      });

      return updatedCareer;

    } catch (error) {
      console.error('Career adaptation failed:', error);
      return career;
    }
  }

  private static generateFallbackCareerAnalysis(career: CareerProfile) {
    return {
      careerInsights: [
        `Currently in ${career.careerPhase} phase with strong foundation`,
        `AI collaboration level (${career.aiCollaborationLevel}/100) shows adaptation potential`,
        `Network of ${career.networkConnections.length} connections provides opportunities`
      ],
      adaptiveStrategies: [
        'Continuous learning and skill development',
        'Building strategic professional relationships',
        'Embracing AI collaboration tools'
      ],
      skillGapAnalysis: [
        'Digital literacy and AI interface skills',
        'Cross-functional collaboration abilities',
        'Adaptive problem-solving techniques'
      ],
      opportunityMapping: [
        'Leadership roles in AI-human teams',
        'Specialization in emerging technologies',
        'Mentoring and knowledge transfer roles'
      ],
      futureProofingPlan: [
        'Develop meta-skills like learning how to learn',
        'Build emotional intelligence for human-AI collaboration',
        'Create portfolio of diverse, transferable skills'
      ]
    };
  }
}