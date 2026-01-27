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
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Cover Gradient */}
        <div className="h-24 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
        
        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-card shadow-xl">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {getInitials(formData.full_name || user?.email || 'User')}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-secondary border-2 border-card text-foreground flex items-center justify-center shadow-lg hover:bg-primary hover:text-primary-foreground transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 pt-2 md:pt-0">
              <h1 className="text-2xl font-bold">{formData.full_name || 'Welcome!'}</h1>
              <p className="text-muted-foreground">{formData.email}</p>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 border-emerald-200 text-emerald-600 bg-emerald-50">
                <Shield className="h-3 w-3" />
                Verified
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                Since {memberSince}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-lg font-semibold mb-6">Personal Information</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="pl-10 h-12"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  readOnly
                  className="pl-10 h-12 bg-secondary/50 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Phone number cannot be changed
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="pl-10 h-12"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="gap-2 px-6">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
