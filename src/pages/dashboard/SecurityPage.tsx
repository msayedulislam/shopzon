import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Shield, Key, Smartphone, Eye, EyeOff, Lock, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function SecurityPage() {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false,
    loginAlerts: true,
    sessionTimeout: true,
    deviceTracking: true,
  });

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwords.new.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;

      toast.success('Password updated successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof typeof securitySettings) => {
    if (key === 'twoFactor') {
      toast.info('Two-factor authentication coming soon');
      return;
    }
    setSecuritySettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Setting updated');
  };

  // Mock active sessions
  const activeSessions = [
    { device: 'Chrome on Windows', location: 'Dhaka, BD', current: true, lastActive: 'Now' },
    { device: 'Safari on iPhone', location: 'Dhaka, BD', current: false, lastActive: '2 hours ago' },
  ];

  return (
    <div className="space-y-8">
      {/* Header - Premium Govaly Design */}
      <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 p-8 shadow-xl shadow-primary/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 italic">Dashboard</p>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Vault Core Security</h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2 opacity-70">
              Manage heritage protection and encryption protocols
            </p>
          </div>
          <div className="flex items-center gap-3 bg-secondary/30 p-2 rounded-2xl border border-border/5 px-6 py-3">
            <Shield className="h-6 w-6 text-primary" strokeWidth={3} />
            <div className="pr-4 border-l border-border/10 pl-4 ml-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Protection Level</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-sm font-black uppercase tracking-tighter italic">Optimal</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Cipher Reconfiguration - Password Change */}
        <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 p-8 shadow-xl shadow-primary/5 group relative overflow-hidden order-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-primary border border-border/10">
              <Key className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter italic">Cipher Reconfiguration</h2>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Update your master access protocols</p>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Cipher</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="ENTER EXISTING PROTOCOL"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="h-12 bg-secondary/30 border-none rounded-xl focus-visible:ring-primary shadow-inner font-bold tracking-widest text-[10px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={2.5} /> : <Eye className="h-4 w-4" strokeWidth={2.5} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Master Protocol</Label>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="DEPLOY NEW CIPHER"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                className="h-12 bg-secondary/30 border-none rounded-xl focus-visible:ring-primary shadow-inner font-bold tracking-widest text-[10px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Verify New Cipher</Label>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="CONFIRM DEPLOYMENT"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className="h-12 bg-secondary/30 border-none rounded-xl focus-visible:ring-primary shadow-inner font-bold tracking-widest text-[10px]"
              />
            </div>

            <Button
              onClick={handlePasswordChange}
              disabled={loading || !passwords.new}
              className="w-full h-12 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 'Execute Update'}
            </Button>
          </div>
        </div>

        {/* Identity Verification - 2FA */}
        <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 p-8 shadow-xl shadow-primary/5 group relative overflow-hidden order-2 md:order-3">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-primary border border-border/10">
              <Smartphone className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter italic">Identity Verification</h2>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Multi-factor heritage protection</p>
            </div>
          </div>

          <div className="bg-secondary/10 p-6 rounded-[2rem] border border-border/5 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-white dark:bg-card flex items-center justify-center border border-border/5 shadow-sm text-muted-foreground/30">
                  <Shield className="h-7 w-7" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1">Dual-Stage Auth</p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Requires secondary protocol sync</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest text-primary bg-primary/5 border-primary/20 px-3 py-1 rounded-full">
                  CALIBRATING
                </Badge>
                <Switch
                  checked={securitySettings.twoFactor}
                  onCheckedChange={() => handleToggle('twoFactor')}
                  disabled
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-primary/5 rounded-3xl border border-primary/10">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
              <p className="text-[9px] font-bold text-muted-foreground uppercase leading-relaxed">
                CRITICAL: Multi-factor authentication is under heritage development. Contact logistics for manual session override protocols.
              </p>
            </div>
          </div>
        </div>

        {/* Security Parameters */}
        <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 p-8 shadow-xl shadow-primary/5 group relative overflow-hidden order-3 md:order-2">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-primary border border-border/10">
              <Lock className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter italic">Operational Guard</h2>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Monitor real-time security events</p>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            {[
              { key: 'loginAlerts', label: 'Access Telemetry', desc: 'Notify regarding unauthorized sign-ins' },
              { key: 'sessionTimeout', label: 'Auto-Purge Protocol', desc: 'Terminate session after inactivity' },
              { key: 'deviceTracking', label: 'Artifact Recognition', desc: 'Remember and whitelist trusted devices' }
            ].map((item, index) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-secondary/10 rounded-2xl hover:bg-secondary/20 transition-all border border-transparent hover:border-border/5">
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest mb-1 block">{item.label}</Label>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">{item.desc}</p>
                </div>
                <Switch
                  checked={securitySettings[item.key as keyof typeof securitySettings] as boolean}
                  onCheckedChange={() => handleToggle(item.key as keyof typeof securitySettings)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Active Session Monitoring */}
        <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 p-8 shadow-xl shadow-primary/5 group relative overflow-hidden md:col-span-2 order-4">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 group-hover:scale-110 transition-transform" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center text-primary border border-border/10 shadow-inner">
                <Shield className="h-7 w-7" strokeWidth={3} />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter italic">Session Telemetry</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Monitor active heritage connections</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Global purge sequence initiated')}
              className="h-12 px-8 rounded-xl border-destructive/20 text-destructive hover:bg-destructive hover:text-white font-black uppercase tracking-widest text-[9px] transition-all"
            >
              Force Global Purge
            </Button>
          </div>

          <div className="grid gap-4 relative z-10">
            {activeSessions.map((session, index) => (
              <div key={index} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-secondary/5 hover:bg-secondary/10 rounded-[2rem] border border-border/5 transition-all group/session">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className={`h-3 w-3 rounded-full absolute -top-1 -right-1 z-20 ${session.current ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-muted-foreground'}`} />
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-card border border-border/5 flex items-center justify-center text-muted-foreground shadow-sm">
                      <Smartphone className="h-6 w-6" strokeWidth={2} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest leading-none mb-2">{session.device}</h3>
                    <p className="text-[10px] font-black uppercase tracking-tighter italic text-muted-foreground">
                      Coordinates: <span className="text-black dark:text-white">{session.location}</span> • Status: <span className="text-primary">{session.lastActive}</span>
                    </p>
                  </div>
                </div>
                {session.current ? (
                  <Badge variant="outline" className="mt-4 md:mt-0 bg-emerald-500 hover:bg-emerald-500 text-white border-0 px-5 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                    <CheckCircle className="h-3 w-3 mr-2" strokeWidth={3} />
                    Current Node
                  </Badge>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4 md:mt-0 h-10 px-5 rounded-lg text-destructive hover:bg-destructive/10 font-black uppercase tracking-widest text-[9px] transition-all"
                    onClick={() => toast.success('Node disconnected')}
                  >
                    Terminate Node
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
