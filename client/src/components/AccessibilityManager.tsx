import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { VoiceConfig, THERAPEUTIC_VOICES } from '@/lib/textToSpeech';

interface AccessibilitySettings {
  // Voice Navigation
  voiceNavigationEnabled: boolean;
  voiceCommandsEnabled: boolean;
  voiceReadbackEnabled: boolean;
  
  // Screen Reader Support
  screenReaderMode: boolean;
  highContrastMode: boolean;
  reducedMotion: boolean;
  
  // Voice Settings
  voiceConfig: VoiceConfig;
  speechRate: number;
  speechVolume: number;
  
  // Keyboard Navigation
  keyboardNavigationEnabled: boolean;
  focusIndicatorEnhanced: boolean;
  skipLinksEnabled: boolean;
  
  // Text and Visual
  fontSize: 'small' | 'medium' | 'large' | 'xl';
  lineHeight: 'normal' | 'relaxed' | 'loose';
  colorScheme: 'auto' | 'light' | 'dark' | 'high-contrast';
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  announceToScreenReader: (message: string) => void;
  speakText: (text: string, priority?: 'low' | 'medium' | 'high') => void;
  processVoiceCommand: (command: string) => void;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
}

const defaultSettings: AccessibilitySettings = {
  voiceNavigationEnabled: false,
  voiceCommandsEnabled: false,
  voiceReadbackEnabled: true,
  screenReaderMode: false,
  highContrastMode: false,
  reducedMotion: false,
  voiceConfig: THERAPEUTIC_VOICES[0],
  speechRate: 0.9,
  speechVolume: 0.8,
  keyboardNavigationEnabled: true,
  focusIndicatorEnhanced: false,
  skipLinksEnabled: true,
  fontSize: 'medium',
  lineHeight: 'normal',
  colorScheme: 'auto'
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [speechQueue, setSpeechQueue] = useState<Array<{ text: string; priority: 'low' | 'medium' | 'high' }>>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        processVoiceCommand(command);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to load accessibility settings:', error);
      }
    }
  }, []);

  // Apply accessibility settings to document
  useEffect(() => {
    applyAccessibilityStyles();
  }, [settings]);

  // Process speech queue
  useEffect(() => {
    if (!isSpeaking && speechQueue.length > 0 && settings.voiceReadbackEnabled) {
      processSpeechQueue();
    }
  }, [speechQueue, isSpeaking, settings.voiceReadbackEnabled]);

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
    
    // Announce setting changes
    if (updates.voiceNavigationEnabled !== undefined) {
      announceToScreenReader(`Voice navigation ${updates.voiceNavigationEnabled ? 'enabled' : 'disabled'}`);
    }
    if (updates.highContrastMode !== undefined) {
      announceToScreenReader(`High contrast mode ${updates.highContrastMode ? 'enabled' : 'disabled'}`);
    }
  };

  const applyAccessibilityStyles = () => {
    const root = document.documentElement;
    
    // Font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xl: '20px'
    };
    root.style.fontSize = fontSizeMap[settings.fontSize];
    
    // Line height
    const lineHeightMap = {
      normal: '1.5',
      relaxed: '1.625',
      loose: '2'
    };
    root.style.lineHeight = lineHeightMap[settings.lineHeight];
    
    // Color scheme
    if (settings.colorScheme === 'high-contrast') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    if (settings.colorScheme === 'dark') {
      root.classList.add('dark');
    } else if (settings.colorScheme === 'light') {
      root.classList.remove('dark');
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
      root.style.setProperty('--transition-duration', '0.01ms');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }
    
    // Enhanced focus indicators
    if (settings.focusIndicatorEnhanced) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const speakText = (text: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    if (!settings.voiceReadbackEnabled) return;
    
    setSpeechQueue(prev => {
      const newQueue = [...prev, { text, priority }];
      // Sort by priority: high -> medium -> low
      return newQueue.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    });
  };

  const processSpeechQueue = () => {
    if (speechQueue.length === 0 || isSpeaking) return;
    
    const nextItem = speechQueue[0];
    setSpeechQueue(prev => prev.slice(1));
    setIsSpeaking(true);
    
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(nextItem.text);
      
      // Apply voice settings
      const voices = speechSynthesis.getVoices();
      const matchingVoice = voices.find(voice => 
        voice.lang.includes('en') &&
        (settings.voiceConfig.gender === 'FEMALE' ? 
          voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('samantha') : 
          voice.name.toLowerCase().includes('male'))
      );
      
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
      
      utterance.rate = settings.speechRate;
      utterance.volume = settings.speechVolume;
      utterance.pitch = settings.voiceConfig.gender === 'FEMALE' ? 1.1 : 0.9;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      
      speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  };

  const processVoiceCommand = (command: string) => {
    if (!settings.voiceCommandsEnabled) return;
    
    // Navigation commands
    if (command.includes('go to dashboard') || command.includes('dashboard')) {
      window.location.href = '/dashboard';
      speakText('Navigating to dashboard');
      return;
    }
    
    if (command.includes('go to tracker') || command.includes('symptom tracker')) {
      window.location.href = '/tracker';
      speakText('Opening symptom tracker');
      return;
    }
    
    if (command.includes('go to journal') || command.includes('digital matchbox')) {
      window.location.href = '/journal';
      speakText('Opening digital matchbox');
      return;
    }
    
    if (command.includes('go to community') || command.includes('community forum')) {
      window.location.href = '/community';
      speakText('Opening community forum');
      return;
    }
    
    if (command.includes('ai companion') || command.includes('companion chat')) {
      window.location.href = '/companion';
      speakText('Opening AI companion');
      return;
    }
    
    // Accessibility commands
    if (command.includes('increase font size')) {
      const sizes = ['small', 'medium', 'large', 'xl'] as const;
      const currentIndex = sizes.indexOf(settings.fontSize);
      if (currentIndex < sizes.length - 1) {
        updateSettings({ fontSize: sizes[currentIndex + 1] });
        speakText(`Font size increased to ${sizes[currentIndex + 1]}`);
      } else {
        speakText('Font size is already at maximum');
      }
      return;
    }
    
    if (command.includes('decrease font size')) {
      const sizes = ['small', 'medium', 'large', 'xl'] as const;
      const currentIndex = sizes.indexOf(settings.fontSize);
      if (currentIndex > 0) {
        updateSettings({ fontSize: sizes[currentIndex - 1] });
        speakText(`Font size decreased to ${sizes[currentIndex - 1]}`);
      } else {
        speakText('Font size is already at minimum');
      }
      return;
    }
    
    if (command.includes('high contrast on') || command.includes('enable high contrast')) {
      updateSettings({ highContrastMode: true });
      speakText('High contrast mode enabled');
      return;
    }
    
    if (command.includes('high contrast off') || command.includes('disable high contrast')) {
      updateSettings({ highContrastMode: false });
      speakText('High contrast mode disabled');
      return;
    }
    
    // Reading commands
    if (command.includes('read page') || command.includes('read this page')) {
      const mainContent = document.querySelector('main') || document.body;
      const textContent = mainContent.textContent || '';
      speakText(textContent, 'high');
      return;
    }
    
    if (command.includes('stop reading') || command.includes('stop speech')) {
      speechSynthesis.cancel();
      setSpeechQueue([]);
      setIsSpeaking(false);
      return;
    }
    
    // Help command
    if (command.includes('help') || command.includes('what can you do')) {
      const helpText = `Available voice commands: Navigate to dashboard, tracker, journal, community, or AI companion. Control accessibility with increase font size, decrease font size, enable high contrast, disable high contrast. Reading commands include read page and stop reading. Say help for this message.`;
      speakText(helpText, 'high');
      return;
    }
    
    // Unknown command
    speakText(`Sorry, I didn't understand the command: ${command}. Say help for available commands.`);
  };

  const startListening = () => {
    if (recognition && settings.voiceCommandsEnabled) {
      try {
        recognition.start();
        setIsListening(true);
        speakText('Voice commands activated. I am listening.');
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        toast({
          title: "Voice Commands Unavailable",
          description: "Speech recognition is not supported or blocked in this browser",
          variant: "destructive"
        });
      }
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
      speakText('Voice commands deactivated.');
    }
  };

  const value: AccessibilityContextType = {
    settings,
    updateSettings,
    announceToScreenReader,
    speakText,
    processVoiceCommand,
    isListening,
    startListening,
    stopListening
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Global accessibility styles
export const AccessibilityStyles = () => (
  <style jsx global>{`
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    
    .enhanced-focus *:focus {
      outline: 3px solid #4F46E5 !important;
      outline-offset: 2px !important;
    }
    
    .high-contrast {
      filter: contrast(150%) brightness(120%);
    }
    
    .high-contrast * {
      border-color: #000 !important;
      color: #000 !important;
      background-color: #fff !important;
    }
    
    .high-contrast button,
    .high-contrast .bg-primary {
      background-color: #000 !important;
      color: #fff !important;
    }
    
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    
    .skip-link {
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 1000;
    }
    
    .skip-link:focus {
      top: 6px;
    }
  `}</style>
);

// Skip links component
export const SkipLinks: React.FC = () => {
  const { settings } = useAccessibility();
  
  if (!settings.skipLinksEnabled) return null;
  
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <a href="#navigation" className="skip-link">
        Skip to navigation
      </a>
    </>
  );
};