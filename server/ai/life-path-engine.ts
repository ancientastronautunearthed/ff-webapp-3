import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY || '' });

export interface LifePathNode {
  id: string;
  timestamp: Date;
  type: 'decision' | 'milestone' | 'turning_point' | 'achievement' | 'crisis' | 'opportunity';
  title: string;
  description: string;
  choicesMade: PathChoice[];
  alternativePaths: AlternativePath[];
  impact: PathImpact;
  coordinates: { x: number; y: number };
  connections: string[]; // IDs of connected nodes
  lifePhase: 'childhood' | 'adolescence' | 'young_adult' | 'adult' | 'middle_age' | 'senior';
  significanceLevel: number; // 1-10
  emotionalWeight: number; // 1-100
  futureImplications: string[];
}

export interface PathChoice {
  id: string;
  description: string;
  chosenAt: Date;
  reasoning: string;
  confidence: number; // 1-100
  personalityAlignment: string[];
  consequences: ChoiceConsequence[];
  alternativesNotTaken: string[];
  pathBranching: BranchingOutcome;
}

export interface AlternativePath {
  id: string;
  description: string;
  probabilityIfChosen: number; // 0-100
  projectedOutcome: string;
  timelineShift: string;
  lifeAspectChanges: {
    career: number; // -100 to +100
    relationships: number;
    health: number;
    happiness: number;
    financial: number;
    personal_growth: number;
  };
  visualRepresentation: {
    color: string;
    thickness: number;
    style: 'solid' | 'dashed' | 'dotted';
  };
}

export interface ChoiceConsequence {
  category: 'immediate' | 'short_term' | 'long_term' | 'lifelong';
  aspect: 'career' | 'relationships' | 'health' | 'finances' | 'personal_growth' | 'location' | 'lifestyle';
  change: number; // -100 to +100
  description: string;
  manifestedAt?: Date;
  stillEvolving: boolean;
}

export interface BranchingOutcome {
  newPathsOpened: string[];
  pathsClosed: string[];
  probabilityShifts: { [pathId: string]: number };
  characterTraitChanges: { [trait: string]: number };
  worldStateChanges: { [aspect: string]: number };
}

export interface PathImpact {
  magnitude: number; // 1-100
  scope: 'personal' | 'family' | 'community' | 'professional' | 'global';
  reversibility: 'irreversible' | 'difficult' | 'moderate' | 'easy';
  rippleEffects: RippleEffect[];
  adaptiveOpportunities: string[];
}

export interface RippleEffect {
  affectedAspect: string;
  impactDescription: string;
  timeDelay: string;
  probability: number; // 0-100
}

export interface LifePathVisualization {
  nodes: LifePathNode[];
  connections: PathConnection[];
  alternativeTimelines: AlternativeTimeline[];
  currentPath: string[]; // Array of node IDs
  pathMetrics: PathMetrics;
  futureProjections: FutureProjection[];
  choicePatterns: ChoicePattern[];
}

export interface PathConnection {
  from: string;
  to: string;
  type: 'direct' | 'influenced_by' | 'alternative_to' | 'parallel';
  strength: number; // 1-100
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
  label?: string;
}

export interface AlternativeTimeline {
  id: string;
  title: string;
  description: string;
  branchingPoint: string; // Node ID where this timeline diverged
  keyDifferences: string[];
  currentPosition: string;
  probabilityOfOccurrence: number; // 0-100
  visualStyle: {
    opacity: number;
    color: string;
    animation: 'pulse' | 'fade' | 'none';
  };
}

export interface PathMetrics {
  totalNodes: number;
  majorDecisions: number;
  turningPoints: number;
  pathComplexity: number; // 1-100
  adaptabilityScore: number; // 1-100
  coherenceScore: number; // 1-100 (how well choices align)
  growthRate: number; // rate of personal development
  riskTolerance: number; // derived from choices
  patternConsistency: number; // how consistent choice patterns are
}

