import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Home,
  Activity,
  BookOpen,
  Users,
  BarChart3,
  Calendar,
  FileText,
  LogOut
} from 'lucide-react';

interface SimpleLayoutProps {
  children: ReactNode;
}

export function SimpleLayout({ children }: SimpleLayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  const handleLogout = async () => {
    try {
      const { logOut } = await import('@/lib/auth');
      await logOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Symptom Tracker', href: '/tracker', icon: Activity },
    { name: 'Journal', href: '/journal', icon: BookOpen },
    { name: 'Community', href: '/community', icon: Users },
    { name: 'Insights', href: '/insights', icon: BarChart3 },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Reports', href: '/reports', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">FF</span>
                  </div>
                  <span className="font-semibold text-gray-900">Fiber Friends</span>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.displayName || user?.email}
              </span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Side navigation */}
      <div className="flex">
        <nav className="w-64 bg-white shadow-sm min-h-screen pt-8">
          <div className="px-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || 
                  (item.href !== '/' && location.startsWith(item.href));
                
                return (
                  <li key={item.name}>
                    <Link href={item.href}>
                      <div className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}>
                        <Icon className="h-5 w-5 mr-3" />
                        {item.name}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}