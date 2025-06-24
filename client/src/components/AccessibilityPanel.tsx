import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccessibility } from '@/components/AccessibilityManager';
import { THERAPEUTIC_VOICES } from '@/lib/textToSpeech';
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Eye, 
  Type, 
  Keyboard, 
  Palette,
  Play,
  Pause,
  Settings,
  Accessibility,
  HelpCircle
} from 'lucide-react';

export const AccessibilityPanel: React.FC = () => {
  const {
    settings,
    updateSettings,
    speakText,
    isListening,
    startListening,
    stopListening
  } = useAccessibility();
  
  const [activeTab, setActiveTab] = useState('voice');

  const testVoice = () => {
    speakText('This is a test of the voice settings. The voice is clear and accessible for all users.');
  };

  const testVoiceCommand = () => {
    speakText('Voice commands are ready. Try saying "help" to hear available commands, or "go to dashboard" to navigate.');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Accessibility className="h-5 w-5" />
          Accessibility Settings
        </CardTitle>
        <p className="text-sm text-gray-600">
          Customize your experience for optimal accessibility and usability
        </p>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="visual" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visual
            </TabsTrigger>
            <TabsTrigger value="navigation" className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Navigation
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Help
            </TabsTrigger>
          </TabsList>

          {/* Voice Settings Tab */}
          <TabsContent value="voice" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Voice Readback */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Voice Readback</CardTitle>
                  <p className="text-sm text-gray-600">
                    Configure text-to-speech settings for page content
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="voice-readback">Enable Voice Readback</Label>
                    <Switch
                      id="voice-readback"
                      checked={settings.voiceReadbackEnabled}
                      onCheckedChange={(checked) => 
                        updateSettings({ voiceReadbackEnabled: checked })
                      }
                    />
                  </div>
                  
                  {settings.voiceReadbackEnabled && (
                    <>
                      <div className="space-y-2">
                        <Label>Voice Type</Label>
                        <Select
                          value={settings.voiceConfig.name}
                          onValueChange={(value) => {
                            const voice = THERAPEUTIC_VOICES.find(v => v.name === value);
                            if (voice) updateSettings({ voiceConfig: voice });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {THERAPEUTIC_VOICES.map((voice) => (
                              <SelectItem key={voice.name} value={voice.name}>
                                {voice.gender} - {voice.style}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Speech Rate: {settings.speechRate}</Label>
                        <Slider
                          value={[settings.speechRate]}
                          onValueChange={([value]) => updateSettings({ speechRate: value })}
                          min={0.5}
                          max={2.0}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Speech Volume: {Math.round(settings.speechVolume * 100)}%</Label>
                        <Slider
                          value={[settings.speechVolume]}
                          onValueChange={([value]) => updateSettings({ speechVolume: value })}
                          min={0.1}
                          max={1.0}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                      
                      <Button onClick={testVoice} className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Test Voice Settings
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Voice Commands */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Voice Commands</CardTitle>
                  <p className="text-sm text-gray-600">
                    Navigate and control the app using voice commands
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="voice-commands">Enable Voice Commands</Label>
                    <Switch
                      id="voice-commands"
                      checked={settings.voiceCommandsEnabled}
                      onCheckedChange={(checked) => 
                        updateSettings({ voiceCommandsEnabled: checked })
                      }
                    />
                  </div>
                  
                  {settings.voiceCommandsEnabled && (
                    <>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="voice-navigation">Voice Navigation</Label>
                        <Switch
                          id="voice-navigation"
                          checked={settings.voiceNavigationEnabled}
                          onCheckedChange={(checked) => 
                            updateSettings({ voiceNavigationEnabled: checked })
                          }
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={isListening ? stopListening : startListening}
                          variant={isListening ? "destructive" : "default"}
                          className="flex-1"
                        >
                          {isListening ? (
                            <>
                              <MicOff className="h-4 w-4 mr-2" />
                              Stop Listening
                            </>
                          ) : (
                            <>
                              <Mic className="h-4 w-4 mr-2" />
                              Start Listening
                            </>
                          )}
                        </Button>
                        
                        <Button onClick={testVoiceCommand} variant="outline">
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {isListening && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-blue-800">
                            <Mic className="h-4 w-4 animate-pulse" />
                            <span className="text-sm font-medium">Listening for commands...</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        <p><strong>Example commands:</strong></p>
                        <ul className="mt-1 space-y-1">
                          <li>• "Go to dashboard"</li>
                          <li>• "Open symptom tracker"</li>
                          <li>• "Increase font size"</li>
                          <li>• "Enable high contrast"</li>
                          <li>• "Read page"</li>
                          <li>• "Help"</li>
                        </ul>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Visual Settings Tab */}
          <TabsContent value="visual" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Display Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Display Settings</CardTitle>
                  <p className="text-sm text-gray-600">
                    Adjust visual presentation for better readability
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Font Size</Label>
                    <Select
                      value={settings.fontSize}
                      onValueChange={(value: any) => updateSettings({ fontSize: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                        <SelectItem value="xl">Extra Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Line Height</Label>
                    <Select
                      value={settings.lineHeight}
                      onValueChange={(value: any) => updateSettings({ lineHeight: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="relaxed">Relaxed</SelectItem>
                        <SelectItem value="loose">Loose</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Color Scheme</Label>
                    <Select
                      value={settings.colorScheme}
                      onValueChange={(value: any) => updateSettings({ colorScheme: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="high-contrast">High Contrast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Accessibility Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Accessibility Options</CardTitle>
                  <p className="text-sm text-gray-600">
                    Additional options for enhanced accessibility
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="screen-reader">Screen Reader Mode</Label>
                    <Switch
                      id="screen-reader"
                      checked={settings.screenReaderMode}
                      onCheckedChange={(checked) => 
                        updateSettings({ screenReaderMode: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="high-contrast">High Contrast Mode</Label>
                    <Switch
                      id="high-contrast"
                      checked={settings.highContrastMode}
                      onCheckedChange={(checked) => 
                        updateSettings({ highContrastMode: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reduced-motion">Reduced Motion</Label>
                    <Switch
                      id="reduced-motion"
                      checked={settings.reducedMotion}
                      onCheckedChange={(checked) => 
                        updateSettings({ reducedMotion: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enhanced-focus">Enhanced Focus Indicators</Label>
                    <Switch
                      id="enhanced-focus"
                      checked={settings.focusIndicatorEnhanced}
                      onCheckedChange={(checked) => 
                        updateSettings({ focusIndicatorEnhanced: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Navigation Settings Tab */}
          <TabsContent value="navigation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Keyboard Navigation</CardTitle>
                <p className="text-sm text-gray-600">
                  Configure keyboard shortcuts and navigation aids
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="keyboard-nav">Enhanced Keyboard Navigation</Label>
                  <Switch
                    id="keyboard-nav"
                    checked={settings.keyboardNavigationEnabled}
                    onCheckedChange={(checked) => 
                      updateSettings({ keyboardNavigationEnabled: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="skip-links">Skip Links</Label>
                  <Switch
                    id="skip-links"
                    checked={settings.skipLinksEnabled}
                    onCheckedChange={(checked) => 
                      updateSettings({ skipLinksEnabled: checked })
                    }
                  />
                </div>
                
                {settings.keyboardNavigationEnabled && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <h4 className="font-medium text-gray-900">Keyboard Shortcuts</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div><kbd className="bg-gray-200 px-1 rounded">Tab</kbd> - Navigate forward</div>
                      <div><kbd className="bg-gray-200 px-1 rounded">Shift+Tab</kbd> - Navigate backward</div>
                      <div><kbd className="bg-gray-200 px-1 rounded">Enter</kbd> - Activate element</div>
                      <div><kbd className="bg-gray-200 px-1 rounded">Space</kbd> - Activate button/checkbox</div>
                      <div><kbd className="bg-gray-200 px-1 rounded">Esc</kbd> - Close dialog/menu</div>
                      <div><kbd className="bg-gray-200 px-1 rounded">Arrow keys</kbd> - Navigate lists/menus</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Help Tab */}
          <TabsContent value="help" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Accessibility Help</CardTitle>
                <p className="text-sm text-gray-600">
                  Learn how to use accessibility features effectively
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Voice Commands</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Enable voice commands in the Voice tab</li>
                      <li>• Click "Start Listening" or use voice activation</li>
                      <li>• Say commands clearly and wait for confirmation</li>
                      <li>• Try "help" to hear all available commands</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Screen Reader Support</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• All interactive elements have proper labels</li>
                      <li>• Page structure uses semantic headings</li>
                      <li>• Status updates are announced automatically</li>
                      <li>• Enable Screen Reader Mode for enhanced experience</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Visual Accessibility</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Adjust font size and line height for readability</li>
                      <li>• Use high contrast mode for better visibility</li>
                      <li>• Enable reduced motion if animations are distracting</li>
                      <li>• Enhanced focus indicators help with navigation</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Getting Support</h4>
                    <p className="text-sm text-gray-600">
                      If you need additional accessibility support or encounter issues, 
                      please contact our support team through the Settings page.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};