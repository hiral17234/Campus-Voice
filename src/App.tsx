// CampusVoice App
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { IssuesProvider } from "./context/IssuesContext";
import Login from "./pages/Login";
import StudentFeed from "./pages/StudentFeed";
import CreateIssue from "./pages/CreateIssue";
import IssueDetail from "./pages/IssueDetail";
import AdminDashboard from "./pages/AdminDashboard";
import PublicStats from "./pages/PublicStats";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import AccountSuspended from "./pages/AccountSuspended";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./lib/firebase";

const queryClient = new QueryClient();

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'student' | 'admin' }) {
  const { user, firebaseUser, isLoading, isAuthenticated } = useAuth();
  const [isDisabled, setIsDisabled] = useState<boolean | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkDisabledStatus = async () => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setIsDisabled(userDoc.data().isDisabled || false);
          }
        } catch (error) {
          console.error('Error checking disabled status:', error);
        }
      }
      setCheckingStatus(false);
    };

    if (!isLoading) {
      checkDisabledStatus();
    }
  }, [firebaseUser, isLoading]);

  if (isLoading || checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Redirect disabled users to suspended page
  if (isDisabled) {
    return <Navigate to="/suspended" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/feed'} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated 
            ? <Navigate to={user?.role === 'admin' ? '/admin' : '/feed'} replace />
            : <Login />
        } 
      />
      <Route 
        path="/feed" 
        element={
          <ProtectedRoute requiredRole="student">
            <StudentFeed />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/create" 
        element={
          <ProtectedRoute>
            <CreateIssue />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/issue/:id" 
        element={
          <ProtectedRoute>
            <IssueDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/stats" 
        element={
          <ProtectedRoute>
            <PublicStats />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } 
      />
      <Route path="/suspended" element={<AccountSuspended />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <IssuesProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </IssuesProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
