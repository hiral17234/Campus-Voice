import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from 'sonner';
import { Shield, Users, Lock, Mail, Eye, EyeOff, RefreshCw, User, Check, X, Loader2 } from 'lucide-react';
import { UserRole, generateNickname } from '@/types';
import campusVoiceLogo from '@/assets/campusvoice-logo.png';

export default function Login() {
  const [role, setRole] = useState<UserRole>('student');
  const [campusCode, setCampusCode] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nickname, setNickname] = useState('');
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);
  const { login, checkNicknameAvailable, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(role === 'student' ? '/feed' : '/admin');
    }
  }, [isAuthenticated, navigate, role]);

  // Generate initial nickname
  useEffect(() => {
    setNickname(generateNickname());
  }, []);

  // Check nickname availability with debounce
  useEffect(() => {
    if (!nickname || nickname.length < 3) {
      setNicknameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingNickname(true);
      try {
        const available = await checkNicknameAvailable(nickname);
        setNicknameAvailable(available);
      } catch (error) {
        console.error('Error checking nickname:', error);
        setNicknameAvailable(null);
      }
      setIsCheckingNickname(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [nickname, checkNicknameAvailable]);

  const handleGenerateNickname = () => {
    setNickname(generateNickname());
    setNicknameAvailable(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === 'student' && nicknameAvailable === false) {
      toast.error('Please choose a different nickname - this one is taken');
      return;
    }

    if (role === 'student' && nickname.length < 3) {
      toast.error('Nickname must be at least 3 characters');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(role, campusCode, adminEmail, adminPassword, role === 'student' ? nickname : undefined);

      if (result.success) {
        toast.success(role === 'student' ? 'Welcome to CampusVoice!' : 'Admin access granted');
        navigate(role === 'student' ? '/feed' : '/admin');
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl overflow-hidden mb-4"
          >
            <img src={campusVoiceLogo} alt="CampusVoice" className="w-full h-full object-contain p-1" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground">CampusVoice</h1>
          <p className="text-muted-foreground mt-2">Anonymous platform for campus community</p>
        </div>

        <Card className="glass-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>Select your role to continue</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role Toggle */}
            <div className="flex rounded-lg bg-muted p-1 mb-6">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                  role === 'student'
                    ? 'bg-card shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Users className="h-4 w-4" />
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                  role === 'admin'
                    ? 'bg-card shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Shield className="h-4 w-4" />
                Faculty
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Anonymous Nickname - Students only */}
              <AnimatePresence mode="wait">
                {role === 'student' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <Label htmlFor="nickname">Your Anonymous Name</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="nickname"
                          type="text"
                          placeholder="Choose your anonymous name"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          className="pl-10 pr-10"
                          required
                          minLength={3}
                          maxLength={20}
                        />
                        {nickname.length >= 3 && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isCheckingNickname ? (
                              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                            ) : nicknameAvailable === true ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : nicknameAvailable === false ? (
                              <X className="h-4 w-4 text-destructive" />
                            ) : null}
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleGenerateNickname}
                        title="Generate random name"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    {nicknameAvailable === false && (
                      <p className="text-xs text-destructive">This name is already taken</p>
                    )}
                    {nicknameAvailable === true && (
                      <p className="text-xs text-green-600 dark:text-green-400">Name is available!</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Campus Code - Both roles need this */}
              <div className="space-y-2">
                <Label htmlFor="campusCode">
                  {role === 'student' ? 'Campus Access Code' : 'Faculty Access Code'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="campusCode"
                    type="text"
                    placeholder="Enter access code"
                    value={campusCode}
                    onChange={(e) => setCampusCode(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {role === 'student' ? 'Hint: CAMPUS2024' : 'Hint: MITS2025'}
                </p>
              </div>

              {/* Admin-specific fields */}
              <AnimatePresence mode="wait">
                {role === 'admin' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email">Admin Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="admin@campus.edu"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="pl-10"
                          required={role === 'admin'}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required={role === 'admin'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">Hint: admin@institute.edu / Admin9302@</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button 
                type="submit" 
                className="w-full gradient-primary" 
                disabled={isLoading || (role === 'student' && nicknameAvailable === false) || (role === 'student' && isCheckingNickname)}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : role === 'student' ? (
                  'Enter Anonymously'
                ) : (
                  'Access Dashboard'
                )}
              </Button>
            </form>

            {role === 'student' && (
              <p className="text-xs text-center text-muted-foreground mt-4">
                Your identity will remain anonymous. Choose a unique nickname above.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
