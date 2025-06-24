import { Router } from 'express';
import { LifeStoryEngine, LifeStoryContext, analyzeStoryImpact } from '../ai/life-story-engine';

export const dynamicStoriesRoutes = Router();

// Generate a new personal story based on current life context
dynamicStoriesRoutes.post('/generate', async (req, res) => {
  try {
    const { characterData, relationships, lifestyle, worldState, preferences } = req.body;
    
    if (!characterData) {
      return res.status(400).json({ error: 'Character data is required' });
    }

    const context: LifeStoryContext = {
      character: {
        name: characterData.name || 'Traveler',
        age: characterData.age || 25,
        occupation: characterData.lifeSimulation?.employment?.position || 'Professional',
        personality: characterData.lifeSimulation?.personalityTraits || ['Curious', 'Adaptable'],
        lifePhase: characterData.lifeSimulation?.currentLifePhase || 'young_adult',
        currentSituation: determineCurrentSituation(characterData)
      },
      relationships: {
        spouse: relationships?.find((r: any) => r.type === 'spouse'),
        children: relationships?.filter((r: any) => r.type === 'child') || [],
        friends: relationships?.filter((r: any) => r.type === 'friend') || [],
        family: relationships?.filter((r: any) => ['parent', 'sibling'].includes(r.type)) || []
      },
      lifestyle: {
        housing: characterData.lifeSimulation?.housing,
        financial: characterData.lifeSimulation?.financialStatus,
        career: characterData.lifeSimulation?.employment,
        goals: characterData.lifeSimulation?.lifeGoals || []
      },
      worldState: {
        year: 2035,
        aiIntegration: worldState?.aiTrustLevel || 50,
        personalChoices: worldState?.personalChoices || [],
        majorEvents: worldState?.majorEvents || []
      },
      preferences: {
        storyThemes: preferences?.themes || ['relationships', 'career', 'personal_growth'],
        complexityLevel: preferences?.complexity || 'moderate',
        contentRating: preferences?.rating || 'family'
      }
    };

    const story = await LifeStoryEngine.generatePersonalStory(context);
    
    res.json({
      story,
      context: {
        generatedAt: new Date().toISOString(),
        characterAge: context.character.age,
        lifePhase: context.character.lifePhase,
        storyType: story.storyType
      }
    });
    
  } catch (error) {
    console.error('Story generation error:', error);
    res.status(500).json({ error: 'Failed to generate personal story' });
  }
});

// Generate continuation story based on previous choice
dynamicStoriesRoutes.post('/continue', async (req, res) => {
  try {
    const { previousStory, chosenChoice, updatedContext } = req.body;
    
    if (!previousStory || !chosenChoice) {
      return res.status(400).json({ error: 'Previous story and chosen choice are required' });
    }

    const continuationStory = await LifeStoryEngine.generateContinuationStory(
      previousStory,
      chosenChoice,
      updatedContext
    );
    
    // Analyze the impact of the chosen path
    const impact = await analyzeStoryImpact(previousStory, chosenChoice, updatedContext);
    
    res.json({
      story: continuationStory,
      impact,
      continuationOf: previousStory.id,
      choiceMade: chosenChoice.text
    });
    
  } catch (error) {
    console.error('Story continuation error:', error);
    res.status(500).json({ error: 'Failed to generate story continuation' });
  }
});

// Generate milestone story for major life events
dynamicStoriesRoutes.post('/milestone', async (req, res) => {
  try {
    const { milestoneType, context } = req.body;
    
    const validMilestones = ['marriage', 'birth', 'career_change', 'death', 'achievement'];
    if (!validMilestones.includes(milestoneType)) {
      return res.status(400).json({ error: 'Invalid milestone type' });
    }

    const milestoneStory = await LifeStoryEngine.generateMilestoneStory(
      milestoneType,
      context
    );
    
    res.json({
      story: milestoneStory,
      milestone: milestoneType,
      significance: 'major_life_event'
    });
    
  } catch (error) {
    console.error('Milestone story generation error:', error);
    res.status(500).json({ error: 'Failed to generate milestone story' });
  }
});

// Get story recommendations based on character state
dynamicStoriesRoutes.post('/recommendations', async (req, res) => {
  try {
    const { characterData, recentStories, preferences } = req.body;
    
    const recommendations = generateStoryRecommendations(
      characterData,
      recentStories || [],
      preferences || {}
    );
    
    res.json({
      recommendations,
      basedOn: {
        characterAge: characterData.age,
        lifePhase: characterData.lifeSimulation?.currentLifePhase,
        recentActivityCount: recentStories?.length || 0
      }
    });
    
  } catch (error) {
    console.error('Story recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate story recommendations' });
  }
});

