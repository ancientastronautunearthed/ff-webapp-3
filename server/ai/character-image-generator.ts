import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY || '' });

export interface CharacterProfile {
  id: string;
  name: string;
  age: number;
  personality: string[];
  occupation?: string;
  description?: string;
  type: 'player' | 'npc' | 'relationship' | 'child' | 'spouse';
}

export interface SceneContext {
  type: 'marriage' | 'birth' | 'purchase' | 'career' | 'milestone' | 'relationship' | 'daily_life';
  characters: CharacterProfile[];
  location: string;
  emotionalTone: string;
  description: string;
  keyElements: string[];
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  type: 'portrait' | 'scene';
  characterId?: string;
  sceneType?: string;
  timestamp: Date;
  metadata: {
    style: string;
    quality: string;
    resolution: string;
  };
}

export class CharacterImageGenerator {
  static async generateCharacterPortrait(character: CharacterProfile): Promise<GeneratedImage> {
    try {
      const prompt = this.buildCharacterPrompt(character);
      
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseModalities: ["TEXT", "IMAGE"]
        }
      });

      // Extract image from response
      const imageData = this.extractImageFromResponse(response);
      
      if (imageData) {
        const imageUrl = await this.saveGeneratedImage(imageData, character.id, 'portrait');
        
        return {
          id: `portrait_${character.id}_${Date.now()}`,
          url: imageUrl,
          prompt,
          type: 'portrait',
          characterId: character.id,
          timestamp: new Date(),
          metadata: {
            style: '2035 realistic portrait',
            quality: 'high',
            resolution: '512x512'
          }
        };
      }
      
      throw new Error('No image generated');
      
    } catch (error) {
      console.error('Character portrait generation failed:', error);
      return this.generateFallbackPortrait(character);
    }
  }

  static async generateSceneImage(scene: SceneContext): Promise<GeneratedImage> {
    try {
      const prompt = this.buildScenePrompt(scene);
      
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseModalities: ["TEXT", "IMAGE"]
        }
      });

      const imageData = this.extractImageFromResponse(response);
      
      if (imageData) {
        const imageUrl = await this.saveGeneratedImage(imageData, `scene_${scene.type}`, 'scene');
        
        return {
          id: `scene_${scene.type}_${Date.now()}`,
          url: imageUrl,
          prompt,
          type: 'scene',
          sceneType: scene.type,
          timestamp: new Date(),
          metadata: {
            style: '2035 cinematic scene',
            quality: 'high',
            resolution: '768x512'
          }
        };
      }
      
      throw new Error('No scene image generated');
      
    } catch (error) {
      console.error('Scene image generation failed:', error);
      return this.generateFallbackScene(scene);
    }
  }

  private static buildCharacterPrompt(character: CharacterProfile): string {
    const basePrompt = `Create a realistic portrait of ${character.name}, a ${character.age}-year-old person in 2035. `;
    
    let personalityDescription = '';
    if (character.personality.length > 0) {
      personalityDescription = `They have a ${character.personality.join(', ').toLowerCase()} personality. `;
    }
    
    let occupationDescription = '';
    if (character.occupation) {
      occupationDescription = `They work as a ${character.occupation}. `;
    }
    
    const stylePrompt = `
Portrait style: Professional headshot, warm lighting, slight smile, direct eye contact with camera.
Setting: Subtle 2035 background with soft bokeh effect, hints of advanced technology.
Art style: Photorealistic, high quality, detailed facial features, natural skin texture.
Clothing: Modern professional attire appropriate for 2035, clean and contemporary.
Lighting: Soft natural lighting from the side, creating gentle shadows and depth.
Camera: Shot with a professional camera, shallow depth of field, sharp focus on face.
Mood: Confident, approachable, and optimistic about the future.
`;

    return basePrompt + personalityDescription + occupationDescription + stylePrompt;
  }

  private static buildScenePrompt(scene: SceneContext): string {
    const basePrompt = `Create a cinematic scene capturing ${scene.description} in 2035. `;
    
    let charactersDescription = '';
    if (scene.characters.length > 0) {
      charactersDescription = `Characters involved: ${scene.characters.map(c => 
        `${c.name} (${c.age} years old, ${c.personality.join(', ').toLowerCase()})`
      ).join(', ')}. `;
    }
    
    const locationDescription = `Setting: ${scene.location}. `;
    const emotionalDescription = `Emotional tone: ${scene.emotionalTone}. `;
    
    let keyElementsDescription = '';
    if (scene.keyElements.length > 0) {
      keyElementsDescription = `Key elements to include: ${scene.keyElements.join(', ')}. `;
    }

    const sceneSpecificPrompts = {
      marriage: `Wedding ceremony scene with joy and celebration, elegant venue with 2035 technology integration, beautiful lighting, family and friends celebrating.`,
      birth: `Hospital or home setting, tender moment with new parents, soft warm lighting, medical technology visible but subtle, emotions of joy and wonder.`,
      purchase: `Property viewing or key handover scene, modern 2035 architecture, smart home features visible, excitement and achievement emotions.`,
      career: `Professional workplace in 2035, advanced technology, collaborative environment, sense of accomplishment and progress.`,
      milestone: `Significant life moment, celebratory atmosphere, meaningful location, sense of achievement and growth.`,
      relationship: `Intimate moment between characters, natural setting or cozy indoor space, genuine emotions, connection and warmth.`,
      daily_life: `Everyday scene in 2035, blend of technology and humanity, realistic daily activities, comfortable and relatable atmosphere.`
    };

    const stylePrompt = `
Art style: Cinematic realism, high quality digital art, detailed and immersive.
Composition: Wide shot or medium shot showing the full scene context.
Lighting: Dramatic but natural lighting appropriate for the scene mood.
Colors: Rich and vibrant palette that enhances the emotional tone.
Atmosphere: 2035 setting with advanced but human-friendly technology integration.
Quality: Professional photography quality, sharp details, good depth of field.
`;

    return basePrompt + charactersDescription + locationDescription + emotionalDescription + 
           keyElementsDescription + (sceneSpecificPrompts[scene.type] || '') + stylePrompt;
  }

  private static extractImageFromResponse(response: any): Buffer | null {
    try {
      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) return null;

      const content = candidates[0].content;
      if (!content || !content.parts) return null;

      for (const part of content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return Buffer.from(part.inlineData.data, 'base64');
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting image from response:', error);
      return null;
    }
  }

  private static async saveGeneratedImage(
    imageData: Buffer, 
    identifier: string, 
    type: 'portrait' | 'scene'
  ): Promise<string> {
    try {
      // In a real implementation, this would save to Firebase Storage or similar
      // For development, we'll create a virtual URL that represents the saved image
      
      const timestamp = Date.now();
      const filename = `${type}_${identifier}_${timestamp}.png`;
      const virtualUrl = `/generated-images/${filename}`;
      
      // Simulate saving process
      console.log(`Generated image saved: ${filename} (${imageData.length} bytes)`);
      
      return virtualUrl;
      
    } catch (error) {
      console.error('Error saving generated image:', error);
      throw error;
    }
  }

  private static generateFallbackPortrait(character: CharacterProfile): GeneratedImage {
    // Create a consistent fallback based on character properties
    const hash = this.simpleHash(character.name + character.age);
    const avatarStyle = ['geometric', 'abstract', 'minimalist'][hash % 3];
    const colorScheme = ['blue', 'green', 'purple', 'orange', 'teal'][hash % 5];
    
    return {
      id: `fallback_portrait_${character.id}_${Date.now()}`,
      url: `/fallback-avatars/${avatarStyle}-${colorScheme}-${hash % 100}.svg`,
      prompt: `Fallback portrait for ${character.name}`,
      type: 'portrait',
      characterId: character.id,
      timestamp: new Date(),
      metadata: {
        style: 'fallback geometric avatar',
        quality: 'standard',
        resolution: '256x256'
      }
    };
  }

  private static generateFallbackScene(scene: SceneContext): GeneratedImage {
    const sceneImages = {
      marriage: '/fallback-scenes/wedding-celebration.jpg',
      birth: '/fallback-scenes/new-baby.jpg',
      purchase: '/fallback-scenes/new-home.jpg',
      career: '/fallback-scenes/professional-success.jpg',
      milestone: '/fallback-scenes/achievement.jpg',
      relationship: '/fallback-scenes/connection.jpg',
      daily_life: '/fallback-scenes/2035-daily.jpg'
    };

    return {
      id: `fallback_scene_${scene.type}_${Date.now()}`,
      url: sceneImages[scene.type] || '/fallback-scenes/default.jpg',
      prompt: `Fallback scene for ${scene.type}`,
      type: 'scene',
      sceneType: scene.type,
      timestamp: new Date(),
      metadata: {
        style: 'fallback illustration',
        quality: 'standard',
        resolution: '600x400'
      }
    };
  }

  private static simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Batch generation for multiple characters
  static async generateMultiplePortraits(characters: CharacterProfile[]): Promise<GeneratedImage[]> {
    const portraits: GeneratedImage[] = [];
    
    // Generate portraits with a small delay to avoid rate limiting
    for (const character of characters) {
      try {
        const portrait = await this.generateCharacterPortrait(character);
        portraits.push(portrait);
        
        // Small delay between generations
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Failed to generate portrait for ${character.name}:`, error);
        const fallback = this.generateFallbackPortrait(character);
        portraits.push(fallback);
      }
    }
    
    return portraits;
  }

  // Get or generate character portrait
  static async getCharacterPortrait(
    character: CharacterProfile, 
    existingPortraits: Map<string, GeneratedImage>
  ): Promise<GeneratedImage> {
    // Check if we already have a portrait for this character
    const existing = existingPortraits.get(character.id);
    if (existing) {
      return existing;
    }
    
    // Generate new portrait
    const newPortrait = await this.generateCharacterPortrait(character);
    existingPortraits.set(character.id, newPortrait);
    
    return newPortrait;
  }
}