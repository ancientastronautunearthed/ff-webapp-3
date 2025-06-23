import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthChange } from '@/lib/auth';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Force logout for fresh start - clear all authentication
    const forceLogout = localStorage.getItem('forceLogout');
    if (forceLogout) {
      localStorage.clear();
      import('@/lib/auth').then(({ logOut }) => {
        logOut().then(() => {
          setUser(null);
          setLoading(false);
          console.log('Forced logout complete - should show login screen');
        }).catch(() => {
          // Even if logout fails, clear user state
          setUser(null);
          setLoading(false);
        });
      });
      return;
    }

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'No user');
      
      if (firebaseUser) {
        try {
          const { getUserFromFirestore, createUserInFirestore } = await import('@/lib/firestore');
          
          // Check if user exists in Firestore
          let userData = await getUserFromFirestore(firebaseUser.uid);
          
          // If user doesn't exist, create them
          if (!userData) {
            userData = await createUserInFirestore({
              firebaseUid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName,
              researchOptIn: false
            });
          }
        } catch (error) {
          console.error('Error syncing user with Firestore:', error);
        }
      }
      
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
