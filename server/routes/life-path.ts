import { Router } from 'express';
import { LifePathEngine } from '../ai/life-path-engine';

export const lifePathRoutes = Router();

// Generate comprehensive life path visualization
lifePathRoutes.post('/generate-visualization', async (req, res) => {
  try {
    const { characterHistory, currentState, personalityTraits } = req.body;

    if (!characterHistory || !currentState) {
      return res.status(400).json({ error: 'Character history and current state are required' });
    }

    const visualization = await LifePathEngine.generateLifePathVisualization(
      characterHistory,
      currentState,
      personalityTraits || []
    );

    res.json({
      success: true,
      visualization,
      characterId: currentState.id,
      generatedAt: new Date().toISOString(),
      summary: {
        totalNodes: visualization.nodes.length,
        majorDecisions: visualization.pathMetrics.majorDecisions,
        adaptabilityScore: visualization.pathMetrics.adaptabilityScore,
        futureProjections: visualization.futureProjections.length
      }
    });

  } catch (error) {
    console.error('Life path visualization error:', error);
    res.status(500).json({ error: 'Failed to generate life path visualization' });
  }
});

// Adapt path based on new choice
lifePathRoutes.post('/adapt-path', async (req, res) => {
  try {
    const { currentVisualization, newChoice, choiceContext } = req.body;

    if (!currentVisualization || !newChoice) {
      return res.status(400).json({ error: 'Current visualization and new choice are required' });
    }

    const adaptation = await LifePathEngine.adaptPathToNewChoice(
      currentVisualization,
      newChoice,
      choiceContext || {}
    );

    res.json({
      success: true,
      ...adaptation,
      adaptationTimestamp: new Date().toISOString(),
      summary: {
        nodesAdded: 1,
        newOpportunities: adaptation.newOpportunities.length,
        closedPaths: adaptation.closedPaths.length,
        pathChanges: adaptation.pathChanges.length
      }
    });

  } catch (error) {
    console.error('Path adaptation error:', error);
    res.status(500).json({ error: 'Failed to adapt life path' });
  }
});

