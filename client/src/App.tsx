import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CompanionProgressProvider } from "@/contexts/CompanionProgressContext";
import { WelcomeTour } from "@/components/WelcomeTour";
import { Layout } from "@/components/Layout";
import { SymptomTracker } from "@/components/SymptomTracker";
import { DigitalMatchbox } from "@/components/DigitalMatchbox";
import { Community } from "@/components/Community";
import { DataVisualization } from "@/components/DataVisualization";
import { ResearchOptIn } from "@/components/ResearchOptIn";
import { ProviderReports } from "@/components/ProviderReports";
import { AIInsights } from "@/components/AIInsights";
import { ResearchConsentManager } from "@/components/ResearchConsentManager";
import { ResearchDashboardEnhanced } from "@/components/ResearchDashboardEnhanced";
import { MedicalOnboarding } from "@/components/MedicalOnboarding";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import CalendarView from "@/pages/CalendarView";
import ResearchDashboard from "@/pages/ResearchDashboard";
import ProfileSetup from "@/pages/ProfileSetup";
import { Onboarding } from "@/components/Onboarding";
import { TelemedicineScheduling } from "@/components/TelemedicineScheduling";
import DoctorLogin from "@/pages/DoctorLogin";
import DoctorDashboard from "@/pages/DoctorDashboard";
import DemoLogin from "@/pages/DemoLogin";
import { PeerMatching } from "@/components/PeerMatching";
import { AskDoctorForum } from "@/components/AskDoctorForum";
import LandingPage from "@/pages/LandingPage";
import { CommunityForum } from "@/components/CommunityForum";
import { CompanionDashboard } from "@/components/CompanionDashboard";
import { UserSettings } from "@/pages/UserSettings";

function AppContent() {
  const { user, loading } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <p className="text-gray-600">Loading Fiber Friends...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Check if accessing doctor demo specifically
    if (location === '/doctor-demo') {
      return <DemoLogin />;
    }
    // Check if accessing doctor portal
    if (location.startsWith('/doctor')) {
      return <DoctorLogin />;
    }
    return <Login />;
  }

  // Check if user is a doctor and redirect to doctor dashboard
  const userRole = localStorage.getItem('userRole');
  const isDemoDoctor = localStorage.getItem('demoDoctor') === 'true';
  if (userRole === 'doctor' && isDemoDoctor) {
    return <DoctorDashboard />;
  }

  // Check if user has completed onboarding
  const hasCompletedOnboarding = localStorage.getItem('onboardingComplete') === 'true';
  
  // Force new users through comprehensive medical onboarding (except when explicitly accessing onboarding routes)
  if (!hasCompletedOnboarding && !location.startsWith('/onboarding') && !location.startsWith('/medical-onboarding') && !location.startsWith('/research-consent')) {
    return <Onboarding />;
  }



  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/tracker" component={SymptomTracker} />
        <Route path="/journal" component={DigitalMatchbox} />
        <Route path="/community" component={CommunityForum} />
        <Route path="/insights" component={DataVisualization} />
        <Route path="/research-opt-in" component={ResearchOptIn} />
        <Route path="/reports" component={ProviderReports} />
        <Route path="/calendar" component={CalendarView} />
        <Route path="/ai-insights" component={AIInsights} />
        <Route path="/research" component={ResearchDashboard} />
        <Route path="/research-enhanced" component={ResearchDashboardEnhanced} />
        <Route path="/research-consent" component={ResearchConsentManager} />
        <Route path="/medical-onboarding" component={MedicalOnboarding} />
        <Route path="/profile-setup" component={ProfileSetup} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/telemedicine" component={TelemedicineScheduling} />
        <Route path="/doctor" component={DoctorLogin} />
        <Route path="/doctor/login" component={DoctorLogin} />
        <Route path="/doctor/dashboard" component={DoctorDashboard} />
        <Route path="/doctor-demo" component={DemoLogin} />
        <Route path="/ask-doctor" component={AskDoctorForum} />
        <Route path="/peer-matching" component={PeerMatching} />
        <Route path="/companion" component={CompanionDashboard} />
        <Route path="/settings" component={UserSettings} />
        <Route path="/landing" component={LandingPage} />
        <Route component={NotFound} />
      </Switch>
      
      {/* Check if tour is active and show tour overlay */}
      {localStorage.getItem('tourActive') === 'true' && <WelcomeTour onComplete={() => {
        localStorage.removeItem('tourActive');
      }} onSkip={() => {
        localStorage.removeItem('tourActive');
      }} />}
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CompanionProgressProvider>
          <TooltipProvider>
            <Toaster />
            <AppContent />
          </TooltipProvider>
        </CompanionProgressProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
