import { GoogleGenerativeAI } from '@google/generative-ai';

const ai = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

export interface UserProfile {
  userId: string;
  symptoms: string[];
  journalEntries: any[];
  symptomEntries: any[];
  demographics: {
    age?: number;
    location?: string;
    experienceLevel?: string;
  };
  preferences: {
    supportType: string[];
    interests: string[];
    communicationStyle: string;
    privacyLevel: string;
  };
  activityLevel: {
    lastActive: Date;
    engagementScore: number;
    responseRate: number;
  };
}

export interface ConnectionRecommendation {
  targetUserId: string;
  score: number;
  reasons: string[];
  compatibility: {
    symptomOverlap: number;
    interestAlignment: number;
    communicationMatch: number;
    experienceMatch: number;
    activityMatch: number;
  };
  recommendationType: 'urgent_support' | 'peer_buddy' | 'mentor' | 'research_partner';
  confidence: number;
  aiInsight: string;
}

export interface RecommendationContext {
  recentSymptomChanges: boolean;
  emotionalState: 'struggling' | 'stable' | 'improving';
  supportNeeds: string[];
  timeOfRequest: Date;
  previousConnections: string[];
}

export class PeerRecommendationEngine {
  
  static async generateRecommendations(
    userProfile: UserProfile,
    potentialMatches: UserProfile[],
    context: RecommendationContext
  ): Promise<ConnectionRecommendation[]> {
    try {
      // Calculate base compatibility scores
      const baseRecommendations = potentialMatches.map(match => 
        this.calculateBaseCompatibility(userProfile, match)
      );

      // Enhance recommendations with AI analysis
      const enhancedRecommendations = await Promise.all(
        baseRecommendations.map(async (rec) => {
          const aiInsight = await this.generateAIInsight(userProfile, rec.match, context);
          return {
            ...rec,
            aiInsight: aiInsight.insight,
            score: this.adjustScoreWithAI(rec.score, aiInsight.adjustmentFactor),
            confidence: aiInsight.confidence
          };
        })
      );

      // Sort by score and return top recommendations
      return enhancedRecommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(rec => ({
          targetUserId: rec.match.userId,
          score: rec.score,
          reasons: rec.reasons,
          compatibility: rec.compatibility,
          recommendationType: rec.recommendationType,
          confidence: rec.confidence,
          aiInsight: rec.aiInsight
        }));

    } catch (error) {
      console.error('Error generating peer recommendations:', error);
      return [];
    }
  }

  private static calculateBaseCompatibility(user: UserProfile, match: UserProfile) {
    // Symptom overlap analysis
    const commonSymptoms = user.symptoms.filter(s => match.symptoms.includes(s));
    const symptomOverlap = commonSymptoms.length / Math.max(user.symptoms.length, match.symptoms.length, 1);

    // Interest alignment
    const commonInterests = user.preferences.interests.filter(i => 
      match.preferences.interests.includes(i)
    );
    const interestAlignment = commonInterests.length / Math.max(user.preferences.interests.length, 1);

    // Communication style compatibility
    const communicationMatch = user.preferences.communicationStyle === match.preferences.communicationStyle ? 1 : 0.5;

    // Experience level matching
    const experienceMatch = this.calculateExperienceMatch(
      user.demographics.experienceLevel,
      match.demographics.experienceLevel
    );

    // Activity level compatibility
    const activityMatch = this.calculateActivityMatch(user.activityLevel, match.activityLevel);

    // Calculate weighted score
    const score = (
      symptomOverlap * 0.35 +
      interestAlignment * 0.25 +
      communicationMatch * 0.15 +
      experienceMatch * 0.15 +
      activityMatch * 0.10
    ) * 100;

    // Determine recommendation type
    const recommendationType = this.determineRecommendationType(user, match, {
      symptomOverlap,
      interestAlignment,
      communicationMatch,
      experienceMatch,
      activityMatch
    });

    // Generate reasons
    const reasons = this.generateReasons(user, match, {
      symptomOverlap,
      interestAlignment,
      communicationMatch,
      experienceMatch,
      activityMatch
    });

    return {
      match,
      score,
      reasons,
      compatibility: {
        symptomOverlap,
        interestAlignment,
        communicationMatch,
        experienceMatch,
        activityMatch
      },
      recommendationType
    };
  }

