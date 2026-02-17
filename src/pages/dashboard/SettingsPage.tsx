import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Bell, Globe, Shield, Trash2, LogOut, Moon, Sun, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function SettingsPage() {
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    // Notifications
    orderUpdates: true,
    promotions: true,
    priceAlerts: false,
    newsletter: true,
    smsNotifications: true,

    // Privacy
    showProfile: true,
    showOrderHistory: false,

    // Preferences
    language: 'bn',
    currency: 'BDT',
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Setting updated');
  };

  const handleSelectChange = (key: keyof typeof settings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success('Setting updated');
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion requires contacting support');
  };

  return (
    <div className="space-y-8">
      {/* Header - Premium Govaly Design */}
      <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 p-8 shadow-xl shadow-primary/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 italic">Dashboard</p>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">System Calibration</h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2 opacity-70">
              Manage your premium interface and operational protocols
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="h-14 px-8 rounded-2xl border-border/10 hover:bg-primary hover:text-white font-black uppercase tracking-widest text-[10px] transition-all group/btn shadow-sm"
          >
            <LogOut className="h-4 w-4 mr-3 group-hover/btn:translate-x-1 transition-transform" strokeWidth={3} />
            Terminate Session
          </Button>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Appearance - High Density Card */}
        <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 p-8 shadow-xl shadow-primary/5 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-primary border border-border/10">
              {theme === 'dark' ? <Moon className="h-6 w-6" strokeWidth={2.5} /> : <Sun className="h-6 w-6" strokeWidth={2.5} />}
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter italic">Interface Aesthetics</h2>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Personalize your visual experience</p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-secondary/10 p-6 rounded-3xl border border-border/5 relative z-10">
            <div>
              <Label className="text-[10px] font-black uppercase tracking-widest mb-1 block">Visual Mode</Label>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Toggle between high-contrast legacy modes</p>
            </div>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-40 h-11 bg-white dark:bg-card rounded-xl border-border/5 font-black uppercase tracking-widest text-[9px] shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/5 p-2">
                <SelectItem value="light" className="text-[9px] font-black uppercase tracking-widest">Daylight Protocol</SelectItem>
                <SelectItem value="dark" className="text-[9px] font-black uppercase tracking-widest">Nocturnal Legacy</SelectItem>
                <SelectItem value="system" className="text-[9px] font-black uppercase tracking-widest">Auto Synchronize</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notifications - High Density Grid */}
        <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 p-8 shadow-xl shadow-primary/5 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-primary border border-border/10">
              <Bell className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter italic">Signal Protocols</h2>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Manage real-time communication channels</p>
            </div>
          </div>

          <div className="grid gap-4 relative z-10">
            {[
              { key: 'orderUpdates', label: 'Order Status Sync', desc: 'Real-time updates on heritage deployment' },
              { key: 'promotions', label: 'Privilege Alerts', desc: 'Notify regarding exclusive reward protocols' },
              { key: 'priceAlerts', label: 'Economic Monitoring', desc: 'Track fluctuations in wishlist artifact value' },
              { key: 'smsNotifications', label: 'Direct Wire Protocol', desc: 'Receive urgent telemetry via SMS' },
              { key: 'newsletter', label: 'Heritage Digest', desc: 'Weekly briefing on newly archives arrivals' }
            ].map((item, index) => (
              <div key={item.key} className="flex flex-col">
                <div className="flex items-center justify-between p-4 bg-secondary/5 hover:bg-secondary/10 rounded-2xl transition-colors border border-transparent hover:border-border/5">
                  <div className="pr-8">
                    <Label className="text-[10px] font-black uppercase tracking-widest mb-1 block">{item.label}</Label>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">{item.desc}</p>
                  </div>
                  <Switch
                    checked={settings[item.key as keyof typeof settings] as boolean}
                    onCheckedChange={() => handleToggle(item.key as keyof typeof settings)}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
                {index < 4 && <div className="h-px bg-border/5 mx-4 my-1 opacity-50" />}
              </div>
            ))}
          </div>
        </div>

        {/* Region & Logic */}
        <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 p-8 shadow-xl shadow-primary/5 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-primary border border-border/10">
              <Globe className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter italic">Regional Calibration</h2>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Adjust local heritage parameters</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            <div className="bg-secondary/10 p-5 rounded-3xl border border-border/5">
              <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3 block ml-1">Legacy Language</Label>
              <Select value={settings.language} onValueChange={(v) => handleSelectChange('language', v)}>
                <SelectTrigger className="w-full h-11 bg-white dark:bg-card rounded-xl border-border/5 font-black uppercase tracking-widest text-[9px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/5 p-2">
                  <SelectItem value="bn" className="text-[9px] font-black uppercase tracking-widest">Native Dialect (বাংলা)</SelectItem>
                  <SelectItem value="en" className="text-[9px] font-black uppercase tracking-widest">Global Protocol (English)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-secondary/10 p-5 rounded-3xl border border-border/5">
              <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3 block ml-1">Economic Unit</Label>
              <Select value={settings.currency} onValueChange={(v) => handleSelectChange('currency', v)}>
                <SelectTrigger className="w-full h-11 bg-white dark:bg-card rounded-xl border-border/5 font-black uppercase tracking-widest text-[9px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/5 p-2">
                  <SelectItem value="BDT" className="text-[9px] font-black uppercase tracking-widest">৳ BDT Legacy</SelectItem>
                  <SelectItem value="USD" className="text-[9px] font-black uppercase tracking-widest">$ USD Global</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Security & Danger Zone - Premium Distinction */}
        <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 p-8 shadow-xl shadow-primary/5 group relative overflow-hidden border-destructive/10">
          <div className="absolute top-0 right-0 w-24 h-24 bg-destructive/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-destructive/5 flex items-center justify-center text-destructive border border-destructive/10">
              <Shield className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter italic text-destructive">Legacy Termination</h2>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">High-risk operational protocols</p>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="p-6 bg-secondary/5 rounded-3xl border border-border/5 flex items-center justify-between">
              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest mb-1 block">Account Deletion</Label>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Permanently wipe all archives and heritage data</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="h-11 px-6 rounded-xl text-destructive hover:bg-destructive/10 font-black uppercase tracking-widest text-[9px]">
                    Wipe Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2.5rem] border-border/5 p-10">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter italic text-destructive">Confirm Termination?</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs font-bold uppercase tracking-widest leading-relaxed">
                      THIS PROTOCOL CANNOT BE REVERSED. ALL HERITAGE LOGS, WALLET BALANCES, AND SECURE VAULT ARTIFACTS WILL BE PERMANENTLY ERASED.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-8 gap-4">
                    <AlertDialogCancel className="h-12 px-8 rounded-2xl border-border/5 font-black uppercase tracking-widest text-[9px]">Abort</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="h-12 px-8 rounded-2xl bg-destructive text-white font-black uppercase tracking-widest text-[9px] shadow-xl shadow-destructive/20"
                    >
                      Execute Wipe
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