// Track story choices and their consequences
dynamicStoriesRoutes.post('/track-choice', async (req, res) => {
  try {
    const { storyId, choiceId, userId, consequences } = req.body;
    
    // In a full implementation, this would save to database
    // For now, we'll return the tracked data
    
    const trackingData = {
      storyId,
      choiceId,
      userId,
      timestamp: new Date().toISOString(),
      consequences,
      impactScore: calculateImpactScore(consequences)
    };
    
    res.json({
      tracked: true,
      data: trackingData,
      message: 'Choice and consequences recorded'
    });
    
  } catch (error) {
    console.error('Choice tracking error:', error);
    res.status(500).json({ error: 'Failed to track story choice' });
  }
});

// Helper functions
function determineCurrentSituation(characterData: any): string {
  const situations = [];
  
  if (characterData.lifeSimulation?.employment?.workSatisfaction < 50) {
    situations.push('career dissatisfaction');
  }
  
  if (characterData.lifeSimulation?.relationships?.length === 0) {
    situations.push('seeking connections');
  }
  
  if (characterData.lifeSimulation?.financialStatus?.savings < 10000) {
    situations.push('financial growth focus');
  }
  
  if (characterData.age >= 30 && !characterData.lifeSimulation?.relationships?.some((r: any) => r.type === 'spouse')) {
    situations.push('relationship milestone approaching');
  }
  
  return situations.length > 0 ? situations.join(', ') : 'stable life phase';
}

function generateStoryRecommendations(characterData: any, recentStories: any[], preferences: any) {
  const recommendations = [];
  
  // Career-focused stories for work dissatisfaction
  if (characterData.lifeSimulation?.employment?.workSatisfaction < 60) {
    recommendations.push({
      type: 'career',
      title: 'Professional Crossroads',
      description: 'Navigate a challenging workplace situation that could define your career path',
      priority: 'high',
      estimatedDuration: 8
    });
  }
  
  // Relationship stories for lonely characters
  if (characterData.lifeSimulation?.relationships?.length < 2) {
    recommendations.push({
      type: 'relationship',
      title: 'Unexpected Connection',
      description: 'A chance encounter leads to a meaningful new relationship',
      priority: 'medium',
      estimatedDuration: 6
    });
  }
  
  // Financial challenge stories
  if (characterData.lifeSimulation?.financialStatus?.savings < 20000) {
    recommendations.push({
      type: 'financial',
      title: 'Investment Opportunity',
      description: 'A financial decision that could impact your future security',
      priority: 'medium',
      estimatedDuration: 5
    });
  }
  
  // Age-appropriate milestone stories
  if (characterData.age >= 25 && characterData.age <= 35) {
    recommendations.push({
      type: 'milestone',
      title: 'Life Direction Choice',
      description: 'A pivotal moment that shapes your next decade',
      priority: 'high',
      estimatedDuration: 10
    });
  }
  
  // Variety recommendation if recent stories are too similar
  const recentTypes = recentStories.map(s => s.storyType);
  const typeCounts = recentTypes.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as any);
  
  const mostCommonType = Object.keys(typeCounts).reduce((a, b) => 
    typeCounts[a] > typeCounts[b] ? a : b, ''
  );
  
  if (typeCounts[mostCommonType] >= 3) {
    const alternativeTypes = ['discovery', 'personal_growth', 'community'];
    const alternativeType = alternativeTypes.find(t => !recentTypes.includes(t)) || 'discovery';
    
    recommendations.push({
      type: alternativeType,
      title: 'New Perspective',
      description: 'Explore a different aspect of life in 2035',
      priority: 'low',
      estimatedDuration: 7,
      reason: 'variety'
    });
  }
  
  return recommendations.slice(0, 5); // Limit to top 5 recommendations
}

function calculateImpactScore(consequences: any[]): number {
  if (!consequences || consequences.length === 0) return 0;
  
  const totalImpact = consequences.reduce((sum, consequence) => {
    const weight = consequence.type === 'long_term' ? 3 : 
                   consequence.type === 'short_term' ? 2 : 1;
    return sum + (Math.abs(consequence.impact) * weight);
  }, 0);
  
  return Math.min(100, totalImpact / consequences.length);
}