  private static async generateAIInsight(
    user: UserProfile,
    match: UserProfile,
    context: RecommendationContext
  ) {
    try {
      const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const prompt = `
        Analyze the compatibility between two Morgellons patients for peer support connection.

        User Profile:
        - Symptoms: ${user.symptoms.join(', ')}
        - Recent journal themes: ${this.extractJournalThemes(user.journalEntries)}
        - Experience level: ${user.demographics.experienceLevel}
        - Support preferences: ${user.preferences.supportType.join(', ')}
        - Communication style: ${user.preferences.communicationStyle}

        Potential Match Profile:
        - Symptoms: ${match.symptoms.join(', ')}
        - Recent journal themes: ${this.extractJournalThemes(match.journalEntries)}
        - Experience level: ${match.demographics.experienceLevel}
        - Support preferences: ${match.preferences.supportType.join(', ')}
        - Communication style: ${match.preferences.communicationStyle}

        Context:
        - User's recent symptom changes: ${context.recentSymptomChanges}
        - User's emotional state: ${context.emotionalState}
        - User's current support needs: ${context.supportNeeds.join(', ')}

        Provide:
        1. A compatibility insight (2-3 sentences)
        2. Score adjustment factor (0.8-1.2 to adjust base score)
        3. Confidence level (0-100)

        Respond in JSON format:
        {
          "insight": "string",
          "adjustmentFactor": number,
          "confidence": number
        }
      `;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      try {
        return JSON.parse(response);
      } catch {
        return {
          insight: "AI analysis suggests potential compatibility based on shared health journey",
          adjustmentFactor: 1.0,
          confidence: 70
        };
      }

    } catch (error) {
      console.error('Error generating AI insight:', error);
      return {
        insight: "Compatible based on shared experiences and support preferences",
        adjustmentFactor: 1.0,
        confidence: 60
      };
    }
  }

  private static extractJournalThemes(journalEntries: any[]): string {
    if (!journalEntries?.length) return "No recent entries";
    
    const recentEntries = journalEntries.slice(0, 5);
    const themes = recentEntries.map(entry => {
      const content = entry.content || entry.notes || '';
      if (content.toLowerCase().includes('pain')) return 'pain management';
      if (content.toLowerCase().includes('stress')) return 'stress coping';
      if (content.toLowerCase().includes('sleep')) return 'sleep issues';
      if (content.toLowerCase().includes('medication')) return 'treatment tracking';
      return 'general wellness';
    });

    return [...new Set(themes)].join(', ');
  }

  private static calculateExperienceMatch(userLevel?: string, matchLevel?: string): number {
    if (!userLevel || !matchLevel) return 0.5;
    
    const levels = ['newly_diagnosed', 'experienced', 'long_term'];
    const userIndex = levels.indexOf(userLevel);
    const matchIndex = levels.indexOf(matchLevel);
    
    if (userIndex === -1 || matchIndex === -1) return 0.5;
    
    const difference = Math.abs(userIndex - matchIndex);
    return difference === 0 ? 1 : difference === 1 ? 0.7 : 0.4;
  }

  private static calculateActivityMatch(userActivity: any, matchActivity: any): number {
    const userScore = userActivity.engagementScore || 0;
    const matchScore = matchActivity.engagementScore || 0;
    
    const difference = Math.abs(userScore - matchScore) / 100;
    return Math.max(0, 1 - difference);
  }

