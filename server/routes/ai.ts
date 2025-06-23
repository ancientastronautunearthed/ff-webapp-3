import { Router } from 'express';
import { generate } from '@genkit-ai/ai';
import { googleAI } from '@genkit-ai/googleai';

export const aiRoutes = Router();

aiRoutes.post('/analyze-health-patterns', async (req, res) => {
  try {
    const { userId, symptoms, journals, checkins } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Prepare data for AI analysis
    const analysisData = {
      userId,
      symptoms: symptoms || [],
      journals: journals || [],
      checkins: checkins || [],
      analysisType: 'health_patterns'
    };

    // Call Google AI for health analysis
    const prompt = `Analyze the following health data for Morgellons disease patterns:
    
    Symptoms (${symptoms.length} entries): Recent severity levels, environmental factors, and patterns
    Journal entries (${journals.length} entries): Mood and observations
    Daily check-ins (${checkins.length} entries): Overall wellbeing and sleep patterns
    
    Provide 2-3 actionable health insights focusing on:
    1. Pattern recognition in symptoms
    2. Environmental or lifestyle correlations
    3. Positive trends or concerning changes
    
    Format as JSON with: insights array containing {type, title, description, actionable, priority, confidence}`;

    const aiResult = await generate({
      model: googleAI('gemini-1.5-flash'),
      prompt: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 1000,
      }
    });

    // Parse AI response
    let parsedInsights = [];
    try {
      const aiText = aiResult.text();
      // Try to extract JSON from AI response
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        parsedInsights = parsed.insights || [];
      }
    } catch (parseError) {
      console.log('AI response parsing failed, using fallback');
    }

    // Return structured response
    res.json({
      success: true,
      insights: parsedInsights.length > 0 ? parsedInsights : generateFallbackAnalysis(req.body),
      patterns: [],
      prediction: null,
      recommendations: [],
      confidence: parsedInsights.length > 0 ? 85 : 60,
      analysisDate: new Date().toISOString(),
      aiGenerated: parsedInsights.length > 0
    });

  } catch (error) {
    console.error('AI health analysis error:', error);
    
    // Return fallback analysis based on data patterns
    const fallbackInsights = generateFallbackAnalysis(req.body);
    
    res.json({
      success: true,
      insights: fallbackInsights,
      patterns: [],
      prediction: null,
      recommendations: [],
      confidence: 60,
      analysisDate: new Date().toISOString(),
      note: 'Fallback analysis used due to AI service limitations'
    });
  }
});

function generateFallbackAnalysis(data: any) {
  const { symptoms, journals, checkins } = data;
  const insights = [];

  // Data collection insight
  if (symptoms?.length > 0 || journals?.length > 0 || checkins?.length > 0) {
    insights.push({
      type: 'achievement',
      title: 'Health Tracking Progress',
      description: `You've been actively tracking your health with ${symptoms?.length || 0} symptom entries, ${journals?.length || 0} journal entries, and ${checkins?.length || 0} check-ins.`,
      actionable: false,
      priority: 'low',
      confidence: 100
    });
  }

  // Symptom trend analysis
  if (symptoms?.length >= 5) {
    const avgSeverity = symptoms.reduce((sum: number, s: any) => sum + (s.severity || 0), 0) / symptoms.length;
    const recentSymptoms = symptoms.slice(0, 3);
    const recentAvg = recentSymptoms.reduce((sum: number, s: any) => sum + (s.severity || 0), 0) / recentSymptoms.length;
    
    if (recentAvg < avgSeverity * 0.8) {
      insights.push({
        type: 'prediction',
        title: 'Positive Symptom Trend',
        description: `Your recent symptoms show improvement of approximately ${Math.round(((avgSeverity - recentAvg) / avgSeverity) * 100)}% compared to your average.`,
        actionable: true,
        priority: 'high',
        confidence: 75
      });
    } else if (recentAvg > avgSeverity * 1.2) {
      insights.push({
        type: 'warning',
        title: 'Symptom Elevation Detected',
        description: `Recent symptoms are elevated. Consider reviewing recent changes in lifestyle, stress, or environmental factors.`,
        actionable: true,
        priority: 'high',
        confidence: 80
      });
    }
  }

  // Consistency insight
  if (checkins?.length >= 3) {
    insights.push({
      type: 'tip',
      title: 'Tracking Consistency',
      description: 'Regular health check-ins help identify patterns and improve treatment effectiveness. Keep up the excellent work!',
      actionable: false,
      priority: 'medium',
      confidence: 90
    });
  }

  // Environmental factors
  if (symptoms?.length > 0) {
    const stressRelated = symptoms.filter((s: any) => 
      s.environmentalFactors?.includes('High Stress') || 
      s.environmentalFactors?.includes('Stress')
    );
    
    if (stressRelated.length > 0) {
      const stressPercentage = (stressRelated.length / symptoms.length) * 100;
      insights.push({
        type: 'correlation',
        title: 'Stress-Symptom Connection',
        description: `${Math.round(stressPercentage)}% of your symptoms occur during high-stress periods. Consider stress management techniques.`,
        actionable: true,
        priority: 'medium',
        confidence: 70
      });
    }
  }

  return insights;
}