// Analyze choice impact before making decision
lifePathRoutes.post('/analyze-choice-impact', async (req, res) => {
  try {
    const { currentPath, proposedChoice, alternativeChoices } = req.body;

    if (!currentPath || !proposedChoice) {
      return res.status(400).json({ error: 'Current path and proposed choice are required' });
    }

    // Simulate different choice outcomes
    const impacts = [];

    // Analyze main choice
    const mainImpact = {
      choice: proposedChoice,
      projectedOutcomes: {
        career: Math.floor(Math.random() * 40) - 20,
        relationships: Math.floor(Math.random() * 40) - 20,
        happiness: Math.floor(Math.random() * 40) - 20,
        growth: Math.floor(Math.random() * 50),
        risk: Math.floor(Math.random() * 100)
      },
      pathChanges: [
        `Opens ${Math.floor(Math.random() * 5) + 1} new opportunities`,
        `Closes ${Math.floor(Math.random() * 3)} alternative paths`,
        'Shifts future trajectory toward chosen direction'
      ],
      timelineShifts: {
        '6_months': `Immediate changes in ${proposedChoice.category || 'life direction'}`,
        '1_year': 'Established new patterns and opportunities',
        '5_years': 'Significant life trajectory differences',
        '10_years': 'Fundamentally different life path'
      },
      recommendationScore: Math.floor(Math.random() * 40) + 60
    };

    impacts.push(mainImpact);

    // Analyze alternatives if provided
    if (alternativeChoices && Array.isArray(alternativeChoices)) {
      alternativeChoices.forEach(altChoice => {
        impacts.push({
          choice: altChoice,
          projectedOutcomes: {
            career: Math.floor(Math.random() * 40) - 20,
            relationships: Math.floor(Math.random() * 40) - 20,
            happiness: Math.floor(Math.random() * 40) - 20,
            growth: Math.floor(Math.random() * 50),
            risk: Math.floor(Math.random() * 100)
          },
          pathChanges: [
            'Different opportunity set',
            'Alternative growth trajectory',
            'Varied risk profile'
          ],
          timelineShifts: {
            '6_months': `Changes in ${altChoice.category || 'different area'}`,
            '1_year': 'Alternative development pattern',
            '5_years': 'Different life direction',
            '10_years': 'Distinct life path outcome'
          },
          recommendationScore: Math.floor(Math.random() * 40) + 50
        });
      });
    }

    res.json({
      success: true,
      choiceAnalysis: {
        mainChoice: impacts[0],
        alternatives: impacts.slice(1),
        comparison: {
          bestFor: {
            career: impacts.reduce((best, current) => 
              current.projectedOutcomes.career > best.projectedOutcomes.career ? current : best
            ).choice.description,
            relationships: impacts.reduce((best, current) => 
              current.projectedOutcomes.relationships > best.projectedOutcomes.relationships ? current : best
            ).choice.description,
            happiness: impacts.reduce((best, current) => 
              current.projectedOutcomes.happiness > best.projectedOutcomes.happiness ? current : best
            ).choice.description,
            growth: impacts.reduce((best, current) => 
              current.projectedOutcomes.growth > best.projectedOutcomes.growth ? current : best
            ).choice.description
          },
          riskLevels: impacts.map(impact => ({
            choice: impact.choice.description,
            risk: impact.projectedOutcomes.risk,
            riskLevel: impact.projectedOutcomes.risk > 70 ? 'High' : 
                      impact.projectedOutcomes.risk > 40 ? 'Medium' : 'Low'
          }))
        },
        recommendations: [
          'Consider long-term implications beyond immediate benefits',
          'Align choice with core values and personality traits',
          'Evaluate reversibility and adaptation options',
          'Assess support systems for chosen path'
        ]
      },
      analysisTimestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Choice impact analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze choice impact' });
  }
});

// Generate path exploration suggestions
lifePathRoutes.post('/explore-alternatives', async (req, res) => {
  try {
    const { currentVisualization, explorationFocus } = req.body;

    if (!currentVisualization) {
      return res.status(400).json({ error: 'Current visualization is required' });
    }

    const focus = explorationFocus || 'general';
    const currentMetrics = currentVisualization.pathMetrics;

    // Generate exploration suggestions based on current path
    const explorationSuggestions = {
      alternativePaths: [
        {
          id: 'career_pivot',
          title: 'Career Transformation Path',
          description: 'Explore radical career change opportunities',
          difficulty: 'challenging',
          timeline: '2-5 years',
          requirements: ['Skill development', 'Network building', 'Financial planning'],
          potentialBenefits: ['New growth opportunities', 'Increased adaptability', 'Fresh perspectives'],
          riskFactors: ['Income uncertainty', 'Learning curve', 'Industry differences'],
          alignmentScore: currentMetrics.adaptabilityScore
        },
        {
          id: 'relationship_focus',
          title: 'Relationship-Centered Life Path',
          description: 'Prioritize deep relationships and community building',
          difficulty: 'moderate',
          timeline: '1-3 years',
          requirements: ['Emotional intelligence', 'Communication skills', 'Time investment'],
          potentialBenefits: ['Stronger support network', 'Emotional fulfillment', 'Life balance'],
          riskFactors: ['Career trade-offs', 'Dependency risks', 'Boundary challenges'],
          alignmentScore: currentMetrics.coherenceScore
        },
        {
          id: 'innovation_path',
          title: 'Innovation and Entrepreneurship Track',
          description: 'Create new solutions and build innovative ventures',
          difficulty: 'high',
          timeline: '3-7 years',
          requirements: ['Creative thinking', 'Risk tolerance', 'Business skills'],
          potentialBenefits: ['High impact potential', 'Financial rewards', 'Personal fulfillment'],
          riskFactors: ['High failure rate', 'Financial risk', 'Stress levels'],
          alignmentScore: currentMetrics.pathComplexity
        }
      ],
      
      unexploredOpportunities: [
        {
          category: 'learning',
          opportunity: 'AI-Human Collaboration Mastery',
          description: 'Become expert in bridging human creativity with AI capabilities',
          timeInvestment: '6-12 months',
          potentialImpact: 'High career differentiation',
          prerequisites: ['Basic AI understanding', 'Communication skills']
        },
        {
          category: 'social',
          opportunity: 'Community Leadership Role',
          description: 'Lead initiatives in local or professional communities',
          timeInvestment: '3-6 months to start',
          potentialImpact: 'Network expansion and influence',
          prerequisites: ['Leadership interest', 'Available time']
        },
        {
          category: 'personal',
          opportunity: 'Life Skills Mastery',
          description: 'Develop advanced life management and wellness skills',
          timeInvestment: 'Ongoing daily practice',
          potentialImpact: 'Overall life quality improvement',
          prerequisites: ['Commitment to growth', 'Self-reflection']
        }
      ],

      pathOptimization: {
        strengthenCurrentPath: [
          'Build deeper expertise in current domain',
          'Expand professional network within field',
          'Develop complementary skills for current role'
        ],
        increasAdaptability: [
          'Learn meta-skills like learning how to learn',
          'Build diverse experience portfolio',
          'Develop emotional intelligence and resilience'
        ],
        improveCoherence: [
          'Align choices more closely with core values',
          'Create personal mission and vision statements',
          'Regular life direction review and adjustment'
        ]
      },

      riskMitigation: [
        'Build emergency funds for path transitions',
        'Develop multiple skill sets for career flexibility',
        'Maintain strong relationship networks for support',
        'Practice decision-making and adaptation skills'
      ]
    };

    res.json({
      success: true,
      explorationSuggestions,
      currentPathMetrics: currentMetrics,
      explorationFocus: focus,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Path exploration error:', error);
    res.status(500).json({ error: 'Failed to generate path exploration suggestions' });
  }
});

// Track path evolution over time
lifePathRoutes.post('/track-evolution', async (req, res) => {
  try {
    const { pathHistory, timeframe } = req.body;

    if (!pathHistory || !Array.isArray(pathHistory)) {
      return res.status(400).json({ error: 'Path history array is required' });
    }

    const evolution = {
      timeframe: timeframe || 'all_time',
      metrics: {
        adaptabilityGrowth: [],
        coherenceChanges: [],
        complexityEvolution: [],
        decisionFrequency: [],
        riskTolerance: []
      },
      patterns: {
        decisionMaking: [],
        growthAreas: [],
        consistentTraits: [],
        emergingTrends: []
      },
      insights: {
        majorTransformations: [],
        recurringThemes: [],
        adaptationSuccess: [],
        futureIndicators: []
      }
    };

    // Analyze evolution patterns
    pathHistory.forEach((snapshot, index) => {
      const date = new Date(snapshot.timestamp);
      
      evolution.metrics.adaptabilityGrowth.push({
        date,
        value: snapshot.pathMetrics?.adaptabilityScore || 50,
        change: index > 0 ? 
          (snapshot.pathMetrics?.adaptabilityScore || 50) - 
          (pathHistory[index - 1].pathMetrics?.adaptabilityScore || 50) : 0
      });

      evolution.metrics.coherenceChanges.push({
        date,
        value: snapshot.pathMetrics?.coherenceScore || 50,
        change: index > 0 ? 
          (snapshot.pathMetrics?.coherenceScore || 50) - 
          (pathHistory[index - 1].pathMetrics?.coherenceScore || 50) : 0
      });
    });

    // Identify patterns
    const recentNodes = pathHistory[pathHistory.length - 1]?.nodes || [];
    const decisionNodes = recentNodes.filter(node => node.type === 'decision');
    
    evolution.patterns.decisionMaking = [
      `Average ${Math.floor(decisionNodes.length / Math.max(1, pathHistory.length))} major decisions per period`,
      'Tendency toward ' + (decisionNodes.length > 5 ? 'frequent' : 'deliberate') + ' decision making',
      'Risk tolerance appears ' + (Math.random() > 0.5 ? 'increasing' : 'stable') + ' over time'
    ];

    evolution.insights.majorTransformations = [
      'Career evolution toward AI collaboration',
      'Relationship patterns showing increased depth',
      'Personal growth acceleration in recent period'
    ];

    res.json({
      success: true,
      evolution,
      pathHistoryLength: pathHistory.length,
      analysisTimestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Path evolution tracking error:', error);
    res.status(500).json({ error: 'Failed to track path evolution' });
  }
});