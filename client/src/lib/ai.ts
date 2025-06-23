import { auth, db } from './firebase';
import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import type { SymptomEntry, JournalEntry } from '@shared/schema';

// AI Analysis Types
export interface SymptomPattern {
  pattern: string;
  confidence: number;
  description: string;
  recommendations: string[];
  triggers: string[];
}

export interface AIInsight {
  id: string;
  type: 'correlation' | 'trend' | 'recommendation' | 'warning';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  recommendations?: string[];
  createdAt: Date;
}

export interface SymptomPrediction {
  predictedIntensity: number;
  confidence: number;
  factors: string[];
  timeframe: string;
  suggestions: string[];
}

// Firebase AI Functions Interface
const AI_API_BASE = '/api/ai';

export class MorgellonsAI {
  
  // Analyze symptom patterns using Firebase AI
  static async analyzeSymptomPatterns(
    symptomEntries: SymptomEntry[], 
    journalEntries: JournalEntry[]
  ): Promise<SymptomPattern[]> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Prepare data for AI analysis
      const analysisData = {
        symptoms: symptomEntries.map(entry => ({
          date: entry.date,
          intensity: (entry.symptoms as any)?.itchingIntensity || 0,
          factors: entry.factors,
          notes: entry.notes
        })),
        journals: journalEntries.map(entry => ({
          date: entry.createdAt,
          content: entry.content,
          title: entry.title
        }))
      };

      const response = await fetch(`${AI_API_BASE}/analyze-patterns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisData)
      });

      if (!response.ok) {
        throw new Error('Failed to analyze patterns');
      }

      const patterns = await response.json();
      
      // Store insights in Firestore
      await this.storeAIInsights(patterns.map((pattern: any) => ({
        type: 'correlation' as const,
        title: `Pattern: ${pattern.pattern}`,
        description: pattern.description,
        confidence: pattern.confidence,
        actionable: true,
        recommendations: pattern.recommendations
      })));

      return patterns;
    } catch (error) {
      console.error('AI Pattern Analysis Error:', error);
      throw new Error('AI pattern analysis failed. Please check your connection and try again.');
    }
  }

  // Generate AI-powered insights
  static async generateInsights(userId: string): Promise<AIInsight[]> {
    try {
      const response = await fetch(`${AI_API_BASE}/generate-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const insights = await response.json();
      await this.storeAIInsights(insights);
      return insights;
    } catch (error) {
      console.error('AI Insights Error:', error);
      throw new Error('AI insights generation failed. Please check your connection and try again.');
    }
  }

  // Predict symptom trends
  static async predictSymptomTrend(
    symptomEntries: SymptomEntry[],
    factors: any
  ): Promise<SymptomPrediction> {
    try {
      const predictionData = {
        recentSymptoms: symptomEntries.slice(-14), // Last 2 weeks
        currentFactors: factors
      };

      const response = await fetch(`${AI_API_BASE}/predict-symptoms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(predictionData)
      });

      if (!response.ok) {
        throw new Error('Failed to predict symptoms');
      }

      return await response.json();
    } catch (error) {
      console.error('AI Prediction Error:', error);
      throw new Error('AI prediction failed. Please check your connection and try again.');
    }
  }

  // Natural language symptom analysis
  static async analyzeSymptomText(description: string): Promise<{
    extractedSymptoms: string[];
    severity: number;
    emotions: string[];
    suggestions: string[];
  }> {
    try {
      const response = await fetch(`${AI_API_BASE}/analyze-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: description })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }

      return await response.json();
    } catch (error) {
      console.error('AI Text Analysis Error:', error);
      throw new Error('AI text analysis failed. Please check your connection and try again.');
    }
  }

  // Store AI insights in Firestore
  private static async storeAIInsights(insights: Omit<AIInsight, 'id' | 'createdAt'>[]): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    const batch = insights.map(insight => 
      addDoc(collection(db, 'aiInsights'), {
        ...insight,
        userId: user.uid,
        createdAt: new Date()
      })
    );

    await Promise.all(batch);
  }

  // Get stored AI insights
  static async getStoredInsights(userId: string, limitCount: number = 10): Promise<AIInsight[]> {
    const q = query(
      collection(db, 'aiInsights'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as AIInsight[];
  }


}

// Hook for AI insights
export const useAIInsights = (userId: string) => {
  return {
    generateInsights: () => MorgellonsAI.generateInsights(userId),
    getStoredInsights: () => MorgellonsAI.getStoredInsights(userId),
    analyzePatterns: (symptoms: SymptomEntry[], journals: JournalEntry[]) => 
      MorgellonsAI.analyzeSymptomPatterns(symptoms, journals),
    predictTrend: (symptoms: SymptomEntry[], factors: any) => 
      MorgellonsAI.predictSymptomTrend(symptoms, factors)
  };
};