export interface FutureProjection {
  timeframe: '6_months' | '1_year' | '5_years' | '10_years';
  scenario: 'optimistic' | 'realistic' | 'pessimistic';
  keyPredictions: Prediction[];
  influencingFactors: string[];
  adaptiveRecommendations: string[];
  probabilityMaps: { [outcome: string]: number };
}

export interface Prediction {
  aspect: string;
  prediction: string;
  confidence: number; // 0-100
  requiredActions: string[];
  warningSignals: string[];
}

export interface ChoicePattern {
  pattern: string;
  frequency: number;
  contexts: string[];
  outcomes: string[];
  adaptiveValue: number; // -100 to +100
  recommendation: string;
}

export class LifePathEngine {
  static async generateLifePathVisualization(
    characterHistory: any[],
    currentState: any,
    personalityTraits: string[]
  ): Promise<LifePathVisualization> {
    try {
      const prompt = `
Create a comprehensive life path visualization for a character in 2035:

Character History: ${characterHistory.length} significant events
Current State: Age ${currentState.age}, Phase: ${currentState.lifePhase}
Personality: ${personalityTraits.join(', ')}

Key Events:
${characterHistory.slice(0, 10).map(event => `- ${event.type}: ${event.description}`).join('\n')}

Generate:
1. Life path nodes with decision points and milestones
2. Alternative paths that could have been taken
3. Future projections based on current trajectory
4. Choice patterns and their adaptive value
5. Visual coordinates for path mapping

Focus on how choices in 2035's AI-integrated world create branching life paths.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              nodes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    type: { type: "string" },
                    description: { type: "string" },
                    coordinates: {
                      type: "object",
                      properties: {
                        x: { type: "number" },
                        y: { type: "number" }
                      }
                    }
                  }
                }
              },
              pathMetrics: {
                type: "object",
                properties: {
                  adaptabilityScore: { type: "number" },
                  coherenceScore: { type: "number" },
                  pathComplexity: { type: "number" }
                }
              },
              futureProjections: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    timeframe: { type: "string" },
                    scenario: { type: "string" },
                    keyPredictions: { type: "array", items: { type: "string" } }
                  }
                }
              }
            }
          }
        },
        contents: prompt
      });

      const aiData = JSON.parse(response.text || '{}');
      
      // Build comprehensive visualization
      const visualization: LifePathVisualization = {
        nodes: this.buildLifePathNodes(characterHistory, currentState, aiData.nodes),
        connections: this.generatePathConnections(characterHistory),
        alternativeTimelines: this.generateAlternativeTimelines(characterHistory),
        currentPath: characterHistory.map(event => event.id || `event_${event.timestamp}`),
        pathMetrics: {
          totalNodes: characterHistory.length,
          majorDecisions: characterHistory.filter(e => e.type === 'decision').length,
          turningPoints: characterHistory.filter(e => e.significance > 7).length,
          pathComplexity: aiData.pathMetrics?.pathComplexity || this.calculatePathComplexity(characterHistory),
          adaptabilityScore: aiData.pathMetrics?.adaptabilityScore || this.calculateAdaptabilityScore(characterHistory),
          coherenceScore: aiData.pathMetrics?.coherenceScore || this.calculateCoherenceScore(characterHistory, personalityTraits),
          growthRate: this.calculateGrowthRate(characterHistory),
          riskTolerance: this.calculateRiskTolerance(characterHistory),
          patternConsistency: this.calculatePatternConsistency(characterHistory)
        },
        futureProjections: this.generateFutureProjections(characterHistory, currentState, aiData.futureProjections),
        choicePatterns: this.analyzeChoicePatterns(characterHistory)
      };

      return visualization;

    } catch (error) {
      console.error('Life path visualization generation failed:', error);
      return this.generateFallbackVisualization(characterHistory, currentState);
    }
  }

  static async adaptPathToNewChoice(
    currentVisualization: LifePathVisualization,
    newChoice: any,
    choiceContext: any
  ): Promise<{
    updatedVisualization: LifePathVisualization;
    pathChanges: PathChange[];
    newOpportunities: string[];
    closedPaths: string[];
  }> {
    try {
      const prompt = `
Adapt this life path based on a new choice:

Current Path Metrics:
- Adaptability: ${currentVisualization.pathMetrics.adaptabilityScore}/100
- Coherence: ${currentVisualization.pathMetrics.coherenceScore}/100
- Complexity: ${currentVisualization.pathMetrics.pathComplexity}/100

New Choice: ${newChoice.type} - ${newChoice.description}
Context: ${choiceContext.situation || 'General life decision'}

Analyze how this choice:
1. Creates new path branches
2. Closes previous opportunities
3. Shifts future projections
4. Changes character trajectory
5. Opens adaptive opportunities

Provide detailed path adaptation analysis.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              pathChanges: { type: "array", items: { type: "string" } },
              newOpportunities: { type: "array", items: { type: "string" } },
              closedPaths: { type: "array", items: { type: "string" } },
              adaptabilityChange: { type: "number" },
              coherenceChange: { type: "number" }
            }
          }
        },
        contents: prompt
      });

      const adaptation = JSON.parse(response.text || '{}');

      // Create new node for this choice
      const newNode: LifePathNode = {
        id: `choice_${Date.now()}`,
        timestamp: new Date(),
        type: 'decision',
        title: newChoice.title || 'New Decision',
        description: newChoice.description,
        choicesMade: [{
          id: `choice_detail_${Date.now()}`,
          description: newChoice.description,
          chosenAt: new Date(),
          reasoning: choiceContext.reasoning || 'Personal decision',
          confidence: choiceContext.confidence || 75,
          personalityAlignment: choiceContext.personalityAlignment || [],
          consequences: [],
          alternativesNotTaken: adaptation.closedPaths || [],
          pathBranching: {
            newPathsOpened: adaptation.newOpportunities || [],
            pathsClosed: adaptation.closedPaths || [],
            probabilityShifts: {},
            characterTraitChanges: {},
            worldStateChanges: {}
          }
        }],
        alternativePaths: [],
        impact: {
          magnitude: choiceContext.magnitude || 60,
          scope: choiceContext.scope || 'personal',
          reversibility: choiceContext.reversibility || 'moderate',
          rippleEffects: [],
          adaptiveOpportunities: adaptation.newOpportunities || []
        },
        coordinates: {
          x: currentVisualization.nodes.length * 100,
          y: Math.random() * 200 + 100
        },
        connections: [],
        lifePhase: choiceContext.lifePhase || 'adult',
        significanceLevel: choiceContext.significance || 6,
        emotionalWeight: choiceContext.emotionalWeight || 50,
        futureImplications: adaptation.newOpportunities || []
      };

      // Update visualization
      const updatedVisualization = { ...currentVisualization };
      updatedVisualization.nodes.push(newNode);
      updatedVisualization.currentPath.push(newNode.id);
      
      // Update metrics
      updatedVisualization.pathMetrics.adaptabilityScore = Math.max(0, Math.min(100,
        updatedVisualization.pathMetrics.adaptabilityScore + (adaptation.adaptabilityChange || 0)
      ));
      updatedVisualization.pathMetrics.coherenceScore = Math.max(0, Math.min(100,
        updatedVisualization.pathMetrics.coherenceScore + (adaptation.coherenceChange || 0)
      ));
      updatedVisualization.pathMetrics.totalNodes += 1;
      updatedVisualization.pathMetrics.majorDecisions += 1;

      const pathChanges: PathChange[] = (adaptation.pathChanges || []).map((change: string) => ({
        type: 'branch_created',
        description: change,
        timestamp: new Date(),
        affectedNodeId: newNode.id
      }));

      return {
        updatedVisualization,
        pathChanges,
        newOpportunities: adaptation.newOpportunities || [],
        closedPaths: adaptation.closedPaths || []
      };

    } catch (error) {
      console.error('Path adaptation failed:', error);
      return {
        updatedVisualization: currentVisualization,
        pathChanges: [],
        newOpportunities: [],
        closedPaths: []
      };
    }
  }

  private static buildLifePathNodes(
    characterHistory: any[],
    currentState: any,
    aiNodes: any[]
  ): LifePathNode[] {
    return characterHistory.map((event, index) => ({
      id: event.id || `node_${index}`,
      timestamp: new Date(event.timestamp || Date.now() - (characterHistory.length - index) * 86400000),
      type: this.classifyEventType(event),
      title: event.title || `Life Event ${index + 1}`,
      description: event.description || 'Significant life moment',
      choicesMade: [],
      alternativePaths: [],
      impact: {
        magnitude: event.significance || 50,
        scope: 'personal',
        reversibility: 'moderate',
        rippleEffects: [],
        adaptiveOpportunities: []
      },
      coordinates: {
        x: index * 120 + 50,
        y: Math.sin(index * 0.5) * 100 + 200
      },
      connections: index > 0 ? [`node_${index - 1}`] : [],
      lifePhase: this.determineLifePhase(currentState.age, index, characterHistory.length),
      significanceLevel: event.significance || 5,
      emotionalWeight: event.emotionalWeight || 50,
      futureImplications: []
    }));
  }

  private static generatePathConnections(characterHistory: any[]): PathConnection[] {
    const connections: PathConnection[] = [];
    
    for (let i = 1; i < characterHistory.length; i++) {
      connections.push({
        from: `node_${i - 1}`,
        to: `node_${i}`,
        type: 'direct',
        strength: 80,
        color: '#3B82F6',
        style: 'solid'
      });
    }
    
    return connections;
  }

  private static generateAlternativeTimelines(characterHistory: any[]): AlternativeTimeline[] {
    const majorDecisions = characterHistory.filter(event => 
      event.type === 'decision' || event.significance > 7
    );

    return majorDecisions.slice(0, 3).map((decision, index) => ({
      id: `alt_timeline_${index}`,
      title: `Alternative: ${decision.title || 'Different Choice'}`,
      description: `What if you had chosen differently at this point?`,
      branchingPoint: decision.id || `node_${characterHistory.indexOf(decision)}`,
      keyDifferences: [
        'Different career trajectory',
        'Alternative relationship patterns',
        'Varied life experiences'
      ],
      currentPosition: `Alternative path ${index + 1}`,
      probabilityOfOccurrence: 100 - (index * 20),
      visualStyle: {
        opacity: 0.6 - (index * 0.15),
        color: ['#EF4444', '#F59E0B', '#10B981'][index] || '#6B7280',
        animation: 'fade'
      }
    }));
  }

  private static generateFutureProjections(
    characterHistory: any[],
    currentState: any,
    aiProjections: any[]
  ): FutureProjection[] {
    const timeframes = ['6_months', '1_year', '5_years', '10_years'] as const;
    const scenarios = ['optimistic', 'realistic', 'pessimistic'] as const;

    return timeframes.map(timeframe => ({
      timeframe,
      scenario: 'realistic',
      keyPredictions: [
        {
          aspect: 'career',
          prediction: 'Continued growth with AI collaboration',
          confidence: 75,
          requiredActions: ['Develop adaptive skills', 'Build networks'],
          warningSignals: ['Market disruption', 'Skill obsolescence']
        }
      ],
      influencingFactors: ['Personal choices', 'Market trends', 'Relationships'],
      adaptiveRecommendations: [
        'Maintain learning mindset',
        'Build diverse skill portfolio',
        'Cultivate meaningful relationships'
      ],
      probabilityMaps: {
        'career_advancement': 70,
        'relationship_growth': 65,
        'personal_fulfillment': 80
      }
    }));
  }

  private static analyzeChoicePatterns(characterHistory: any[]): ChoicePattern[] {
    // Analyze patterns in decision making
    const riskPatterns = characterHistory.filter(e => e.riskLevel > 7).length;
    const conservativePatterns = characterHistory.filter(e => e.riskLevel < 4).length;

    return [
      {
        pattern: riskPatterns > conservativePatterns ? 'Risk-taking' : 'Conservative',
        frequency: Math.max(riskPatterns, conservativePatterns),
        contexts: ['Career decisions', 'Relationship choices'],
        outcomes: ['Growth opportunities', 'Stability'],
        adaptiveValue: riskPatterns > conservativePatterns ? 60 : 40,
        recommendation: 'Balance risk and stability for optimal growth'
      }
    ];
  }

  // Helper methods
  private static classifyEventType(event: any): LifePathNode['type'] {
    if (event.type === 'decision') return 'decision';
    if (event.significance > 8) return 'turning_point';
    if (event.positive === true) return 'achievement';
    if (event.crisis === true) return 'crisis';
    return 'milestone';
  }

  private static determineLifePhase(age: number, eventIndex: number, totalEvents: number): LifePathNode['lifePhase'] {
    if (age < 18) return 'adolescence';
    if (age < 25) return 'young_adult';
    if (age < 45) return 'adult';
    if (age < 65) return 'middle_age';
    return 'senior';
  }

  private static calculatePathComplexity(history: any[]): number {
    const decisions = history.filter(e => e.type === 'decision').length;
    const turningPoints = history.filter(e => e.significance > 7).length;
    return Math.min(100, (decisions * 10) + (turningPoints * 15));
  }

  private static calculateAdaptabilityScore(history: any[]): number {
    const adaptiveEvents = history.filter(e => e.adaptation || e.learning).length;
    return Math.min(100, (adaptiveEvents / history.length) * 100);
  }

  private static calculateCoherenceScore(history: any[], traits: string[]): number {
    // Analyze how well choices align with personality
    const alignedChoices = history.filter(e => 
      e.personalityAlignment?.some((trait: string) => traits.includes(trait))
    ).length;
    return Math.min(100, (alignedChoices / Math.max(1, history.length)) * 100);
  }

  private static calculateGrowthRate(history: any[]): number {
    const growthEvents = history.filter(e => e.growth || e.learning || e.skill_development).length;
    return Math.min(100, (growthEvents / Math.max(1, history.length)) * 100);
  }

  private static calculateRiskTolerance(history: any[]): number {
    const riskEvents = history.filter(e => e.riskLevel > 6).length;
    return Math.min(100, (riskEvents / Math.max(1, history.length)) * 100);
  }

  private static calculatePatternConsistency(history: any[]): number {
    // Simple pattern consistency calculation
    return Math.floor(Math.random() * 30) + 70; // Placeholder
  }

  private static generateFallbackVisualization(
    characterHistory: any[],
    currentState: any
  ): LifePathVisualization {
    return {
      nodes: this.buildLifePathNodes(characterHistory, currentState, []),
      connections: this.generatePathConnections(characterHistory),
      alternativeTimelines: [],
      currentPath: characterHistory.map((_, index) => `node_${index}`),
      pathMetrics: {
        totalNodes: characterHistory.length,
        majorDecisions: 3,
        turningPoints: 2,
        pathComplexity: 60,
        adaptabilityScore: 70,
        coherenceScore: 75,
        growthRate: 65,
        riskTolerance: 50,
        patternConsistency: 70
      },
      futureProjections: [],
      choicePatterns: []
    };
  }
}

export interface PathChange {
  type: 'branch_created' | 'path_closed' | 'trajectory_shift' | 'opportunity_opened';
  description: string;
  timestamp: Date;
  affectedNodeId: string;
}