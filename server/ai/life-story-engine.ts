import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY || '' });

export interface LifeStoryContext {
  character: {
    name: string;
    age: number;
    occupation: string;
    personality: string[];
    lifePhase: string;
    currentSituation: string;
  };
  relationships: {
    spouse?: any;
    children: any[];
    friends: any[];
    family: any[];
  };
  lifestyle: {
    housing: any;
    financial: any;
    career: any;
    goals: any[];
  };
  worldState: {
    year: number;
    aiIntegration: number;
    personalChoices: string[];
    majorEvents: string[];
  };
  preferences: {
    storyThemes: string[];
    complexityLevel: 'simple' | 'moderate' | 'complex';
    contentRating: 'family' | 'mature';
  };
}

export interface GeneratedStory {
  id: string;
  title: string;
  chapter: string;
  content: string;
  choices: StoryChoice[];
  consequences: StoryConsequence[];
  imagePrompt: string;
  emotionalTone: string;
  storyType: 'daily_life' | 'relationship' | 'career' | 'crisis' | 'milestone' | 'discovery';
  estimatedDuration: number; // minutes to read/play
  continuesFrom?: string;
  leadsTo?: string[];
}

export interface StoryChoice {
  id: string;
  text: string;
  description: string;
  requirements?: {
    skills?: { [skill: string]: number };
    relationships?: { [person: string]: number };
    resources?: { [resource: string]: number };
  };
  consequences: StoryConsequence[];
  personalityAlignment: string[];
  difficulty: 'easy' | 'moderate' | 'hard' | 'extreme';
}

export interface StoryConsequence {
  type: 'immediate' | 'short_term' | 'long_term';
  category: 'relationship' | 'career' | 'financial' | 'health' | 'personal_growth' | 'world_state';
  impact: number; // -100 to 100
  description: string;
  affectedEntities: string[];
  unlocks?: string[];
  blocks?: string[];
}

