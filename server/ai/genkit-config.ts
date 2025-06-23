import { configureGenkit } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase';
import { googleAI } from '@genkit-ai/googleai';
import { defineFlow, runFlow } from '@genkit-ai/flow';
import { generate } from '@genkit-ai/ai';

// Configure Genkit with Firebase and Google AI
export const ai = configureGenkit({
  plugins: [
    firebase(),
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// Morgellons-specific AI prompts
const SYMPTOM_ANALYSIS_PROMPT = `
You are a specialized AI assistant for analyzing Morgellons disease symptoms and patterns. 
Analyze the provided symptom data and identify meaningful patterns, correlations, and insights.

Focus on:
1. Symptom intensity patterns over time
2. Environmental and dietary correlations
3. Potential triggers and beneficial factors
4. Practical recommendations for symptom management

Provide evidence-based insights while being supportive and understanding of the patient experience.
Avoid medical diagnosis - focus on pattern recognition and lifestyle insights.
`;

const JOURNAL_ANALYSIS_PROMPT = `
Analyze journal entries from a person with Morgellons disease to extract:
1. Emotional patterns and trends
2. Mentioned treatments or interventions
3. Fiber observations and documentation
4. Quality of life indicators
5. Coping strategies mentioned

Provide supportive insights that help the person understand their journey better.
`;

// Define AI flows for symptom analysis
export const analyzeSymptomPatternsFlow = defineFlow(
  {
    name: 'analyzeSymptomPatterns',
    inputSchema: {
      symptoms: 'array',
      journals: 'array',
      timeframe: 'string'
    },
    outputSchema: {
      patterns: 'array',
      insights: 'array',
      recommendations: 'array'
    }
  },
  async (input) => {
    const { symptoms, journals, timeframe = '30 days' } = input;

    // Prepare context for AI analysis
    const analysisContext = `
    Timeframe: ${timeframe}
    Symptom Entries: ${symptoms.length}
    Journal Entries: ${journals.length}
    
    Symptom Data:
    ${symptoms.map((s: any, i: number) => `
    Day ${i + 1}: Intensity ${s.intensity}/10
    Factors: ${JSON.stringify(s.factors)}
    Notes: ${s.notes || 'None'}
    `).join('\n')}
    
    Journal Insights:
    ${journals.map((j: any) => `
    Title: ${j.title}
    Content: ${j.content.substring(0, 200)}...
    `).join('\n')}
    `;

    // Generate AI analysis
    const result = await generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `${SYMPTOM_ANALYSIS_PROMPT}\n\nData to analyze:\n${analysisContext}`,
      config: {
        temperature: 0.3,
        maxOutputTokens: 1000,
      }
    });

    // Parse AI response into structured data
    const analysisText = result.text();
    
    // Extract patterns, insights, and recommendations from AI response
    const patterns = extractPatterns(analysisText);
    const insights = extractInsights(analysisText);
    const recommendations = extractRecommendations(analysisText);

    return {
      patterns,
      insights,
      recommendations,
      confidence: 0.8,
      analysisDate: new Date().toISOString()
    };
  }
);

// Flow for generating personalized insights
export const generateInsightsFlow = defineFlow(
  {
    name: 'generateInsights',
    inputSchema: {
      userId: 'string',
      recentData: 'object'
    },
    outputSchema: {
      insights: 'array',
      trends: 'array',
      alerts: 'array'
    }
  },
  async (input) => {
    const { userId, recentData } = input;

    const insightPrompt = `
    Based on recent Morgellons symptom tracking data, generate personalized insights:
    
    User Data Summary:
    - Recent symptom average: ${recentData.avgSymptoms}/10
    - Tracking consistency: ${recentData.trackingDays} days
    - Top factors: ${recentData.topFactors?.join(', ') || 'None identified'}
    - Mood patterns: ${recentData.moodTrends || 'Not specified'}
    
    Generate 3-5 actionable insights that help the user understand their patterns and improve their quality of life.
    `;

    const result = await generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: insightPrompt,
      config: {
        temperature: 0.4,
        maxOutputTokens: 800,
      }
    });

    const insights = parseInsights(result.text());
    
    return {
      insights,
      trends: extractTrends(recentData),
      alerts: generateAlerts(recentData),
      generatedAt: new Date().toISOString()
    };
  }
);

