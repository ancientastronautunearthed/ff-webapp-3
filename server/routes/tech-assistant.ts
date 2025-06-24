import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';

export const techAssistantRoutes = Router();

const genAI = new GoogleGenAI(process.env.GOOGLE_GENAI_API_KEY || '');

interface ProductRecommendation {
  id: string;
  name: string;
  description: string;
  price: string;
  rating: number;
  category: string;
  amazonUrl: string;
  benefits: string[];
  considerations: string[];
  suitability: string;
}

// Generate assistant name
techAssistantRoutes.post('/generate-name', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-preview' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const name = response.text()?.trim() || 'TechAssist';
    
    res.json({ name });
  } catch (error) {
    console.error('Error generating assistant name:', error);
    res.status(500).json({ error: 'Failed to generate assistant name' });
  }
});

// Chat with tech assistant
techAssistantRoutes.post('/chat', async (req, res) => {
  try {
    const { message, userId, assistantConfig, messageHistory } = req.body;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-preview' });
    
    // Build context from assistant configuration
    const personalityContext = buildPersonalityContext(assistantConfig);
    
    // Build conversation history
    const conversationContext = messageHistory
      .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');
    
    const prompt = `${personalityContext}

Previous conversation:
${conversationContext}

User's current message: ${message}

Provide a helpful response with specific product recommendations for Morgellons support. Focus on tools, devices, and products available on Amazon that could help with symptoms, environmental factors, or daily living.

For each product recommendation, provide:
1. Product name and brief description
2. Estimated price range
3. Key benefits for Morgellons patients
4. Any considerations or limitations
5. Suitability level (Beginner/Intermediate/Advanced)

Also provide 2-3 actionable next steps the user can take.

Format your response as:
RESPONSE: [Your conversational response here]

RECOMMENDATIONS: [JSON array of product recommendations]

ACTION_ITEMS: [JSON array of next steps]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const fullResponse = response.text() || '';
    
    // Parse the response
    const { responseText, recommendations, actionItems } = parseAssistantResponse(fullResponse, message);
    
    res.json({
      response: responseText,
      recommendations,
      actionItems
    });
    
  } catch (error) {
    console.error('Error in tech assistant chat:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

function buildPersonalityContext(config: any): string {
  if (!config) {
    return "You are a helpful technology assistant specializing in Morgellons support tools and products.";
  }
  
  const expertiseMap: Record<string, string> = {
    'environmental-tech': 'You specialize in environmental technology including air purifiers, humidity control systems, mold detection equipment, and air quality monitoring devices.',
    'medical-devices': 'You specialize in medical devices and health monitoring tools including diagnostic equipment, therapeutic devices, and health tracking systems.',
    'smart-home': 'You specialize in smart home technology including IoT sensors, home automation, environmental monitoring systems, and connected health devices.',
    'research-tools': 'You specialize in research and documentation tools including testing kits, measurement devices, cameras for documentation, and data collection systems.',
    'wellness-tech': 'You specialize in wellness technology including fitness trackers, sleep monitors, stress management devices, and holistic health tools.',
    'general-tech': 'You are a comprehensive technology advisor with expertise across all categories of helpful tools and devices.'
  };
  
  const personalityMap: Record<string, string> = {
    'analytical': 'You approach recommendations with thorough analysis, providing detailed specifications and data-driven insights.',
    'innovative': 'You focus on cutting-edge solutions and creative approaches to solving problems.',
    'practical': 'You prioritize cost-effective, proven solutions that offer real-world value.',
    'empathetic': 'You understand the challenges of living with Morgellons and provide compassionate, patient guidance.',
    'enthusiastic': 'You are energetic and optimistic about technology solutions, encouraging users to try new approaches.',
    'meticulous': 'You provide careful, detailed recommendations with attention to safety and compatibility.'
  };
  
  const styleMap: Record<string, string> = {
    'professional': 'You communicate in a formal, authoritative manner with evidence-based recommendations.',
    'friendly': 'You use a warm, conversational tone that makes users feel comfortable and supported.',
    'technical': 'You provide detailed technical specifications and explanations.',
    'simplified': 'You explain things in simple, easy-to-understand terms without jargon.',
    'collaborative': 'You involve users in decision-making and ask clarifying questions.'
  };
  
  const toneMap: Record<string, string> = {
    'confident': 'You speak with authority and confidence in your recommendations.',
    'supportive': 'You provide encouraging, understanding responses that validate user concerns.',
    'curious': 'You ask thoughtful questions to better understand user needs.',
    'cautious': 'You emphasize safety and careful consideration of all factors.',
    'optimistic': 'You focus on positive outcomes and hopeful solutions.'
  };
  
  const focusMap: Record<string, string> = {
    'symptom-relief': 'You prioritize tools that directly address Morgellons symptoms.',
    'environmental': 'You focus on environmental control solutions for air quality, humidity, and allergen management.',
    'monitoring': 'You emphasize tracking, measurement, and documentation tools.',
    'comfort': 'You prioritize daily living aids and comfort improvements.',
    'research': 'You focus on tools that help users study and understand their condition.',
    'holistic': 'You take a comprehensive approach considering all aspects of health and environment.'
  };
  
  return `You are ${config.name || 'a specialized technology assistant'}, an expert in ${expertiseMap[config.expertise] || 'technology solutions for Morgellons support'}. 

Your personality is ${personalityMap[config.personality] || 'helpful and knowledgeable'}. ${styleMap[config.style] || 'You communicate clearly and effectively'}. ${toneMap[config.tone] || 'You are supportive and understanding'}. 

Your primary focus is ${focusMap[config.focus] || 'providing comprehensive support'}. You recommend products and tools available on Amazon that can help with Morgellons symptoms, environmental factors, and daily living challenges.

Key guidelines:
- Always provide specific, actionable product recommendations
- Include price ranges and availability information
- Consider the user's technical experience level: ${config.experience || 'mixed levels'}
- Focus on ${config.specialization || 'comprehensive support'} solutions
- Prioritize safety and compatibility
- Provide Amazon search terms or direct product suggestions
- Consider budget constraints and offer options at different price points`;
}

function parseAssistantResponse(fullResponse: string, userMessage: string): {
  responseText: string;
  recommendations: ProductRecommendation[];
  actionItems: string[];
} {
  try {
    // Extract sections
    const responsePart = fullResponse.match(/RESPONSE:\s*(.*?)(?=RECOMMENDATIONS:|ACTION_ITEMS:|$)/s)?.[1]?.trim() || fullResponse;
    const recommendationsPart = fullResponse.match(/RECOMMENDATIONS:\s*(.*?)(?=ACTION_ITEMS:|$)/s)?.[1]?.trim();
    const actionItemsPart = fullResponse.match(/ACTION_ITEMS:\s*(.*?)$/s)?.[1]?.trim();
    
    let recommendations: ProductRecommendation[] = [];
    let actionItems: string[] = [];
    
    // Parse recommendations
    if (recommendationsPart) {
      try {
        recommendations = JSON.parse(recommendationsPart);
      } catch {
        // If JSON parsing fails, generate fallback recommendations based on user message
        recommendations = generateFallbackRecommendations(userMessage);
      }
    } else {
      recommendations = generateFallbackRecommendations(userMessage);
    }
    
    // Parse action items
    if (actionItemsPart) {
      try {
        actionItems = JSON.parse(actionItemsPart);
      } catch {
        actionItems = [
          "Research the recommended products to find the best fit for your needs",
          "Read customer reviews and ratings on Amazon before purchasing",
          "Consider starting with one product to test effectiveness before investing in multiple items"
        ];
      }
    } else {
      actionItems = [
        "Review the recommended products and their benefits",
        "Check product availability and shipping options on Amazon",
        "Consider your budget and prioritize the most important tools first"
      ];
    }
    
    return {
      responseText: responsePart,
      recommendations: recommendations.slice(0, 3), // Limit to 3 recommendations
      actionItems: actionItems.slice(0, 3) // Limit to 3 action items
    };
    
  } catch (error) {
    console.error('Error parsing assistant response:', error);
    return {
      responseText: fullResponse,
      recommendations: generateFallbackRecommendations(userMessage),
      actionItems: [
        "Research products that address your specific needs",
        "Read reviews and compare options before purchasing",
        "Start with one product to test its effectiveness"
      ]
    };
  }
}

function generateFallbackRecommendations(userMessage: string): ProductRecommendation[] {
  const message = userMessage.toLowerCase();
  
  // Air quality related
  if (message.includes('air') || message.includes('purifier') || message.includes('filter')) {
    return [
      {
        id: '1',
        name: 'LEVOIT Air Purifier for Home Large Room',
        description: 'H13 True HEPA air purifier with activated carbon filter',
        price: '$200-$300',
        rating: 4.5,
        category: 'Air Quality',
        amazonUrl: 'https://amazon.com/s?k=LEVOIT+air+purifier+large+room',
        benefits: [
          'Removes 99.97% of particles 0.3 microns and larger',
          'Reduces odors and chemical pollutants',
          'Quiet operation suitable for bedrooms'
        ],
        considerations: [
          'Filter replacement costs',
          'Room size limitations',
          'Initial investment required'
        ],
        suitability: 'Beginner'
      }
    ];
  }
  
  // Humidity related
  if (message.includes('humidity') || message.includes('humidifier') || message.includes('dry')) {
    return [
      {
        id: '2',
        name: 'AIRCARE Whole-House Humidifier',
        description: 'Evaporative humidifier for large spaces',
        price: '$150-$250',
        rating: 4.3,
        category: 'Humidity Control',
        amazonUrl: 'https://amazon.com/s?k=AIRCARE+whole+house+humidifier',
        benefits: [
          'Covers up to 2,400 square feet',
          'Natural evaporation process',
          'Helps with dry skin and respiratory comfort'
        ],
        considerations: [
          'Requires regular maintenance',
          'Uses replacement filters',
          'May increase room temperature slightly'
        ],
        suitability: 'Intermediate'
      }
    ];
  }
  
  // Mold testing
  if (message.includes('mold') || message.includes('test') || message.includes('detection')) {
    return [
      {
        id: '3',
        name: 'Mold Test Kit by Immunolytics',
        description: 'Professional-grade mold testing kit for home use',
        price: '$25-$40',
        rating: 4.2,
        category: 'Testing Equipment',
        amazonUrl: 'https://amazon.com/s?k=mold+test+kit+immunolytics',
        benefits: [
          'Laboratory analysis included',
          'Tests for multiple mold types',
          'Easy collection process'
        ],
        considerations: [
          'Shipping time for results',
          'Additional costs for extra tests',
          'Requires careful sample collection'
        ],
        suitability: 'Beginner'
      }
    ];
  }
  
  // Default recommendations
  return [
    {
      id: '4',
      name: 'Hypoallergenic Bedding Set',
      description: 'Bamboo fiber sheets and pillowcases',
      price: '$50-$100',
      rating: 4.4,
      category: 'Bedding',
      amazonUrl: 'https://amazon.com/s?k=hypoallergenic+bamboo+bedding',
      benefits: [
        'Naturally antimicrobial',
        'Moisture-wicking properties',
        'Soft and comfortable for sensitive skin'
      ],
      considerations: [
        'May require special washing instructions',
        'Initial cost higher than conventional bedding',
        'Color options may be limited'
      ],
      suitability: 'Beginner'
    }
  ];
}