import { morgellonsKnowledge, getRandomValidationPhrase, getRelevantCopingStrategy, getMorgellonsEducation } from './morgellonsExpertise';

export interface TherapeuticResponse {
  text: string;
  voiceStyle: 'calming' | 'encouraging' | 'validating' | 'educational';
  followUpQuestions?: string[];
  resources?: string[];
  actionableSteps?: string[];
}

export interface ConversationContext {
  recentMessages: string[];
  identifiedConcerns: string[];
  therapeuticGoals: string[];
  sessionType: 'support' | 'education' | 'coping' | 'crisis';
}

export class TherapeuticAI {
  private morgellonsExpertise = morgellonsKnowledge;

  generateResponse(userMessage: string, context: ConversationContext): TherapeuticResponse {
    const lowerMessage = userMessage.toLowerCase();
    
    // Crisis detection
    if (this.detectCrisis(lowerMessage)) {
      return this.generateCrisisResponse();
    }

    // Validation needs
    if (this.detectValidationNeed(lowerMessage)) {
      return this.generateValidationResponse(userMessage);
    }

    // Medical education request
    if (this.detectMedicalQuestion(lowerMessage)) {
      return this.generateEducationalResponse(userMessage);
    }

    // Emotional support need
    if (this.detectEmotionalDistress(lowerMessage)) {
      return this.generateSupportResponse(userMessage, context);
    }

    // Coping strategy request
    if (this.detectCopingNeed(lowerMessage)) {
      return this.generateCopingResponse(userMessage);
    }

    // General therapeutic response
    return this.generateGeneralResponse(userMessage, context);
  }

