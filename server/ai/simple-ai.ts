// Simplified AI integration without Genkit for testing
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

export async function analyzeSymptomPatterns(symptoms: any[], journals: any[]) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    You are a specialized AI assistant for analyzing Morgellons disease symptoms and patterns. 
    Analyze the provided symptom data and identify meaningful patterns, correlations, and insights.

    Symptom Data:
    ${symptoms.map((s, i) => `
    Day ${i + 1}: Intensity ${s.intensity}/10
    Factors: ${JSON.stringify(s.factors)}
    Notes: ${s.notes || 'None'}
    `).join('\n')}
    
    Journal Data:
    ${journals.map(j => `
    Title: ${j.title}
    Content: ${j.content}
    `).join('\n')}

    Provide a JSON response with the following structure:
    {
      "patterns": [
        {
          "pattern": "pattern name",
          "confidence": 0.7,
          "description": "detailed description",
          "recommendations": ["rec1", "rec2"],
          "triggers": ["trigger1", "trigger2"]
        }
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      // Extract JSON from the response text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw error;
  }
}

export async function generateInsights(userId: string, recentData: any) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    Based on recent Morgellons symptom tracking data, generate personalized insights:
    
    User Data Summary:
    - Recent symptom average: ${recentData.avgSymptoms}/10
    - Tracking consistency: ${recentData.trackingDays} days
    - Top factors: ${recentData.topFactors?.join(', ') || 'None identified'}
    
    Generate 3-5 actionable insights in JSON format:
    {
      "insights": [
        {
          "type": "correlation",
          "title": "insight title",
          "description": "detailed description",
          "confidence": 0.8,
          "actionable": true,
          "recommendations": ["rec1", "rec2"]
        }
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('AI Insights Error:', error);
    throw error;
  }
}

export async function analyzeSymptomText(text: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    Analyze this symptom description from a person with Morgellons disease:
    
    Text: "${text}"
    
    Extract information in JSON format:
    {
      "extractedSymptoms": ["symptom1", "symptom2"],
      "severity": 5,
      "emotions": ["emotion1", "emotion2"],
      "suggestions": ["suggestion1", "suggestion2"]
    }
    
    Focus on being supportive and practical.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('AI Text Analysis Error:', error);
    throw error;
  }
}