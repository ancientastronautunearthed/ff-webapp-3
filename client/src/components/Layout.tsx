import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { logOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  BarChart3, 
  BookOpen, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Microscope,
  Video,
  Home,
  Activity,
  TrendingUp,
  Stethoscope
} from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Sign Out Error",
        description: error.message || "An error occurred during sign out.",
        variant: "destructive",
      });
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Track Symptoms', href: '/tracker', icon: Activity },
    { name: 'Community', href: '/community', icon: Users },
    { name: 'Find Support', href: '/telemedicine', icon: Stethoscope },
    { name: 'My Data', href: '/insights', icon: TrendingUp },
    { name: 'Ask a Doctor', href: '/ask-doctor', icon: BookOpen },
  ];

  const isActive = (path: string) => location === path;

  const NavigationItems = ({ mobile = false }) => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => mobile && setMobileMenuOpen(false)}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.href)
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
            }`}
          >
            <Icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Fiber Friends</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <NavigationItems />
              <div className="flex items-center space-x-3 ml-6 pl-6 border-l border-gray-200">
                <span className="text-sm text-gray-600">
                  {user?.displayName || user?.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                        <Heart className="h-4 w-4 text-white" />
                      </div>
                      <h2 className="font-semibold text-gray-900">Fiber Friends</h2>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <NavigationItems mobile />
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200">
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        {user?.displayName || user?.email}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};
