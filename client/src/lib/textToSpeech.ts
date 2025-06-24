export interface VoiceConfig {
  name: string;
  gender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  language: string;
  style?: 'calming' | 'encouraging' | 'validating' | 'supportive';
}

// Available therapeutic voices optimized for health companion interactions
export const THERAPEUTIC_VOICES: VoiceConfig[] = [
  {
    name: 'en-US-Wavenet-H',
    gender: 'FEMALE',
    language: 'en-US',
    style: 'supportive'
  },
  {
    name: 'en-US-Wavenet-F',
    gender: 'FEMALE', 
    language: 'en-US',
    style: 'calming'
  },
  {
    name: 'en-US-Wavenet-I',
    gender: 'MALE',
    language: 'en-US',
    style: 'encouraging'
  },
  {
    name: 'en-US-Wavenet-A',
    gender: 'MALE',
    language: 'en-US',
    style: 'validating'
  }
];

const DEFAULT_VOICE: VoiceConfig = THERAPEUTIC_VOICES[0];

interface TextToSpeechConfig {
  text: string;
  voice?: {
    languageCode: string;
    name: string;
    ssmlGender: 'NEUTRAL' | 'FEMALE' | 'MALE';
  };
  audioConfig?: {
    audioEncoding: 'MP3' | 'WAV' | 'OGG_OPUS';
    speakingRate?: number;
    pitch?: number;
    volumeGainDb?: number;
  };
}

class TextToSpeechService {
  private apiKey: string;
  private baseUrl = 'https://texttospeech.googleapis.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_CLOUD_TTS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Google Cloud TTS API key not configured');
    }
  }

  async synthesizeSpeech(config: TextToSpeechConfig): Promise<string | null> {
    if (!this.apiKey) {
      console.error('Google Cloud TTS API key not available');
      return null;
    }

    try {
      const requestBody = {
        input: { text: config.text },
        voice: config.voice || {
          languageCode: 'en-US',
          name: 'en-US-Journey-F', // Therapeutic, warm female voice
          ssmlGender: 'FEMALE'
        },
        audioConfig: config.audioConfig || {
          audioEncoding: 'MP3',
          speakingRate: 0.9, // Slightly slower for therapeutic effect
          pitch: -2.0, // Slightly lower pitch for calming effect
          volumeGainDb: 0.0
        }
      };

      const response = await fetch(`${this.baseUrl}/text:synthesize?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('TTS API Error:', error);
        return null;
      }

      const data = await response.json();
      
      // Convert base64 audio to blob URL
      const audioBytes = data.audioContent;
      const audioBlob = new Blob([
        new Uint8Array(atob(audioBytes).split('').map(char => char.charCodeAt(0)))
      ], { type: 'audio/mp3' });
      
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('TTS Synthesis Error:', error);
      return null;
    }
  }

  // Therapeutic voice presets
  getTherapeuticVoice() {
    return {
      languageCode: 'en-US',
      name: 'en-US-Journey-F',
      ssmlGender: 'FEMALE' as const
    };
  }

  getCalmingAudioConfig() {
    return {
      audioEncoding: 'MP3' as const,
      speakingRate: 0.85,
      pitch: -3.0,
      volumeGainDb: -2.0
    };
  }

  getEncouragingAudioConfig() {
    return {
      audioEncoding: 'MP3' as const,
      speakingRate: 0.95,
      pitch: 1.0,
      volumeGainDb: 1.0
    };
  }
}

export const ttsService = new TextToSpeechService();
export type { TextToSpeechConfig };