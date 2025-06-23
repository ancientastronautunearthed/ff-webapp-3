import { Router } from 'express';
import { GoogleGenAI, Modality } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const aiImageRoutes = Router();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY || '' });

aiImageRoutes.post('/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('Generating AI companion image with prompt:', prompt);

    // Generate image using Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation',
      contents: [{ 
        role: 'user', 
        parts: [{ text: prompt }] 
      }],
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('No image generated');
    }

    const content = candidates[0].content;
    if (!content || !content.parts) {
      throw new Error('No content parts in response');
    }

    // Find the image part
    let imageData: Buffer | null = null;
    for (const part of content.parts) {
      if (part.inlineData && part.inlineData.data) {
        imageData = Buffer.from(part.inlineData.data, 'base64');
        break;
      }
    }

    if (!imageData) {
      throw new Error('No image data found in response');
    }

    // Save image to a temporary location and return URL
    // In production, you'd upload to Firebase Storage or similar
    const imageId = uuidv4();
    const fileName = `companion-${imageId}.png`;
    const imagePath = path.join(process.cwd(), 'public', 'temp', fileName);
    
    // Ensure temp directory exists
    const tempDir = path.join(process.cwd(), 'public', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    fs.writeFileSync(imagePath, imageData);
    
    const imageUrl = `/temp/${fileName}`;
    
    console.log('AI companion image generated successfully:', imageUrl);

    res.json({ 
      imageUrl,
      success: true,
      message: 'AI companion image generated successfully'
    });

  } catch (error) {
    console.error('Error generating AI companion image:', error);
    res.status(500).json({ 
      error: 'Failed to generate companion image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Endpoint to upload generated image to Firebase Storage (for production)
aiImageRoutes.post('/save-companion-image', async (req, res) => {
  try {
    const { imageUrl, userId, companionConfig } = req.body;

    // Here you would:
    // 1. Read the temporary image file
    // 2. Upload to Firebase Storage
    // 3. Save companion config to Firestore
    // 4. Return the permanent Firebase Storage URL

    // For now, just return the temporary URL
    res.json({ 
      permanentUrl: imageUrl,
      success: true 
    });

  } catch (error) {
    console.error('Error saving companion image:', error);
    res.status(500).json({ 
      error: 'Failed to save companion image'
    });
  }
});