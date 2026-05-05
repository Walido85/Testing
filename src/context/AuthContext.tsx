import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define User type dynamically or use any for now, but we'll import types from firebase/auth
import type { User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const initAuth = async () => {
      try {
        const { auth } = await import('../firebase');
        const { onAuthStateChanged } = await import('firebase/auth');
        
        unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user && !user.isAnonymous) {
            setUser(user);
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      } catch (err) {
        console.error("Failed to initialize auth module", err);
        setLoading(false);
      }
    };

    // Defer initialization to avoid blocking main thread at startup
    const timer = setTimeout(() => {
      initAuth();
    }, 1500);

    return () => {
      clearTimeout(timer);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    const { auth } = await import('../firebase');
    const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginWithFacebook = async () => {
    const { auth } = await import('../firebase');
    const { signInWithPopup, FacebookAuthProvider } = await import('firebase/auth');
    const provider = new FacebookAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginWithApple = async () => {
    const { auth } = await import('../firebase');
    const { signInWithPopup, OAuthProvider } = await import('firebase/auth');
    const provider = new OAuthProvider('apple.com');
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    const { auth } = await import('../firebase');
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithFacebook, loginWithApple, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

const AUTH_DEFAULTS: AuthContextType = {
  user: null,
  loading: false,
  loginWithGoogle: async () => {},
  loginWithFacebook: async () => {},
  loginWithApple: async () => {},
  logout: async () => {},
};

export function useAuth() {
  return useContext(AuthContext) ?? AUTH_DEFAULTS;
}
