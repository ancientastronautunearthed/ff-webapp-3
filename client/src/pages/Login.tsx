import React, { useState } from 'react';
import { AuthForm } from '@/components/AuthForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Users, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function Login() {
  const [showRoleSelection, setShowRoleSelection] = useState(true);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  if (showRoleSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to Fiber Friends</CardTitle>
            <p className="text-gray-600">Choose your account type to continue</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setShowRoleSelection(false)}
              className="w-full h-16 flex items-center justify-center gap-3 text-lg"
              variant="outline"
            >
              <Users className="h-6 w-6 text-green-600" />
              <div className="text-left">
                <div className="font-semibold text-green-700">Patient Portal</div>
                <div className="text-sm text-gray-600">Track symptoms & connect with community</div>
              </div>
            </Button>

            <Link href="/doctor">
              <Button 
                className="w-full h-16 flex items-center justify-center gap-3 text-lg bg-blue-600 hover:bg-blue-700"
              >
                <Stethoscope className="h-6 w-6 text-white" />
                <div className="text-left text-white">
                  <div className="font-semibold">Doctor Portal</div>
                  <div className="text-sm text-blue-100">Medical professional access</div>
                </div>
              </Button>
            </Link>

            <div className="text-center text-sm text-gray-500 mt-6">
              New to Fiber Friends? Select your role above to get started.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Button
          variant="outline"
          onClick={() => setShowRoleSelection(true)}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Role Selection
        </Button>
        <AuthForm mode={mode} onToggleMode={toggleMode} />
      </div>
    </div>
  );
}