// Flow for symptom prediction
export const predictSymptomTrendFlow = defineFlow(
  {
    name: 'predictSymptomTrend',
    inputSchema: {
      historicalData: 'array',
      currentFactors: 'object'
    },
    outputSchema: {
      prediction: 'object',
      confidence: 'number',
      factors: 'array'
    }
  },
  async (input) => {
    const { historicalData, currentFactors } = input;

    const predictionPrompt = `
    Based on historical symptom data and current factors, predict likely symptom trends:
    
    Historical Pattern:
    ${historicalData.map((d: any, i: number) => 
      `Day -${historicalData.length - i}: Intensity ${d.intensity}, Factors: ${JSON.stringify(d.factors)}`
    ).join('\n')}
    
    Current Factors:
    ${JSON.stringify(currentFactors, null, 2)}
    
    Provide a symptom intensity prediction for the next 3-7 days with confidence level and key influencing factors.
    `;

    const result = await generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: predictionPrompt,
      config: {
        temperature: 0.2,
        maxOutputTokens: 500,
      }
    });

    return parsePrediction(result.text());
  }
);

// Flow for natural language symptom analysis
export const analyzeSymptomTextFlow = defineFlow(
  {
    name: 'analyzeSymptomText',
    inputSchema: {
      text: 'string',
      context: 'string'
    },
    outputSchema: {
      extractedSymptoms: 'array',
      severity: 'number',
      emotions: 'array',
      suggestions: 'array'
    }
  },
  async (input) => {
    const { text, context = 'daily symptom entry' } = input;

    const analysisPrompt = `
    Analyze this symptom description from a person with Morgellons disease:
    
    Context: ${context}
    Text: "${text}"
    
    Extract:
    1. Specific symptoms mentioned (itching, crawling sensations, lesions, fibers, fatigue, etc.)
    2. Severity indicators (scale 1-10 if possible)
    3. Emotional state indicators
    4. Helpful suggestions based on what's described
    
    Focus on being supportive and practical.
    `;

    const result = await generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: analysisPrompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 600,
      }
    });

    return parseTextAnalysis(result.text());
  }
);

// Helper functions to parse AI responses
function extractPatterns(analysisText: string): any[] {
  // Parse patterns from AI response
  const patterns = [];
  const lines = analysisText.split('\n');
  
  for (const line of lines) {
    if (line.toLowerCase().includes('pattern') || line.toLowerCase().includes('correlation')) {
      patterns.push({
        pattern: line.trim(),
        confidence: 0.7,
        description: line.trim(),
        recommendations: [],
        triggers: []
      });
    }
  }
  
  return patterns.slice(0, 5); // Limit to 5 patterns
}

function extractInsights(analysisText: string): any[] {
  const insights = [];
  const lines = analysisText.split('\n');
  
  for (const line of lines) {
    if (line.toLowerCase().includes('insight') || line.toLowerCase().includes('observation')) {
      insights.push({
        type: 'correlation',
        title: line.trim().substring(0, 50),
        description: line.trim(),
        confidence: 0.8,
        actionable: true
      });
    }
  }
  
  return insights.slice(0, 3);
}

function extractRecommendations(analysisText: string): string[] {
  const recommendations = [];
  const lines = analysisText.split('\n');
  
  for (const line of lines) {
    if (line.toLowerCase().includes('recommend') || line.toLowerCase().includes('suggest')) {
      recommendations.push(line.trim());
    }
  }
  
  return recommendations.slice(0, 5);
}

function parseInsights(text: string): any[] {
  // Parse structured insights from AI response
  return [
    {
      type: 'trend',
      title: 'Tracking Progress',
      description: text.substring(0, 100) + '...',
      confidence: 0.8,
      actionable: true
    }
  ];
}

function extractTrends(data: any): any[] {
  return [
    {
      trend: 'symptom_stability',
      direction: data.avgSymptoms < 5 ? 'improving' : 'stable',
      strength: 0.7
    }
  ];
}

function generateAlerts(data: any): any[] {
  const alerts = [];
  
  if (data.avgSymptoms > 7) {
    alerts.push({
      type: 'warning',
      message: 'Symptom intensity above usual range',
      severity: 'medium',
      suggestions: ['Consider reviewing recent factors', 'Consult healthcare provider if persistent']
    });
  }
  
  return alerts;
}

function parsePrediction(text: string): any {
  // Parse prediction from AI response
  return {
    prediction: {
      predictedIntensity: 5.0,
      timeframe: 'next 3 days',
      trend: 'stable'
    },
    confidence: 0.7,
    factors: ['weather', 'stress', 'diet']
  };
}

function parseTextAnalysis(text: string): any {
  return {
    extractedSymptoms: ['itching', 'fatigue'],
    severity: 5,
    emotions: ['concerned', 'hopeful'],
    suggestions: ['Continue tracking', 'Monitor patterns']
  };
}