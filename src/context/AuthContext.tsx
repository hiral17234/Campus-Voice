import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, deleteDoc, runTransaction } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserRole, generateNickname, CAMPUS_CODE, FACULTY_CODE } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthReady: boolean;
  login: (role: UserRole, campusCode: string, adminEmail?: string, adminPassword?: string, customNickname?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  checkNicknameAvailable: (nickname: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FACULTY_CREDENTIALS = {
  email: 'admin@institute.edu',
  password: 'Admin9302@'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Check if nickname is available using usernames collection
  const checkNicknameAvailable = async (nickname: string): Promise<boolean> => {
    try {
      const normalizedNickname = nickname.toLowerCase().trim();
      const usernameDoc = await getDoc(doc(db, 'usernames', normalizedNickname));
      return !usernameDoc.exists();
    } catch (error: any) {
      console.error('Error checking nickname:', error);
      // If permission denied (not logged in yet), assume available
      // The transaction during signup will handle the actual uniqueness check
      if (error?.code === 'permission-denied') {
        return true;
      }
      // For other errors, assume available and let transaction handle it
      return true;
    }
  };

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        // Fetch user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
         if (userDoc.exists()) {
  const userData = userDoc.data();
  const appUser: User = {
    id: fbUser.uid,
    email: userData.email || undefined,
    role: userData.role === 'faculty' ? 'admin' : 'student',
    nickname: userData.username || userData.name,
    createdAt: userData.createdAt?.toDate() || new Date(),
  };
  setUser(appUser);
} else {
  // 🔥 DO NOTHING HERE
  // Anonymous login creates the Firestore user asynchronously.
  // onAuthStateChanged WILL fire again once the document exists.
  return;
}

        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setIsAuthReady(true);
setIsLoading(false);

    });

    return () => unsubscribe();
  }, []);

  const login = async (
    role: UserRole, 
    campusCode: string, 
    adminEmail?: string, 
    adminPassword?: string, 
    customNickname?: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Validate campus code
    if (role === 'student' && campusCode !== CAMPUS_CODE) {
      return { success: false, error: 'Invalid campus code' };
    }
    
    if (role === 'admin' && campusCode !== FACULTY_CODE) {
      return { success: false, error: 'Invalid faculty code' };
    }

    // Faculty login with email/password
    if (role === 'admin') {
      if (adminEmail !== FACULTY_CREDENTIALS.email || adminPassword !== FACULTY_CREDENTIALS.password) {
        return { success: false, error: 'Invalid admin credentials' };
      }

      try {
        let userCredential;
        try {
          userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        } catch (signInError: any) {
          if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
            userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
          } else {
            throw signInError;
          }
        }

        const fbUser = userCredential.user;

        // Create/update faculty user document
        await setDoc(doc(db, 'users', fbUser.uid), {
          uid: fbUser.uid,
          username: 'Faculty Admin',
          email: adminEmail,
          role: 'faculty',
          department: 'Administration',
          anonymous: false,
          createdAt: serverTimestamp(),
        }, { merge: true });

        return { success: true };
      } catch (error: any) {
        console.error('Faculty login error:', error);
        return { success: false, error: error.message || 'Login failed' };
      }
    }

    // Student login - use anonymous auth
    const nickname = customNickname?.trim() || generateNickname();
    const normalizedNickname = nickname.toLowerCase();

    try {
      // IMPORTANT: Sign in anonymously FIRST to get Firebase authentication
      const userCredential = await signInAnonymously(auth);
      const fbUser = userCredential.user;

      // NOW use transaction to atomically check and reserve the username
      const usernameRef = doc(db, 'usernames', normalizedNickname);
      
      try {
        await runTransaction(db, async (transaction) => {
          const usernameDoc = await transaction.get(usernameRef);
          
          if (usernameDoc.exists()) {
            throw new Error('Username taken');
          }

          // Reserve the username
          transaction.set(usernameRef, {
            uid: fbUser.uid,
            createdAt: serverTimestamp(),
          });

          // Create user document
          transaction.set(doc(db, 'users', fbUser.uid), {
            uid: fbUser.uid,
            username: nickname,
            role: 'student',
            campusCode: campusCode,
            anonymous: true,
            upvoteCount: 0,
            downvoteCount: 0,
            issueCount: 0,
            commentCount: 0,
            createdAt: serverTimestamp(),
          });
        });

        // ✅ MANUALLY SET USER FOR ANONYMOUS STUDENT
setUser({
  id: fbUser.uid,
  role: 'student',
  nickname: nickname,
  createdAt: new Date(),
});


        return { success: true };
      } catch (transactionError: any) {
        // If transaction fails (username taken), sign out and return error
        await signOut(auth);
        if (transactionError.message === 'Username taken') {
          return { success: false, error: 'This username is already taken. Please choose another.' };
        }
        console.error('Transaction error:', transactionError);
        return { success: false, error: 'Failed to create account. Please try again.' };
      }
    } catch (error: any) {
      console.error('Student login error:', error);
      return { success: false, error: error.message || 'Login failed. Please try again.' };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      
      if (!userDoc.exists()) {
        // Create new user document with generated nickname
        const nickname = generateNickname();
        const normalizedNickname = nickname.toLowerCase();

        // Try to reserve the username
        try {
          await runTransaction(db, async (transaction) => {
            const usernameRef = doc(db, 'usernames', normalizedNickname);
            const usernameDoc = await transaction.get(usernameRef);
            
            // If username exists, generate a new one with uid suffix
            const finalNickname = usernameDoc.exists() 
              ? `${nickname}_${fbUser.uid.slice(0, 4)}`
              : nickname;
            const finalNormalizedNickname = finalNickname.toLowerCase();

            if (!usernameDoc.exists()) {
              transaction.set(usernameRef, {
                uid: fbUser.uid,
                createdAt: serverTimestamp(),
              });
            } else {
              // Reserve the fallback username
              transaction.set(doc(db, 'usernames', finalNormalizedNickname), {
                uid: fbUser.uid,
                createdAt: serverTimestamp(),
              });
            }

            transaction.set(doc(db, 'users', fbUser.uid), {
              uid: fbUser.uid,
              username: finalNickname,
              email: fbUser.email,
              role: 'student',
              anonymous: false,
              upvoteCount: 0,
              downvoteCount: 0,
              issueCount: 0,
              commentCount: 0,
              createdAt: serverTimestamp(),
            });
          });
        } catch (transactionError) {
          console.error('Error creating Google user:', transactionError);
          await signOut(auth);
          return { success: false, error: 'Failed to create account. Please try again.' };
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      return { success: false, error: error.message || 'Google sign-in failed' };
    }
  };

  const logout = async () => {
    const currentUser = firebaseUser;
    const currentAppUser = user;

    try {
      // If student (anonymous), delete their data
      if (currentUser && currentAppUser?.role === 'student') {
        // Delete username reservation
        if (currentAppUser.nickname) {
          const normalizedNickname = currentAppUser.nickname.toLowerCase();
          try {
            await deleteDoc(doc(db, 'usernames', normalizedNickname));
          } catch (e) {
            console.error('Error deleting username:', e);
          }
        }
        
        // Delete user document
        try {
          await deleteDoc(doc(db, 'users', currentUser.uid));
        } catch (e) {
          console.error('Error deleting user doc:', e);
        }
      }

      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
    
    setUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser,
      isLoading, 
      isAuthReady,
      login, 
      loginWithGoogle,
      logout, 
      isAuthenticated: !!user && !!firebaseUser,
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
