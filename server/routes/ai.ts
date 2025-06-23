import { Router } from 'express';
import { 
  analyzeSymptomPatterns,
  generateInsights,
  analyzeSymptomText
} from '../ai/simple-ai';

const router = Router();

// Analyze symptom patterns endpoint
router.post('/analyze-patterns', async (req, res) => {
  try {
    const { symptoms, journals } = req.body;
    
    if (!symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({ error: 'Invalid symptoms data' });
    }

    const result = await analyzeSymptomPatterns(symptoms, journals || []);
    res.json(result.patterns || []);
  } catch (error) {
    console.error('AI Pattern Analysis Error:', error);
    res.status(500).json({ 
      error: 'AI analysis temporarily unavailable',
      fallback: true 
    });
  }
});

// Generate AI insights endpoint
router.post('/generate-insights', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Mock recent data - in production, fetch from Firestore
    const recentData = {
      avgSymptoms: 5.2,
      trackingDays: 15,
      topFactors: ['weather-changes', 'high-stress'],
      moodTrends: 'variable'
    };

    const result = await generateInsights(userId, recentData);
    res.json(result.insights || []);
  } catch (error) {
    console.error('AI Insights Error:', error);
    res.status(500).json({ 
      error: 'AI insights temporarily unavailable',
      fallback: true 
    });
  }
});

// Predict symptom trends endpoint
router.post('/predict-symptoms', async (req, res) => {
  try {
    const { recentSymptoms, currentFactors } = req.body;
    
    if (!recentSymptoms || !Array.isArray(recentSymptoms)) {
      return res.status(400).json({ error: 'Invalid symptom data' });
    }

    // Simple trend prediction based on recent data
    const avgIntensity = recentSymptoms.reduce((sum: number, entry: any) => 
      sum + (entry.intensity || 0), 0) / Math.max(1, recentSymptoms.length);

    res.json({
      predictedIntensity: Math.round(avgIntensity * 10) / 10,
      confidence: 0.7,
      factors: ['recent-trends', 'weather', 'stress'],
      timeframe: 'next 3 days',
      suggestions: [
        'Continue current tracking routine',
        'Monitor identified factor patterns',
        'Consider preventive measures for high-risk factors'
      ]
    });
  } catch (error) {
    console.error('AI Prediction Error:', error);
    res.status(500).json({ 
      error: 'AI prediction temporarily unavailable',
      fallback: true 
    });
  }
});

// Analyze symptom text endpoint
router.post('/analyze-text', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text content required' });
    }

    const result = await analyzeSymptomText(text);
    
    res.json({
      extractedSymptoms: result.extractedSymptoms || [],
      severity: result.severity || 0,
      emotions: result.emotions || [],
      suggestions: result.suggestions || []
    });
  } catch (error) {
    console.error('AI Text Analysis Error:', error);
    res.status(500).json({ 
      error: 'AI text analysis temporarily unavailable',
      fallback: true 
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    ai: 'Firebase Genkit integration active',
    timestamp: new Date().toISOString()
  });
});

export default router;