export class LifeStoryEngine {
  static async generatePersonalStory(context: LifeStoryContext): Promise<GeneratedStory> {
    try {
      const prompt = this.buildStoryPrompt(context);
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          systemInstruction: this.getSystemInstruction(),
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              title: { type: "string" },
              chapter: { type: "string" },
              content: { type: "string" },
              choices: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    text: { type: "string" },
                    description: { type: "string" },
                    consequences: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          type: { type: "string" },
                          category: { type: "string" },
                          impact: { type: "number" },
                          description: { type: "string" }
                        }
                      }
                    },
                    difficulty: { type: "string" }
                  }
                }
              },
              imagePrompt: { type: "string" },
              emotionalTone: { type: "string" },
              storyType: { type: "string" }
            },
            required: ["title", "content", "choices", "imagePrompt", "storyType"]
          }
        },
        contents: prompt
      });

      const storyData = JSON.parse(response.text || '{}');
      
      return {
        id: `story_${Date.now()}`,
        title: storyData.title,
        chapter: storyData.chapter || `Chapter ${Math.floor(Math.random() * 50) + 1}`,
        content: storyData.content,
        choices: storyData.choices.map((choice: any, index: number) => ({
          id: `choice_${index}`,
          text: choice.text,
          description: choice.description,
          consequences: choice.consequences || [],
          personalityAlignment: this.determinePersonalityAlignment(choice.text),
          difficulty: choice.difficulty || 'moderate'
        })),
        consequences: [],
        imagePrompt: storyData.imagePrompt,
        emotionalTone: storyData.emotionalTone || 'neutral',
        storyType: storyData.storyType || 'daily_life',
        estimatedDuration: Math.floor(storyData.content.length / 200) + 2
      };
      
    } catch (error) {
      console.error('AI story generation failed:', error);
      return this.generateFallbackStory(context);
    }
  }

  static async generateContinuationStory(
    previousStory: GeneratedStory,
    chosenChoice: StoryChoice,
    context: LifeStoryContext
  ): Promise<GeneratedStory> {
    const continuationPrompt = `
Continue the story from where it left off. Previous story: "${previousStory.title}"
The character chose: "${chosenChoice.text}"

Context: ${JSON.stringify(context, null, 2)}

Generate the next chapter of their personal story, showing the consequences of their choice and introducing new challenges or opportunities.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          systemInstruction: this.getSystemInstruction(),
          responseMimeType: "application/json"
        },
        contents: continuationPrompt
      });

      const continuationData = JSON.parse(response.text || '{}');
      
      return {
        id: `story_${Date.now()}`,
        title: continuationData.title,
        chapter: `${previousStory.chapter} - Continued`,
        content: continuationData.content,
        choices: continuationData.choices || [],
        consequences: chosenChoice.consequences,
        imagePrompt: continuationData.imagePrompt,
        emotionalTone: continuationData.emotionalTone || 'neutral',
        storyType: previousStory.storyType,
        estimatedDuration: Math.floor(continuationData.content.length / 200) + 2,
        continuesFrom: previousStory.id
      };
      
    } catch (error) {
      console.error('AI continuation generation failed:', error);
      return this.generateFallbackStory(context);
    }
  }

  static async generateMilestoneStory(
    milestoneType: 'marriage' | 'birth' | 'career_change' | 'death' | 'achievement',
    context: LifeStoryContext
  ): Promise<GeneratedStory> {
    const milestonePrompts = {
      marriage: 'Generate a deeply personal story about getting married in 2035',
      birth: 'Create a touching story about welcoming a new child into the world',
      career_change: 'Tell a story about a major career transition and its impact',
      death: 'Write a meaningful story about loss and remembrance',
      achievement: 'Create a story celebrating a major personal achievement'
    };

    const prompt = `
${milestonePrompts[milestoneType]}

Character context: ${JSON.stringify(context.character, null, 2)}
Relationships: ${JSON.stringify(context.relationships, null, 2)}

Create a story that feels personal and authentic to this character's life, incorporating their relationships and personality traits.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt
      });

      return {
        id: `milestone_${milestoneType}_${Date.now()}`,
        title: `Life Milestone: ${milestoneType.replace('_', ' ').toUpperCase()}`,
        chapter: `Special Moment`,
        content: response.text || 'A significant moment in your life unfolds...',
        choices: [
          {
            id: 'reflect',
            text: 'Take time to reflect on this moment',
            description: 'Process the emotions and significance of this milestone',
            consequences: [{
              type: 'immediate',
              category: 'personal_growth',
              impact: 20,
              description: 'Gained wisdom and emotional insight',
              affectedEntities: ['character']
            }],
            personalityAlignment: ['Thoughtful', 'Introspective'],
            difficulty: 'easy'
          },
          {
            id: 'celebrate',
            text: 'Celebrate with loved ones',
            description: 'Share this moment with the people who matter most',
            consequences: [{
              type: 'immediate',
              category: 'relationship',
              impact: 15,
              description: 'Strengthened bonds with family and friends',
              affectedEntities: ['relationships']
            }],
            personalityAlignment: ['Social', 'Grateful'],
            difficulty: 'easy'
          }
        ],
        consequences: [],
        imagePrompt: `${milestoneType} milestone moment, emotional and meaningful, 2035 setting`,
        emotionalTone: 'uplifting',
        storyType: 'milestone',
        estimatedDuration: 5
      };
      
    } catch (error) {
      console.error('AI milestone story generation failed:', error);
      return this.generateFallbackStory(context);
    }
  }

  private static buildStoryPrompt(context: LifeStoryContext): string {
    return `
Generate a unique, personal story for this character living in 2035:

CHARACTER PROFILE:
- Name: ${context.character.name}
- Age: ${context.character.age}
- Occupation: ${context.character.occupation}
- Personality: ${context.character.personality.join(', ')}
- Life Phase: ${context.character.lifePhase}
- Current Situation: ${context.character.currentSituation}

RELATIONSHIPS:
- Spouse: ${context.relationships.spouse ? context.relationships.spouse.name : 'None'}
- Children: ${context.relationships.children.length} children
- Close Friends: ${context.relationships.friends.length} friends

LIFESTYLE:
- Housing: ${context.lifestyle.housing?.type || 'Unknown'}
- Financial Status: ${context.lifestyle.financial?.status || 'Stable'}
- Career Satisfaction: ${context.lifestyle.career?.satisfaction || 50}/100

WORLD CONTEXT:
- Year: ${context.worldState.year}
- AI Integration Level: ${context.worldState.aiIntegration}/100
- Recent Personal Choices: ${context.worldState.personalChoices.join(', ')}

STORY REQUIREMENTS:
1. Create a story that feels authentic to this character's life and circumstances
2. Include realistic challenges and opportunities they might face
3. Set in the 2035 world with AI integration themes
4. Incorporate their personality traits and relationships
5. Provide 3-4 meaningful choices that could impact their life path
6. Include consequences that matter for character development

The story should be 300-500 words and feel like a real moment in this person's life, not a generic adventure.
    `;
  }

  private static getSystemInstruction(): string {
    return `
You are an advanced AI storyteller specializing in generating deeply personal, realistic life stories set in 2035. Your stories should:

1. Feel authentic and relatable to real human experiences
2. Incorporate modern themes like AI integration, climate change, technology
3. Respect the character's established personality and relationships
4. Provide meaningful choices that impact character development
5. Avoid clichés and generic adventure tropes
6. Focus on emotional depth and personal growth
7. Include realistic consequences for actions
8. Maintain consistency with the 2035 world setting

Story types to focus on:
- Daily life challenges and opportunities
- Relationship dynamics and growth
- Career decisions and workplace situations
- Family moments and milestones
- Personal crises and breakthroughs
- Community involvement and social issues

Always generate stories that honor the character's unique circumstances and provide genuine opportunities for personal development.
    `;
  }

  private static determinePersonalityAlignment(choiceText: string): string[] {
    const alignments: { [key: string]: string[] } = {
      'help': ['Compassionate', 'Altruistic', 'Community-minded'],
      'lead': ['Leadership', 'Confident', 'Responsible'],
      'listen': ['Empathetic', 'Patient', 'Understanding'],
      'create': ['Creative', 'Innovative', 'Artistic'],
      'analyze': ['Analytical', 'Logical', 'Methodical'],
      'risk': ['Adventurous', 'Bold', 'Risk-taking'],
      'safe': ['Cautious', 'Practical', 'Conservative'],
      'social': ['Social', 'Outgoing', 'Collaborative'],
      'alone': ['Independent', 'Self-reliant', 'Introspective']
    };

    const lowerChoice = choiceText.toLowerCase();
    for (const [keyword, traits] of Object.entries(alignments)) {
      if (lowerChoice.includes(keyword)) {
        return traits;
      }
    }
    
    return ['Balanced', 'Thoughtful'];
  }

  private static generateFallbackStory(context: LifeStoryContext): GeneratedStory {
    const fallbackStories = [
      {
        title: "A Moment of Reflection",
        content: `As ${context.character.name} sits in their favorite spot, they notice how much their life has changed. The world of 2035 offers both opportunities and challenges that previous generations never imagined. Today feels different somehow - like a turning point waiting to happen.`,
        type: 'daily_life' as const
      },
      {
        title: "An Unexpected Conversation",
        content: `${context.character.name} encounters someone who challenges their perspective on life in the AI-integrated world. The conversation that follows could change everything they thought they knew about their path forward.`,
        type: 'relationship' as const
      },
      {
        title: "A New Opportunity",
        content: `A chance encounter presents ${context.character.name} with an unexpected opportunity. In a world where human-AI collaboration defines success, this moment could be the catalyst for significant change in their life.`,
        type: 'career' as const
      }
    ];

    const selectedStory = fallbackStories[Math.floor(Math.random() * fallbackStories.length)];

    return {
      id: `fallback_${Date.now()}`,
      title: selectedStory.title,
      chapter: "Personal Moment",
      content: selectedStory.content,
      choices: [
        {
          id: 'embrace',
          text: 'Embrace the moment',
          description: 'Open yourself to new possibilities',
          consequences: [{
            type: 'immediate',
            category: 'personal_growth',
            impact: 10,
            description: 'Gained confidence and openness',
            affectedEntities: ['character']
          }],
          personalityAlignment: ['Open-minded', 'Optimistic'],
          difficulty: 'easy'
        },
        {
          id: 'cautious',
          text: 'Proceed cautiously',
          description: 'Take time to consider all implications',
          consequences: [{
            type: 'immediate',
            category: 'personal_growth',
            impact: 5,
            description: 'Gained wisdom through careful consideration',
            affectedEntities: ['character']
          }],
          personalityAlignment: ['Prudent', 'Analytical'],
          difficulty: 'moderate'
        }
      ],
      consequences: [],
      imagePrompt: "Person in contemplative moment, 2035 setting, thoughtful atmosphere",
      emotionalTone: 'contemplative',
      storyType: selectedStory.type,
      estimatedDuration: 3
    };
  }
}

export async function analyzeStoryImpact(
  story: GeneratedStory,
  choice: StoryChoice,
  context: LifeStoryContext
): Promise<{
  personalityGrowth: { [trait: string]: number };
  relationshipChanges: { [person: string]: number };
  lifePathShifts: string[];
  futureStorySeeds: string[];
}> {
  try {
    const prompt = `
Analyze the long-term impact of this story choice:

Story: ${story.title}
Choice: ${choice.text}
Character: ${JSON.stringify(context.character)}

Determine:
1. How this choice affects personality development
2. Changes to relationships
3. Shifts in life direction
4. Seeds for future stories

Return as JSON with specific metrics and descriptions.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json"
      },
      contents: prompt
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('Story impact analysis failed:', error);
    return {
      personalityGrowth: {},
      relationshipChanges: {},
      lifePathShifts: [],
      futureStorySeeds: []
    };
  }
}