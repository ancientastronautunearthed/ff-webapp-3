import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { logOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  User,
  MoreVertical,
  Activity,
  TrendingUp,
  Stethoscope,
  Wrench,
  MessageSquare,
  Accessibility
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [companionImage, setCompanionImage] = useState<string | null>(null);

  // Load companion image when user is available
  useEffect(() => {
    const loadCompanionImage = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.companionImage) {
              setCompanionImage(userData.companionImage);
            }
          }
        } catch (error) {
          console.log('Could not load companion image:', error);
        }
      }
    };

    loadCompanionImage();
  }, [user]);

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
    { name: 'AI Companion', href: '/companion', icon: Heart },
    { name: 'Tech Assistant', href: '/tech-assistant', icon: Wrench },
    { name: 'Community', href: '/community', icon: Users },
    { name: 'Telemedicine', href: '/telemedicine', icon: Stethoscope },
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
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={companionImage || user?.photoURL || undefined} />
                      <AvatarFallback>
                        {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {companionImage && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                        <Heart className="w-1.5 h-1.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.displayName || user?.email}
                    </p>
                    {companionImage && (
                      <p className="text-xs text-gray-500">AI Companion Active</p>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings?tab=accessibility">
                        <Accessibility className="mr-2 h-4 w-4" />
                        <span>Accessibility</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
