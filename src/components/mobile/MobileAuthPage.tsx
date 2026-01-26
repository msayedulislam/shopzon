import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^01[3-9]\d{8}$/, 'Invalid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
});

const signInSchema = z.object({
  phone: z.string().regex(/^01[3-9]\d{8}$/, 'Invalid phone number'),
  password: z.string().min(1, 'Password is required'),
});

export function MobileAuthPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });

  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    setIsLogin(mode === 'login');
  }, [mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (isLogin) {
        const result = signInSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            fieldErrors[err.path[0]] = err.message;
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }
        const { error } = await signIn(formData.phone, formData.password);
        if (error) {
          toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
          navigate('/');
        }
      } else {
        const result = signUpSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            fieldErrors[err.path[0]] = err.message;
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }
        const { error } = await signUp(formData.phone, formData.password, formData.fullName, formData.email || undefined);
        if (error) {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Account Created!', description: 'Welcome to Jhuri!' });
          navigate('/');
        }
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border/50 safe-area-top">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-base font-semibold text-foreground ml-2">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h1>
        </div>
      </header>

      <div className="px-6 py-8">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-8"
        >
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-2xl">J</span>
          </div>
          <span className="font-bold text-2xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <span className="text-primary">Jhu</span>ri
          </span>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold mb-2">
            {isLogin ? 'Welcome back!' : 'Create account'}
          </h2>
          <p className="text-muted-foreground mb-8">
            {isLogin ? 'Enter your phone number and password' : 'Join Jhuri to start shopping'}
          </p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
              {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName}</p>}
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                name="phone"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
          </div>

          {!isLogin && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email (Optional)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-primary/30 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
              </button>
            </div>
            {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
          </div>

          {isLogin && (
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary">
                Forgot password?
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-primary text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground uppercase">Or continue with</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google Button */}
        <button
          type="button"
          onClick={async () => {
            await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: `${window.location.origin}/` },
            });
          }}
          className="w-full py-3 rounded-full border border-border flex items-center justify-center gap-3 font-medium"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        {/* Switch Mode */}
        <p className="text-center mt-6 text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <Link
            to={`/auth?mode=${isLogin ? 'register' : 'login'}`}
            className="text-primary font-medium ml-1"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </Link>
        </p>
      </div>
    </div>
  );
}
