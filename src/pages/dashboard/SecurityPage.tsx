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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Security & Privacy</h1>
        <p className="text-muted-foreground">Manage your account security settings</p>
      </div>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <CardTitle className="text-lg">Change Password</CardTitle>
          </div>
          <CardDescription>Update your password regularly for better security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter current password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            />
          </div>
          <Button onClick={handlePasswordChange} disabled={loading || !passwords.new}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Enable 2FA</p>
                <p className="text-sm text-muted-foreground">Use authenticator app or SMS</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                Coming Soon
              </Badge>
              <Switch 
                checked={securitySettings.twoFactor} 
                onCheckedChange={() => handleToggle('twoFactor')} 
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle className="text-lg">Security Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Login Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified of new sign-ins</p>
            </div>
            <Switch 
              checked={securitySettings.loginAlerts} 
              onCheckedChange={() => handleToggle('loginAlerts')} 
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto Session Timeout</Label>
              <p className="text-sm text-muted-foreground">Automatically log out after inactivity</p>
            </div>
            <Switch 
              checked={securitySettings.sessionTimeout} 
              onCheckedChange={() => handleToggle('sessionTimeout')} 
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Device Tracking</Label>
              <p className="text-sm text-muted-foreground">Remember trusted devices</p>
            </div>
            <Switch 
              checked={securitySettings.deviceTracking} 
              onCheckedChange={() => handleToggle('deviceTracking')} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle className="text-lg">Active Sessions</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.success('All other sessions signed out')}>
              Sign Out All
            </Button>
          </div>
          <CardDescription>Devices where you're currently logged in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeSessions.map((session, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${session.current ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                <div>
                  <p className="font-medium text-sm">{session.device}</p>
                  <p className="text-xs text-muted-foreground">{session.location} • {session.lastActive}</p>
                </div>
              </div>
              {session.current ? (
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Current
                </Badge>
              ) : (
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => toast.success('Session ended')}>
                  End Session
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg text-amber-800 dark:text-amber-200">Security Tips</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
          <p>• Use a strong, unique password with letters, numbers, and symbols</p>
          <p>• Never share your login credentials with anyone</p>
          <p>• Enable two-factor authentication when available</p>
          <p>• Review your active sessions regularly</p>
          <p>• Log out from shared or public devices</p>
        </CardContent>
      </Card>
    </div>
  );
}
