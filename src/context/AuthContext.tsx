import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserRole, generateNickname, CAMPUS_CODE, FACULTY_CODE } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  login: (role: UserRole, campusCode: string, adminEmail?: string, adminPassword?: string, customNickname?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  checkNicknameAvailable: (nickname: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_CREDENTIALS = {
  email: 'admin@institute.edu',
  password: 'admin123'
};

// Generate a strong password that meets Firebase requirements
function generateStrongPassword(): string {
  const timestamp = Date.now().toString(36);
  return `Cv@${timestamp}x!`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if nickname is available
  const checkNicknameAvailable = async (nickname: string): Promise<boolean> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('name', '==', nickname));
      const snapshot = await getDocs(q);
      return snapshot.empty;
    } catch (error) {
      console.error('Error checking nickname:', error);
      return true; // Allow if can't check
    }
  };

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        // Fetch user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: fbUser.uid,
              email: userData.email,
              role: userData.role,
              nickname: userData.name,
              createdAt: userData.createdAt?.toDate() || new Date(),
            });
          } else {
            // Fallback to localStorage for backward compatibility
            const stored = localStorage.getItem('campusvoice_user');
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                setUser({ ...parsed, createdAt: new Date(parsed.createdAt) });
              } catch {
                localStorage.removeItem('campusvoice_user');
              }
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to localStorage
          const stored = localStorage.getItem('campusvoice_user');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              setUser({ ...parsed, createdAt: new Date(parsed.createdAt) });
            } catch {
              localStorage.removeItem('campusvoice_user');
            }
          }
        }
      } else {
        setFirebaseUser(null);
        // Check localStorage as fallback
        const stored = localStorage.getItem('campusvoice_user');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setUser({ ...parsed, createdAt: new Date(parsed.createdAt) });
          } catch {
            localStorage.removeItem('campusvoice_user');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (role: UserRole, campusCode: string, adminEmail?: string, adminPassword?: string, customNickname?: string): Promise<boolean> => {
    // Student login with CAMPUS2024
    if (role === 'student') {
      if (campusCode !== CAMPUS_CODE) {
        return false;
      }
    }

    // Admin/Faculty login with MITS2025 + credentials
    if (role === 'admin') {
      if (campusCode !== FACULTY_CODE) {
        return false;
      }
      if (adminEmail !== ADMIN_CREDENTIALS.email || adminPassword !== ADMIN_CREDENTIALS.password) {
        return false;
      }
    }

    try {
      const email = role === 'admin' ? adminEmail! : `student_${Date.now()}@campusvoice.app`;
      const password = role === 'admin' ? adminPassword! : generateStrongPassword();
      const nickname = role === 'student' ? (customNickname || generateNickname()) : 'Faculty';

      // For students, check nickname uniqueness
      if (role === 'student' && customNickname) {
        const isAvailable = await checkNicknameAvailable(customNickname);
        if (!isAvailable) {
          throw new Error('Nickname already taken');
        }
      }

      let userCredential;
      try {
        // Try to sign in first (for admin)
        if (role === 'admin') {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        } else {
          // For students, always create new account
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
        }
      } catch (signInError: any) {
        if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
          // Create new user if doesn't exist
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
        } else {
          throw signInError;
        }
      }

      const fbUser = userCredential.user;

      // Save user to Firestore
      await setDoc(doc(db, 'users', fbUser.uid), {
        uid: fbUser.uid,
        name: nickname,
        email: email,
        role: role === 'admin' ? 'faculty' : 'student',
        branch: '',
        year: '',
        createdAt: serverTimestamp(),
      }, { merge: true });

      const newUser: User = {
        id: fbUser.uid,
        email: role === 'admin' ? adminEmail : undefined,
        role,
        nickname,
        createdAt: new Date(),
      };

      setUser(newUser);
      localStorage.setItem('campusvoice_user', JSON.stringify(newUser));
      return true;
    } catch (error: any) {
      console.error('Firebase auth error:', error);
      
      // Fallback to local-only authentication if Firebase fails
      const nickname = role === 'student' ? (customNickname || generateNickname()) : 'Faculty';
      const newUser: User = {
        id: crypto.randomUUID(),
        email: role === 'admin' ? adminEmail : undefined,
        role,
        nickname,
        createdAt: new Date(),
      };

      setUser(newUser);
      localStorage.setItem('campusvoice_user', JSON.stringify(newUser));
      return true;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      
      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(doc(db, 'users', fbUser.uid), {
          uid: fbUser.uid,
          name: generateNickname(),
          email: fbUser.email,
          role: 'student',
          branch: '',
          year: '',
          createdAt: serverTimestamp(),
        });
      }

      const userData = userDoc.exists() ? userDoc.data() : null;
      
      const newUser: User = {
        id: fbUser.uid,
        email: fbUser.email || undefined,
        role: (userData?.role === 'faculty' || userData?.role === 'admin') ? 'admin' : 'student',
        nickname: userData?.name || generateNickname(),
        createdAt: userData?.createdAt?.toDate() || new Date(),
      };

      setUser(newUser);
      localStorage.setItem('campusvoice_user', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Google sign-in error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
    setUser(null);
    setFirebaseUser(null);
    localStorage.removeItem('campusvoice_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser,
      isLoading, 
      login, 
      loginWithGoogle,
      logout, 
      isAuthenticated: !!user,
      checkNicknameAvailable
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
