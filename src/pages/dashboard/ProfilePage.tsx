import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Mail, Phone, Camera, Loader2, Check, Shield, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { profile, fetchProfile } = useOutletContext<any>();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        email: profile.email || user?.email || '',
      });
    }
  }, [profile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          email: formData.email,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
      fetchProfile();
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

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'long',
    })
    : 'N/A';

  return (
    <div className="space-y-8">
      {/* Header Card - Premium Govaly Design */}
      <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 overflow-hidden shadow-xl shadow-primary/5 relative">
        {/* Cover Gradient with Pattern */}
        <div className="h-32 bg-gradient-premium relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        </div>

        {/* Profile Info Overlay */}
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
            {/* Avatar - High Density */}
            <div className="relative group">
              <Avatar className="h-32 w-32 border-[6px] border-white shadow-2xl relative z-10">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-primary text-white text-3xl font-black uppercase tracking-tighter italic">
                  {getInitials(formData.full_name || user?.email || 'User')}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-2 right-2 w-10 h-10 rounded-2xl bg-white border border-border/5 text-primary flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-all z-20 active:scale-95">
                <Camera className="h-5 w-5" strokeWidth={2.5} />
              </button>
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* User Details */}
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-black uppercase tracking-tighter italic leading-none">
                  {formData.full_name || 'Govaly User'}
                </h1>
                <Badge variant="outline" className="gap-1.5 border-primary/20 text-primary bg-primary/5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                  <Shield className="h-3 w-3" strokeWidth={3} />
                  Verified Member
                </Badge>
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                {formData.email}
              </p>
            </div>

            {/* Loyalty Info / Stats */}
            <div className="bg-primary/5 p-4 rounded-3xl border border-primary/10">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Member Since</p>
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-tighter italic text-sm">
                <Calendar className="h-4 w-4" strokeWidth={3} />
                {memberSince}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mt-12" />

            <div className="relative mb-10">
              <h2 className="text-xl font-black uppercase tracking-tighter italic mb-1">Account Information</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Update your personal details below</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="full_name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    Full Name <span className="text-primary">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-primary" strokeWidth={2.5} />
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      className="pl-12 h-14 rounded-2xl bg-secondary/30 border-none focus-visible:ring-primary shadow-inner font-bold uppercase tracking-tight"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Phone Verification
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/50" strokeWidth={2.5} />
                    <Input
                      id="phone"
                      value={formData.phone}
                      readOnly
                      className="pl-12 h-14 rounded-2xl bg-secondary/50 border-none text-muted-foreground font-bold cursor-not-allowed italic"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Shield className="h-4 w-4 text-emerald-500" strokeWidth={3} />
                    </div>
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-1 italic">
                    Contact Govaly support to change
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-primary" strokeWidth={2.5} />
                  <Input
                    id="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-12 h-14 rounded-2xl bg-secondary/30 border-none focus-visible:ring-primary shadow-inner font-bold"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={loading} className="h-14 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-3" />
                  ) : (
                    <Check className="h-5 w-5 mr-3" strokeWidth={3} />
                  )}
                  Save Profile
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Info Sidebar Column */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-card p-8 rounded-[2.5rem] border border-border/5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest italic mb-6">Security Check</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 text-emerald-600" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1">Authenticity</p>
                  <p className="text-[9px] font-bold text-muted-foreground leading-relaxed uppercase">Your identity is verified via phone number 2FA.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-primary" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1">Account Lifetime</p>
                  <p className="text-[9px] font-bold text-muted-foreground leading-relaxed uppercase">You've been a Govaly member for over a year.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10">
            <h3 className="text-[11px] font-black uppercase tracking-widest italic text-primary mb-4">Why verify?</h3>
            <p className="text-[10px] font-bold leading-relaxed text-muted-foreground uppercase tracking-tight">
              Verified accounts receive faster checkout, exclusive reward multiplier, and early access to Govaly Flash Sales.
            </p>
            <Button variant="outline" className="mt-6 w-full rounded-2xl border-primary/20 text-primary font-black uppercase tracking-widest text-[9px] h-10">
              Learn More
            </Button>
          </div>
        </div>
      </div>
      );
}