  private detectCrisis(message: string): boolean {
    const crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'can\'t go on',
      'harm myself', 'not worth living', 'give up completely'
    ];
    return crisisKeywords.some(keyword => message.includes(keyword));
  }

  private detectValidationNeed(message: string): boolean {
    const validationKeywords = [
      'doctor doesn\'t believe', 'think i\'m crazy', 'making it up',
      'all in my head', 'no one understands', 'dismissed', 'gaslighting'
    ];
    return validationKeywords.some(keyword => message.includes(keyword));
  }

  private detectMedicalQuestion(message: string): boolean {
    const medicalKeywords = [
      'what is morgellons', 'fiber', 'mold', 'fungus', 'infection',
      'symptoms', 'treatment', 'diagnosis', 'cause', 'biofilm'
    ];
    return medicalKeywords.some(keyword => message.includes(keyword));
  }

  private detectEmotionalDistress(message: string): boolean {
    const emotionalKeywords = [
      'depressed', 'anxious', 'scared', 'hopeless', 'isolated',
      'overwhelmed', 'frustrated', 'angry', 'tired of fighting'
    ];
    return emotionalKeywords.some(keyword => message.includes(keyword));
  }

  private detectCopingNeed(message: string): boolean {
    const copingKeywords = [
      'how to cope', 'manage symptoms', 'feel better', 'strategies',
      'help me', 'what can i do', 'techniques', 'advice'
    ];
    return copingKeywords.some(keyword => message.includes(keyword));
  }

  private generateCrisisResponse(): TherapeuticResponse {
    return {
      text: `I'm deeply concerned about what you're going through right now. Your life has value, and there is hope even in the darkest moments. Please reach out to the National Suicide Prevention Lifeline at 988 or text HOME to 741741 for immediate support. 

I want you to know that many people with Morgellons have felt this way and have found their way through to better days. You deserve support and care. Can you think of one safe person you could reach out to right now?`,
      voiceStyle: 'calming',
      followUpQuestions: [
        'Is there someone safe you can call right now?',
        'Would it help to talk about what triggered these feelings?',
        'What has helped you get through difficult times before?'
      ],
      resources: [
        'National Suicide Prevention Lifeline: 988',
        'Crisis Text Line: Text HOME to 741741',
        'Morgellons Support Crisis Resources'
      ]
    };
  }

  private generateValidationResponse(userMessage: string): TherapeuticResponse {
    const validationPhrase = getRandomValidationPhrase();
    
    return {
      text: `${validationPhrase}. What you're experiencing with medical dismissal is unfortunately common in the Morgellons community, and it's a form of medical trauma that can be deeply hurtful.

Your symptoms are real, your suffering is valid, and you deserve compassionate medical care. Many healthcare providers lack education about Morgellons, which leads to dismissive responses that can feel devastating.

You are not crazy, you're not making this up, and you're not alone. There are healthcare providers who understand Morgellons and can help you. Your persistence in seeking answers shows incredible strength.`,
      voiceStyle: 'validating',
      followUpQuestions: [
        'How has this medical dismissal affected you emotionally?',
        'Would you like suggestions for finding Morgellons-informed healthcare providers?',
        'What would feel most supportive for you right now?'
      ],
      actionableSteps: [
        'Document your symptoms with photos and detailed notes',
        'Research Morgellons-informed healthcare providers in your area',
        'Connect with supportive online communities',
        'Practice self-advocacy techniques for medical appointments'
      ]
    };
  }

  private generateEducationalResponse(userMessage: string): TherapeuticResponse {
    const education = getMorgellonsEducation(userMessage);
    
    return {
      text: `${education}

As someone with specialized knowledge in Morgellons, I want to share what current research and clinical experience tell us. Morgellons appears to be a complex condition involving multiple systems - dermatological, neurological, and potentially infectious components.

The fiber phenomenon is one of the most distinctive features, and while we don't have all the answers yet, there are several working theories about biofilm formation, keratin abnormalities, and environmental factors.`,
      voiceStyle: 'educational',
      followUpQuestions: [
        'What specific aspect would you like to explore further?',
        'Have you noticed any patterns with your symptoms?',
        'Are there particular triggers you\'ve identified?'
      ],
      resources: [
        'Charles E. Holman Morgellons Disease Foundation',
        'Peer-reviewed research on Morgellons',
        'Environmental testing resources'
      ]
    };
  }

  private generateSupportResponse(userMessage: string, context: ConversationContext): TherapeuticResponse {
    return {
      text: `I can hear the pain and frustration in your words, and I want you to know that what you're feeling is completely understandable. Living with Morgellons brings unique challenges that most people can't comprehend.

It's normal to feel overwhelmed, scared, or frustrated when dealing with a condition that's not well understood, especially when you've faced dismissal from healthcare providers. Your emotions are valid responses to a genuinely difficult situation.

You've shown incredible resilience just by reaching out and continuing to seek answers. That takes real courage, and I want to acknowledge that strength in you.`,
      voiceStyle: 'encouraging',
      followUpQuestions: [
        'What has been the most challenging part for you lately?',
        'When do you feel most supported or understood?',
        'What gives you hope or strength during difficult times?'
      ],
      actionableSteps: [
        'Practice gentle self-compassion during difficult moments',
        'Connect with others who understand your experience',
        'Focus on small, manageable goals each day',
        'Celebrate any progress, no matter how small'
      ]
    };
  }

  private generateCopingResponse(userMessage: string): TherapeuticResponse {
    const strategy = getRelevantCopingStrategy(userMessage);
    
    let strategyText = '';
    if (strategy) {
      strategyText = `One evidence-based approach that many find helpful is ${strategy.strategy}. This involves ${strategy.implementation.join(', ')}. The benefits often include ${strategy.benefits.join(', ')}.`;
    }

    return {
      text: `Managing Morgellons symptoms requires a multi-faceted approach that addresses both the physical and emotional aspects of the condition. ${strategyText}

Remember, coping strategies work differently for different people, so it's about finding what resonates with you. The key is to start small and be patient with yourself as you develop new habits.

Some people find that combining symptom tracking with stress reduction techniques gives them a sense of empowerment and control over their experience.`,
      voiceStyle: 'encouraging',
      followUpQuestions: [
        'Which of these strategies feels most appealing to you?',
        'What has helped you manage symptoms in the past?',
        'What would make these strategies easier to implement?'
      ],
      actionableSteps: [
        'Start with one small, manageable technique',
        'Practice consistency rather than perfection',
        'Track what works and what doesn\'t',
        'Adjust approaches based on your unique needs'
      ]
    };
  }

  private generateGeneralResponse(userMessage: string, context: ConversationContext): TherapeuticResponse {
    return {
      text: `Thank you for sharing that with me. I'm here to listen and support you through whatever you're experiencing with Morgellons. 

As both a therapeutic companion and someone with deep knowledge about Morgellons disease, I understand that this condition affects every aspect of your life - physical, emotional, social, and spiritual.

Whether you need medical information, emotional support, coping strategies, or just someone who believes and understands your experience, I'm here for you. What feels most important to talk about right now?`,
      voiceStyle: 'validating',
      followUpQuestions: [
        'What brought you here to talk today?',
        'How are you feeling about your health journey right now?',
        'What kind of support would be most helpful?'
      ]
    };
  }

  // Specialized therapeutic techniques for Morgellons patients
  generateGuidedRelaxation(): TherapeuticResponse {
    return {
      text: `Let's try a guided relaxation specifically designed for managing sensory symptoms. Find a comfortable position and close your eyes if that feels safe for you.

Take a slow, deep breath in through your nose... and slowly release it through your mouth. With each breath, imagine sending calm, healing energy to any areas of discomfort.

Now, starting from the top of your head, consciously relax each part of your body. If you notice areas with crawling sensations, breathe into those spaces with compassion rather than resistance.

Remember, your nervous system is doing its best to protect you. Send it gratitude for its vigilance, and gently ask it to soften and relax.`,
      voiceStyle: 'calming',
      actionableSteps: [
        'Practice this daily, even for just 5 minutes',
        'Use during symptom flares for management',
        'Adapt the language to what feels comfortable',
        'Record yourself doing this for repeated use'
      ]
    };
  }

  generateSymptomReframe(): TherapeuticResponse {
    return {
      text: `I want to offer you a different way of thinking about your symptoms that many people find helpful. Instead of viewing your body as betraying you, what if we considered that your body is working hard to communicate something important?

Your symptoms, while distressing, might be your body's way of alerting you to environmental factors, stressors, or imbalances that need attention. This doesn't minimize their reality or impact - it reframes them as information rather than simply problems.

When you notice symptoms, try asking: 'What might my body be trying to tell me right now?' This can help shift from feeling powerless to feeling curious and proactive.`,
      voiceStyle: 'educational',
      followUpQuestions: [
        'How does this perspective feel to you?',
        'What patterns have you noticed with your symptoms?',
        'What environmental or emotional factors seem connected?'
      ]
    };
  }
}

export const therapeuticAI = new TherapeuticAI();