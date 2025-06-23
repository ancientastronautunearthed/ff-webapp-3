import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { SymptomTracker } from "@/components/SymptomTracker";
import { DigitalMatchbox } from "@/components/DigitalMatchbox";
import { Community } from "@/components/Community";
import { DataVisualization } from "@/components/DataVisualization";
import { ResearchOptIn } from "@/components/ResearchOptIn";
import { ProviderReports } from "@/components/ProviderReports";
import { AIInsights } from "@/components/AIInsights";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import CalendarView from "@/pages/CalendarView";
import ResearchDashboard from "@/pages/ResearchDashboard";
import ProfileSetup from "@/pages/ProfileSetup";
import { Onboarding } from "@/components/Onboarding";
import { TelemedicineScheduling } from "@/components/TelemedicineScheduling";

function AppContent() {
  const { user, loading } = useAuth();

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
    return <Login />;
  }

  // Check if user needs onboarding
  // For new users, show onboarding with comprehensive medical profile
  const needsOnboarding = false; // This forces onboarding for demo purposes

  if (needsOnboarding) {
    return <Onboarding />;
  }

  // Check if tour should be shown globally
  const [showGlobalTour, setShowGlobalTour] = useState(false);
  
  useEffect(() => {
    const tourState = sessionStorage.getItem('tourActive');
    if (tourState === 'true') {
      setShowGlobalTour(true);
    }
  }, []);

  const handleTourComplete = () => {
    setShowGlobalTour(false);
    sessionStorage.removeItem('tourActive');
    localStorage.setItem('hasSeenDashboardTour', 'true');
  };

  const handleTourSkip = () => {
    setShowGlobalTour(false);
    sessionStorage.removeItem('tourActive');
  };

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/tracker" component={SymptomTracker} />
        <Route path="/journal" component={DigitalMatchbox} />
        <Route path="/community" component={Community} />
        <Route path="/insights" component={DataVisualization} />
        <Route path="/research-opt-in" component={ResearchOptIn} />
        <Route path="/reports" component={ProviderReports} />
        <Route path="/calendar" component={CalendarView} />
        <Route path="/ai-insights" component={AIInsights} />
        <Route path="/research" component={ResearchDashboard} />
        <Route path="/profile-setup" component={ProfileSetup} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/telemedicine" component={TelemedicineScheduling} />
        <Route component={NotFound} />
      </Switch>
      
      {/* Global tour that persists across pages */}
      {showGlobalTour && (
        <WelcomeTour 
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />
      )}
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
