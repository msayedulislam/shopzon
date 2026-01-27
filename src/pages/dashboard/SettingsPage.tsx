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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <CardTitle className="text-lg">Appearance</CardTitle>
          </div>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
            </div>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle className="text-lg">Notifications</CardTitle>
          </div>
          <CardDescription>Manage how you receive updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Order Updates</Label>
              <p className="text-sm text-muted-foreground">Get notified about order status</p>
            </div>
            <Switch 
              checked={settings.orderUpdates} 
              onCheckedChange={() => handleToggle('orderUpdates')} 
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Promotions & Offers</Label>
              <p className="text-sm text-muted-foreground">Receive deals and discounts</p>
            </div>
            <Switch 
              checked={settings.promotions} 
              onCheckedChange={() => handleToggle('promotions')} 
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Price Drop Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified when wishlist items go on sale</p>
            </div>
            <Switch 
              checked={settings.priceAlerts} 
              onCheckedChange={() => handleToggle('priceAlerts')} 
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
            </div>
            <Switch 
              checked={settings.smsNotifications} 
              onCheckedChange={() => handleToggle('smsNotifications')} 
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Newsletter</Label>
              <p className="text-sm text-muted-foreground">Weekly updates and new arrivals</p>
            </div>
            <Switch 
              checked={settings.newsletter} 
              onCheckedChange={() => handleToggle('newsletter')} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Language & Region */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <CardTitle className="text-lg">Language & Region</CardTitle>
          </div>
          <CardDescription>Set your language and currency preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Language</Label>
              <p className="text-sm text-muted-foreground">Select your preferred language</p>
            </div>
            <Select 
              value={settings.language} 
              onValueChange={(v) => handleSelectChange('language', v)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bn">বাংলা</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Currency</Label>
              <p className="text-sm text-muted-foreground">Display prices in</p>
            </div>
            <Select 
              value={settings.currency} 
              onValueChange={(v) => handleSelectChange('currency', v)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BDT">৳ BDT</SelectItem>
                <SelectItem value="USD">$ USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle className="text-lg">Privacy</CardTitle>
          </div>
          <CardDescription>Control your data visibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Public Profile</Label>
              <p className="text-sm text-muted-foreground">Allow others to see your profile</p>
            </div>
            <Switch 
              checked={settings.showProfile} 
              onCheckedChange={() => handleToggle('showProfile')} 
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Show Order History</Label>
              <p className="text-sm text-muted-foreground">Display purchase history on profile</p>
            </div>
            <Switch 
              checked={settings.showOrderHistory} 
              onCheckedChange={() => handleToggle('showOrderHistory')} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-lg">Account Actions</CardTitle>
          <CardDescription>Manage your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Log Out</Label>
              <p className="text-sm text-muted-foreground">Sign out from your account</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-destructive">Delete Account</Label>
              <p className="text-sm text-muted-foreground">Permanently delete your account and data</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All your data, orders, and wallet balance will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
