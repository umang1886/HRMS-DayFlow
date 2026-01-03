import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Loader2, Eye, EyeOff, Users, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  employeeId: z.string().min(3, 'Employee ID must be at least 3 characters').max(20),
  email: z.string().email('Please enter a valid email').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['employee', 'admin']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const Auth: React.FC = () => {
  const { signIn, signUp, user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup state
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmployeeId, setSignupEmployeeId] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'employee' | 'admin'>('employee');

  useEffect(() => {
    if (!loading && user && role) {
      const redirectPath = role === 'admin' ? '/admin/dashboard' : '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [user, role, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      loginSchema.parse({ email: loginEmail, password: loginPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setIsSubmitting(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Welcome back!');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      signupSchema.parse({
        fullName: signupFullName,
        employeeId: signupEmployeeId,
        email: signupEmail,
        password: signupPassword,
        confirmPassword: signupConfirmPassword,
        role: signupRole,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setIsSubmitting(true);
    const { error } = await signUp(signupEmail, signupPassword, signupFullName, signupEmployeeId, signupRole);
    setIsSubmitting(false);

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('This email is already registered');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Account created successfully!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Branding */}
      <div className="lg:w-1/2 gradient-sidebar p-8 lg:p-12 flex flex-col justify-between min-h-[40vh] lg:min-h-screen relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Dayflow</span>
        </div>

        {/* Main content */}
        <div className="relative z-10 my-8 lg:my-0">
          <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight mb-6">
            Human Resource<br />Management System
          </h1>
          <p className="text-white/70 text-lg max-w-md leading-relaxed">
            Streamline your HR operations with our comprehensive solution for attendance, leave management, payroll, and more.
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap gap-4 mt-8">
            <div className="flex items-center gap-3 px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 transition-all hover:bg-white/15 hover:scale-105 cursor-default">
              <Users className="w-5 h-5 text-white/80" />
              <span className="text-white/90 font-medium">Employee Portal</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 transition-all hover:bg-white/15 hover:scale-105 cursor-default">
              <LayoutDashboard className="w-5 h-5 text-white/80" />
              <span className="text-white/90 font-medium">Admin Dashboard</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 hidden lg:block">
          <p className="text-white/50 text-sm">© 2026 Dayflow. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel - Forms */}
      <div className="lg:w-1/2 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 lg:p-12 flex items-center justify-center">
        <div className="w-full max-w-md animate-fade-in">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tabs */}
            <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-white dark:bg-slate-800 shadow-md rounded-xl h-14">
              <TabsTrigger 
                value="login" 
                className="rounded-lg text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all h-12"
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="rounded-lg text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all h-12"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login" className="mt-0">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200/50 dark:border-slate-700/50">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
                  <p className="text-muted-foreground mt-1">Enter your credentials to sign in</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="name@company.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl pr-12 focus:ring-2 focus:ring-primary/20 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 gradient-primary text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* Signup Form */}
            <TabsContent value="signup" className="mt-0">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200/50 dark:border-slate-700/50">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Create an account</h2>
                  <p className="text-muted-foreground mt-1">Enter your details to get started</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-role" className="text-sm font-medium">Role</Label>
                    <Select value={signupRole} onValueChange={(v) => setSignupRole(v as 'employee' | 'admin')}>
                      <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl z-50">
                        <SelectItem value="employee" className="rounded-lg">Employee</SelectItem>
                        <SelectItem value="admin" className="rounded-lg">Admin / HR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-employee-id" className="text-sm font-medium">Employee ID</Label>
                    <Input
                      id="signup-employee-id"
                      type="text"
                      placeholder="EMP-001"
                      value={signupEmployeeId}
                      onChange={(e) => setSignupEmployeeId(e.target.value)}
                      className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="name@company.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl pr-12 focus:ring-2 focus:ring-primary/20 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password" className="text-sm font-medium">Confirm Password</Label>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 gradient-primary text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] mt-2" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