  private static determineRecommendationType(
    user: UserProfile,
    match: UserProfile,
    compatibility: any
  ): 'urgent_support' | 'peer_buddy' | 'mentor' | 'research_partner' {
    
    // Check for urgent support needs
    if (user.preferences.supportType.includes('Crisis support') || 
        user.preferences.supportType.includes('Emotional support')) {
      return 'urgent_support';
    }

    // Check for mentor relationship
    if (user.demographics.experienceLevel === 'newly_diagnosed' && 
        match.demographics.experienceLevel === 'long_term') {
      return 'mentor';
    }

    // Check for research partnership
    if (user.preferences.interests.includes('Research participation') && 
        match.preferences.interests.includes('Research participation')) {
      return 'research_partner';
    }

    // Default to peer buddy
    return 'peer_buddy';
  }

  private static generateReasons(user: UserProfile, match: UserProfile, compatibility: any): string[] {
    const reasons: string[] = [];

    if (compatibility.symptomOverlap > 0.6) {
      reasons.push(`High symptom overlap (${Math.round(compatibility.symptomOverlap * 100)}%)`);
    }

    if (compatibility.interestAlignment > 0.5) {
      reasons.push('Shared interests and coping strategies');
    }

    if (compatibility.communicationMatch === 1) {
      reasons.push('Compatible communication preferences');
    }

    if (compatibility.experienceMatch > 0.7) {
      reasons.push('Similar experience level');
    }

    if (match.activityLevel.responseRate > 0.8) {
      reasons.push('Highly responsive community member');
    }

    // Add support type specific reasons
    const commonSupportTypes = user.preferences.supportType.filter(type =>
      match.preferences.supportType.includes(type)
    );
    
    if (commonSupportTypes.length > 0) {
      reasons.push(`Shared support focus: ${commonSupportTypes[0]}`);
    }

    return reasons.slice(0, 4); // Limit to top 4 reasons
  }

  private static adjustScoreWithAI(baseScore: number, adjustmentFactor: number): number {
    return Math.min(100, Math.max(0, baseScore * adjustmentFactor));
  }

  static async analyzeConnectionSuccess(
    userId: string,
    connections: any[]
  ): Promise<{
    successRate: number;
    preferredTypes: string[];
    recommendations: string[];
  }> {
    try {
      const successfulConnections = connections.filter(c => c.status === 'accepted');
      const successRate = successfulConnections.length / Math.max(connections.length, 1);

      // Analyze patterns in successful connections
      const typeFrequency: Record<string, number> = {};
      successfulConnections.forEach(conn => {
        typeFrequency[conn.connectionType] = (typeFrequency[conn.connectionType] || 0) + 1;
      });

      const preferredTypes = Object.entries(typeFrequency)
        .sort(([,a], [,b]) => b - a)
        .map(([type]) => type);

      const recommendations = this.generateConnectionRecommendations(successRate, preferredTypes);

      return {
        successRate,
        preferredTypes,
        recommendations
      };

    } catch (error) {
      console.error('Error analyzing connection success:', error);
      return {
        successRate: 0,
        preferredTypes: [],
        recommendations: ['Complete your profile to improve matching accuracy']
      };
    }
  }

  private static generateConnectionRecommendations(successRate: number, preferredTypes: string[]): string[] {
    const recommendations: string[] = [];

    if (successRate < 0.3) {
      recommendations.push('Consider updating your preferences to find better matches');
      recommendations.push('Add more details to your profile for improved compatibility');
    } else if (successRate < 0.6) {
      recommendations.push('Try connecting with users who share your primary symptoms');
      recommendations.push('Look for matches with similar experience levels');
    } else {
      recommendations.push('Your connection rate is excellent! Keep engaging actively');
      recommendations.push('Consider mentoring newer community members');
    }

    if (preferredTypes.length > 0) {
      recommendations.push(`Focus on ${preferredTypes[0]} connections based on your history`);
    }

    return recommendations.slice(0, 3);
  }
}