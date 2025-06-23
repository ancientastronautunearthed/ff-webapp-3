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

    // Enhanced prompt for comprehensive AI analysis
    const prompt = `You are a specialized health AI assistant analyzing Morgellons disease patterns. Analyze this real patient data:

    SYMPTOM DATA (${symptoms.length} entries):
    ${symptoms.map(s => `- Severity: ${s.severity}/10, Location: ${s.location}, Factors: ${s.environmentalFactors?.join(', ') || 'None'}`).join('\n')}
    
    JOURNAL DATA (${journals.length} entries):
    ${journals.map(j => `- Mood: ${j.mood || 'Not specified'}, Notes: ${j.content?.substring(0, 100) || 'No content'}`).join('\n')}
    
    CHECK-IN DATA (${checkins.length} entries):
    ${checkins.map(c => `- Wellbeing: ${c.overallWellbeing}/10, Sleep: ${c.sleepQuality}/10, Pain: ${c.painLevel}/10`).join('\n')}

    Provide comprehensive analysis in JSON format:
    {
      "insights": [
        {
          "type": "prediction|correlation|achievement|tip|warning",
          "title": "Clear insight title",
          "description": "Specific actionable description based on data",
          "confidence": 70-95,
          "actionable": true/false,
          "priority": "high|medium|low",
          "data": {"supporting_data": "values"}
        }
      ],
      "patterns": [
        {
          "pattern": "Specific pattern found",
          "frequency": percentage,
          "correlation": "What correlates with this pattern",
          "recommendation": "Specific recommendation"
        }
      ],
      "prediction": {
        "todayRisk": "low|medium|high",
        "riskFactors": ["factor1", "factor2"],
        "recommendations": ["action1", "action2"]
      }
    }
    
    Focus only on patterns visible in the actual data provided. Be specific and actionable.`;

    const aiResult = await generate({
      model: googleAI('gemini-1.5-flash'),
      prompt: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 1000,
      }
    });

    // Parse AI response - only return real AI analysis
    let aiAnalysis = null;
    try {
      const aiText = aiResult.text();
      console.log('AI Response:', aiText);
      
      // Try to extract JSON from AI response
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiAnalysis = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('AI response parsing failed:', parseError);
    }

    // Only return results if we have valid AI analysis or real data
    if (aiAnalysis && (aiAnalysis.insights || aiAnalysis.patterns)) {
      res.json({
        success: true,
        insights: aiAnalysis.insights || [],
        patterns: aiAnalysis.patterns || [],
        prediction: aiAnalysis.prediction || null,
        confidence: 85,
        analysisDate: new Date().toISOString(),
        aiGenerated: true,
        dataPoints: symptoms.length + journals.length + checkins.length
      });
    } else {
      // Return empty analysis if no real insights can be generated
      res.json({
        success: false,
        message: 'Insufficient data for AI analysis or AI service unavailable',
        insights: [],
        patterns: [],
        prediction: null,
        confidence: 0,
        analysisDate: new Date().toISOString(),
        aiGenerated: false,
        dataPoints: symptoms.length + journals.length + checkins.length
      });
    }

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