import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAccessibility } from '@/components/AccessibilityManager';
import { Mic, MicOff, Volume2, VolumeX, HelpCircle, Settings } from 'lucide-react';

interface VoiceNavigationWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  compact?: boolean;
}

export const VoiceNavigationWidget: React.FC<VoiceNavigationWidgetProps> = ({ 
  position = 'bottom-right',
  compact = false 
}) => {
  const {
    settings,
    isListening,
    startListening,
    stopListening,
    speakText,
    updateSettings
  } = useAccessibility();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');

  // Auto-collapse after period of inactivity
  useEffect(() => {
    if (isExpanded && !isListening) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isExpanded, isListening]);

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  const toggleVoiceCommands = () => {
    if (settings.voiceCommandsEnabled) {
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    } else {
      updateSettings({ voiceCommandsEnabled: true });
      setTimeout(() => startListening(), 100);
    }
  };

  const toggleVoiceReadback = () => {
    const newState = !settings.voiceReadbackEnabled;
    updateSettings({ voiceReadbackEnabled: newState });
    speakText(`Voice readback ${newState ? 'enabled' : 'disabled'}`);
  };

  const showHelp = () => {
    const helpText = `Voice navigation help: Say "go to dashboard", "open symptom tracker", "increase font size", "enable high contrast", "read page", or "help" for commands. Click the microphone to start listening.`;
    speakText(helpText, 'high');
    setIsExpanded(true);
  };

  if (compact) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <div className="flex gap-2">
          {settings.voiceCommandsEnabled && (
            <Button
              onClick={toggleVoiceCommands}
              size="sm"
              variant={isListening ? "destructive" : "default"}
              className="rounded-full w-10 h-10 p-0"
              aria-label={isListening ? "Stop voice commands" : "Start voice commands"}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          )}
          
          <Button
            onClick={toggleVoiceReadback}
            size="sm"
            variant={settings.voiceReadbackEnabled ? "default" : "outline"}
            className="rounded-full w-10 h-10 p-0"
            aria-label={settings.voiceReadbackEnabled ? "Disable voice readback" : "Enable voice readback"}
          >
            {settings.voiceReadbackEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <Card className={`transition-all duration-300 ${
        isExpanded ? 'w-80' : 'w-auto'
      }`}>
        <CardContent className="p-3">
          {!isExpanded ? (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsExpanded(true)}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
                aria-label="Open voice navigation controls"
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Voice commands active</span>
                  </>
                ) : (
                  <Mic className="h-4 w-4" />
                )}
                Voice
              </Button>
              
              {isListening && (
                <Badge variant="destructive" className="animate-pulse">
                  Listening
                </Badge>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Voice Navigation</h3>
                <Button
                  onClick={() => setIsExpanded(false)}
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  aria-label="Collapse voice navigation"
                >
                  ×
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={toggleVoiceCommands}
                  size="sm"
                  variant={isListening ? "destructive" : "default"}
                  className="flex items-center gap-2"
                  disabled={!settings.voiceCommandsEnabled}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-3 w-3" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="h-3 w-3" />
                      Listen
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={toggleVoiceReadback}
                  size="sm"
                  variant={settings.voiceReadbackEnabled ? "default" : "outline"}
                  className="flex items-center gap-2"
                >
                  {settings.voiceReadbackEnabled ? (
                    <>
                      <Volume2 className="h-3 w-3" />
                      Voice On
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-3 w-3" />
                      Voice Off
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={showHelp}
                  size="sm"
                  variant="outline"
                  className="flex-1 flex items-center gap-2"
                >
                  <HelpCircle className="h-3 w-3" />
                  Help
                </Button>
                
                <Button
                  onClick={() => window.location.href = '/settings?tab=accessibility'}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
              
              {isListening && (
                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                  <div className="flex items-center gap-2 text-blue-800 text-xs">
                    <Mic className="h-3 w-3 animate-pulse" />
                    <span>Listening for voice commands...</span>
                  </div>
                  {lastCommand && (
                    <p className="text-xs text-blue-600 mt-1">
                      Last: {lastCommand}
                    </p>
                  )}
                </div>
              )}
              
              {!settings.voiceCommandsEnabled && (
                <div className="bg-amber-50 border border-amber-200 rounded p-2">
                  <p className="text-xs text-amber-800">
                    Enable voice commands in Settings to use voice navigation
                  </p>
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                <p><strong>Quick commands:</strong></p>
                <p>• "Dashboard" • "Tracker" • "Help"</p>
                <p>• "Bigger text" • "High contrast"</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceNavigationWidget;