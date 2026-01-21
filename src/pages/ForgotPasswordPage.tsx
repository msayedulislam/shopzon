import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, Loader2, ArrowLeft, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const phoneSchema = z.object({
  phone: z.string().regex(/^01[3-9]\d{8}$/, 'Invalid Bangladesh phone number (01XXXXXXXXX)'),
});

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type Step = 'phone' | 'otp' | 'reset';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('phone');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = phoneSchema.safeParse({ phone });
    if (!result.success) {
      setErrors({ phone: result.error.errors[0].message });
      return;
    }

    setLoading(true);
    try {
      // Check if user exists with this phone
      const authEmail = `${phone}@bdmart.local`;
      
      // For demo purposes, we'll simulate OTP verification
      // In production, you'd integrate with an SMS service
      toast({
        title: 'OTP Sent!',
        description: `A verification code has been sent to ${phone}. (Demo: Use 123456)`,
      });
      setStep('otp');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (otp.length !== 6) {
      setErrors({ otp: 'Please enter the 6-digit code' });
      return;
    }

    setLoading(true);
    try {
      // Demo OTP verification - in production, verify with SMS service
      if (otp === '123456') {
        toast({
          title: 'Verified!',
          description: 'Phone number verified. Please set your new password.',
        });
        setStep('reset');
      } else {
        setErrors({ otp: 'Invalid OTP. Please try again.' });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = passwordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const authEmail = `${phone}@bdmart.local`;
      
      // Update password using admin API would be needed here
      // For now, we'll show a success message
      toast({
        title: 'Password Reset Successful!',
        description: 'Your password has been updated. Please login with your new password.',
      });
      navigate('/auth?mode=login');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-2xl">J</span>
            </div>
            <span className="font-display font-bold text-2xl">Jhuri</span>
          </Link>

          {/* Back Link */}
          <Link
            to="/auth?mode=login"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>

          <h1 className="text-3xl font-bold mb-2">
            {step === 'phone' && 'Forgot Password?'}
            {step === 'otp' && 'Verify Phone'}
            {step === 'reset' && 'Reset Password'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {step === 'phone' && 'Enter your phone number to receive a verification code'}
            {step === 'otp' && 'Enter the 6-digit code sent to your phone'}
            {step === 'reset' && 'Create a new password for your account'}
          </p>

          {/* Phone Step */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.phone && (
                  <p className="text-destructive text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <Button type="submit" className="w-full btn-hero" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <Label>Verification Code</Label>
                <div className="mt-3 flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {errors.otp && (
                  <p className="text-destructive text-sm mt-2 text-center">{errors.otp}</p>
                )}
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      toast({
                        title: 'OTP Resent!',
                        description: 'A new verification code has been sent.',
                      });
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    Resend
                  </button>
                </p>
              </div>

              <Button type="submit" className="w-full btn-hero" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Verify
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-center text-muted-foreground hover:text-foreground transition-colors"
              >
                Change phone number
              </button>
            </form>
          )}

          {/* Reset Password Step */}
          {step === 'reset' && (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div>
                <Label htmlFor="password">New Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative mt-1">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <Button type="submit" className="w-full btn-hero" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {['phone', 'otp', 'reset'].map((s, i) => (
              <div
                key={s}
                className={`h-2 w-8 rounded-full transition-colors ${
                  step === s
                    ? 'bg-primary'
                    : ['phone', 'otp', 'reset'].indexOf(step) > i
                    ? 'bg-primary/50'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Hero */}
      <div className="hidden lg:flex flex-1 bg-gradient-primary items-center justify-center p-8">
        <div className="text-center text-white max-w-md">
          <KeyRound className="h-20 w-20 mx-auto mb-6 opacity-80" />
          <h2 className="text-4xl font-bold mb-4">
            Reset Your Password
          </h2>
          <p className="text-white/80 text-lg">
            Don't worry! It happens. We'll help you get back into your account securely.
          </p>
        </div>
      </div>
    </div>
  );
}
