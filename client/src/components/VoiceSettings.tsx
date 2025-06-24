import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Volume2, Play, Settings } from 'lucide-react';
import { VoiceConfig, THERAPEUTIC_VOICES } from '@/lib/textToSpeech';

interface VoiceSettingsProps {
  voiceConfig: VoiceConfig;
  onVoiceConfigChange: (config: VoiceConfig) => void;
  voiceEnabled: boolean;
  onVoiceEnabledChange: (enabled: boolean) => void;
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  voiceConfig,
  onVoiceConfigChange,
  voiceEnabled,
  onVoiceEnabledChange
}) => {
  const [isTestPlaying, setIsTestPlaying] = React.useState(false);

  const testVoice = async () => {
    setIsTestPlaying(true);
    try {
      const testText = "Hello! I'm your AI health companion. I'm here to support you on your wellness journey with care and understanding.";
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(testText);
        
        // Try to find a voice that matches our config
        const voices = speechSynthesis.getVoices();
        const matchingVoice = voices.find(voice => 
          voice.lang.includes('en') &&
          (voiceConfig.gender === 'FEMALE' ? voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('samantha') : true)
        );
        
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
        
        utterance.rate = 0.9;
        utterance.pitch = voiceConfig.gender === 'FEMALE' ? 1.1 : 0.9;
        utterance.volume = 0.8;

        utterance.onend = () => {
          setIsTestPlaying(false);
        };
        
        utterance.onerror = () => {
          setIsTestPlaying(false);
        };
        
        speechSynthesis.speak(utterance);
      } else {
        setIsTestPlaying(false);
      }
    } catch (error) {
      console.error('Voice test failed:', error);
      setIsTestPlaying(false);
    }
  };

  const getVoiceStyleColor = (style?: string) => {
    switch (style) {
      case 'calming': return 'bg-blue-100 text-blue-800';
      case 'encouraging': return 'bg-green-100 text-green-800';
      case 'validating': return 'bg-purple-100 text-purple-800';
      case 'supportive': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Voice Settings
        </CardTitle>
        <p className="text-sm text-gray-600">
          Customize your AI companion's voice for the most comfortable experience
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Voice Enable/Disable */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Enable Voice Responses</Label>
            <p className="text-xs text-gray-600">Turn on to hear your companion speak</p>
          </div>
          <Switch
            checked={voiceEnabled}
            onCheckedChange={onVoiceEnabledChange}
          />
        </div>

        {voiceEnabled && (
          <>
            {/* Voice Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Voice Type</Label>
              <div className="grid grid-cols-1 gap-3">
                {THERAPEUTIC_VOICES.map((voice) => (
                  <div
                    key={voice.name}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      voiceConfig.name === voice.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => onVoiceConfigChange(voice)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Volume2 className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-sm">
                            {voice.gender === 'FEMALE' ? 'Female' : 'Male'} Voice
                          </span>
                        </div>
                        {voice.style && (
                          <Badge variant="secondary" className={getVoiceStyleColor(voice.style)}>
                            {voice.style}
                          </Badge>
                        )}
                      </div>
                      
                      {voiceConfig.name === voice.name && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            testVoice();
                          }}
                          disabled={isTestPlaying}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          {isTestPlaying ? 'Playing...' : 'Test'}
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600">
                      {voice.style === 'calming' && 'Gentle and soothing tone for relaxation and comfort'}
                      {voice.style === 'encouraging' && 'Warm and uplifting tone to motivate and inspire'}
                      {voice.style === 'validating' && 'Understanding and empathetic tone for emotional support'}
                      {voice.style === 'supportive' && 'Caring and reassuring tone for ongoing companionship'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Voice Button */}
            <div className="pt-4 border-t">
              <Button
                onClick={testVoice}
                disabled={isTestPlaying}
                className="w-full"
                variant="outline"
              >
                <Play className="h-4 w-4 mr-2" />
                {isTestPlaying ? 'Playing Test...' : 'Test Current Voice'}
              </Button>
            </div>
          </>
        )}

        {/* Voice Technology Info */}
        <div className="text-xs text-gray-500 pt-4 border-t">
          <p>
            Voice synthesis uses {process.env.VITE_GOOGLE_CLOUD_TTS_API_KEY ? 'Google Cloud Text-to-Speech' : 'Web Speech API'} 
            for natural, therapeutic-quality voice responses.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};