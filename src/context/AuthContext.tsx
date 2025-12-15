import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, generateNickname, STUDENT_CODE, FACULTY_CODE } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (role: UserRole, accessCode: string, email?: string, password?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Faculty credentials stored (in production, this would be server-side)
const FACULTY_ACCOUNTS: Record<string, string> = {
  'faculty@campus.edu': 'faculty123',
  'admin@campus.edu': 'admin123',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('campusvoice_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser({ ...parsed, createdAt: new Date(parsed.createdAt) });
      } catch {
        localStorage.removeItem('campusvoice_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (role: UserRole, accessCode: string, email?: string, password?: string): Promise<boolean> => {
    // Validate access codes based on role
    if (role === 'student' && accessCode !== STUDENT_CODE) {
      return false;
    }
    
    if (role === 'faculty' && accessCode !== FACULTY_CODE) {
      return false;
    }

    // Faculty requires email + password validation
    if (role === 'faculty') {
      if (!email || !password) return false;
      const storedPassword = FACULTY_ACCOUNTS[email];
      if (!storedPassword || storedPassword !== password) {
        return false;
      }
    }

    const newUser: User = {
      id: role === 'student' ? crypto.randomUUID() : `faculty_${email}`,
      role,
      nickname: role === 'student' ? generateNickname() : 'Faculty Member',
      email: role === 'faculty' ? email : undefined,
      createdAt: new Date(),
    };

    setUser(newUser);
    localStorage.setItem('campusvoice_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    if (user?.role === 'student') {
      // Delete all student-related data on logout
      const userId = user.id;
      
      // Remove student's issues
      const storedIssues = localStorage.getItem('campusvoice_issues');
      if (storedIssues) {
        try {
          const issues = JSON.parse(storedIssues);
          const filteredIssues = issues.filter((issue: any) => issue.authorId !== userId);
          localStorage.setItem('campusvoice_issues', JSON.stringify(filteredIssues));
        } catch {}
      }

      // Remove student's votes from issues
      if (storedIssues) {
        try {
          const issues = JSON.parse(storedIssues);
          const updatedIssues = issues.map((issue: any) => {
            if (issue.votedUsers && issue.votedUsers[userId]) {
              const voteType = issue.votedUsers[userId];
              delete issue.votedUsers[userId];
              if (voteType === 'up') issue.upvotes = Math.max(0, issue.upvotes - 1);
              if (voteType === 'down') issue.downvotes = Math.max(0, issue.downvotes - 1);
            }
            return issue;
          });
          localStorage.setItem('campusvoice_issues', JSON.stringify(updatedIssues));
        } catch {}
      }

      // Remove student's comments
      const storedComments = localStorage.getItem('campusvoice_comments');
      if (storedComments) {
        try {
          const comments = JSON.parse(storedComments);
          const filteredComments: Record<string, any[]> = {};
          Object.keys(comments).forEach(issueId => {
            filteredComments[issueId] = comments[issueId].filter((c: any) => c.authorId !== userId);
          });
          localStorage.setItem('campusvoice_comments', JSON.stringify(filteredComments));
        } catch {}
      }

      // Remove user stats
      localStorage.removeItem(`campusvoice_userstats_${userId}`);
    }

    setUser(null);
    localStorage.removeItem('campusvoice_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
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
