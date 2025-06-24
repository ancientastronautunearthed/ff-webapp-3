import { Router } from 'express';
import { CharacterImageGenerator, CharacterProfile, SceneContext } from '../ai/character-image-generator';

export const characterImagesRoutes = Router();

// Generate character portrait
characterImagesRoutes.post('/generate-portrait', async (req, res) => {
  try {
    const { character } = req.body;
    
    if (!character || !character.name) {
      return res.status(400).json({ error: 'Character data with name is required' });
    }

    const characterProfile: CharacterProfile = {
      id: character.id || `char_${Date.now()}`,
      name: character.name,
      age: character.age || 25,
      personality: character.personality || ['Friendly'],
      occupation: character.occupation,
      description: character.description,
      type: character.type || 'player'
    };

    const generatedImage = await CharacterImageGenerator.generateCharacterPortrait(characterProfile);
    
    res.json({
      success: true,
      image: generatedImage,
      character: characterProfile
    });
    
  } catch (error) {
    console.error('Portrait generation error:', error);
    res.status(500).json({ error: 'Failed to generate character portrait' });
  }
});

// Generate scene image
characterImagesRoutes.post('/generate-scene', async (req, res) => {
  try {
    const { scene } = req.body;
    
    if (!scene || !scene.type || !scene.description) {
      return res.status(400).json({ error: 'Scene data with type and description is required' });
    }

    const sceneContext: SceneContext = {
      type: scene.type,
      characters: scene.characters || [],
      location: scene.location || '2035 setting',
      emotionalTone: scene.emotionalTone || 'positive',
      description: scene.description,
      keyElements: scene.keyElements || []
    };

    const generatedImage = await CharacterImageGenerator.generateSceneImage(sceneContext);
    
    res.json({
      success: true,
      image: generatedImage,
      scene: sceneContext
    });
    
  } catch (error) {
    console.error('Scene generation error:', error);
    res.status(500).json({ error: 'Failed to generate scene image' });
  }
});

// Batch generate portraits for multiple characters
characterImagesRoutes.post('/generate-multiple-portraits', async (req, res) => {
  try {
    const { characters } = req.body;
    
    if (!Array.isArray(characters) || characters.length === 0) {
      return res.status(400).json({ error: 'Array of characters is required' });
    }

    const characterProfiles: CharacterProfile[] = characters.map(char => ({
      id: char.id || `char_${Date.now()}_${Math.random()}`,
      name: char.name,
      age: char.age || 25,
      personality: char.personality || ['Friendly'],
      occupation: char.occupation,
      description: char.description,
      type: char.type || 'npc'
    }));

    const generatedImages = await CharacterImageGenerator.generateMultiplePortraits(characterProfiles);
    
    res.json({
      success: true,
      images: generatedImages,
      count: generatedImages.length
    });
    
  } catch (error) {
    console.error('Multiple portraits generation error:', error);
    res.status(500).json({ error: 'Failed to generate multiple character portraits' });
  }
});

// Get existing portrait or generate new one
characterImagesRoutes.post('/get-or-generate-portrait', async (req, res) => {
  try {
    const { character, existingPortraits } = req.body;
    
    if (!character) {
      return res.status(400).json({ error: 'Character data is required' });
    }

    const characterProfile: CharacterProfile = {
      id: character.id || `char_${Date.now()}`,
      name: character.name,
      age: character.age || 25,
      personality: character.personality || ['Friendly'],
      occupation: character.occupation,
      type: character.type || 'player'
    };

    // Convert existing portraits array to Map
    const portraitMap = new Map();
    if (existingPortraits && Array.isArray(existingPortraits)) {
      existingPortraits.forEach((portrait: any) => {
        if (portrait.characterId) {
          portraitMap.set(portrait.characterId, portrait);
        }
      });
    }

    const portrait = await CharacterImageGenerator.getCharacterPortrait(characterProfile, portraitMap);
    
    res.json({
      success: true,
      image: portrait,
      wasGenerated: !portraitMap.has(characterProfile.id)
    });
    
  } catch (error) {
    console.error('Get or generate portrait error:', error);
    res.status(500).json({ error: 'Failed to get or generate character portrait' });
  }
});

// Generate relationship milestone scene
characterImagesRoutes.post('/generate-milestone-scene', async (req, res) => {
  try {
    const { milestoneType, characters, context } = req.body;
    
    const sceneDescriptions = {
      marriage: 'Wedding ceremony with beautiful decorations and joyful celebration',
      birth: 'Hospital room or home setting with new parents welcoming their baby',
      purchase: 'Key handover moment at new property with excitement and achievement',
      career: 'Professional achievement moment in modern 2035 workplace',
      achievement: 'Personal milestone celebration with sense of accomplishment'
    };

    const sceneContext: SceneContext = {
      type: milestoneType,
      characters: characters || [],
      location: context?.location || 'Appropriate 2035 setting',
      emotionalTone: context?.emotionalTone || 'joyful',
      description: sceneDescriptions[milestoneType as keyof typeof sceneDescriptions] || 
                   'Significant life milestone moment',
      keyElements: context?.keyElements || []
    };

    const generatedImage = await CharacterImageGenerator.generateSceneImage(sceneContext);
    
    res.json({
      success: true,
      image: generatedImage,
      milestoneType,
      scene: sceneContext
    });
    
  } catch (error) {
    console.error('Milestone scene generation error:', error);
    res.status(500).json({ error: 'Failed to generate milestone scene' });
  }
});

// Generate family portrait
characterImagesRoutes.post('/generate-family-portrait', async (req, res) => {
  try {
    const { familyMembers, setting } = req.body;
    
    if (!familyMembers || !Array.isArray(familyMembers)) {
      return res.status(400).json({ error: 'Family members array is required' });
    }

    const sceneContext: SceneContext = {
      type: 'relationship',
      characters: familyMembers.map((member: any) => ({
        id: member.id,
        name: member.name,
        age: member.age,
        personality: member.personality || ['Loving'],
        type: member.relationship || 'family'
      })),
      location: setting || 'Comfortable family home',
      emotionalTone: 'warm and loving',
      description: 'Family portrait showing the close bonds between family members',
      keyElements: ['family togetherness', 'warm lighting', 'comfortable setting']
    };

    const generatedImage = await CharacterImageGenerator.generateSceneImage(sceneContext);
    
    res.json({
      success: true,
      image: generatedImage,
      familySize: familyMembers.length
    });
    
  } catch (error) {
    console.error('Family portrait generation error:', error);
    res.status(500).json({ error: 'Failed to generate family portrait' });
  }
});