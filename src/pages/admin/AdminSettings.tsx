import { useState, useEffect } from 'react';
import { Settings, Shield, Bell, Globe, Store, CreditCard, Truck, Loader2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type SettingValue = string | number | boolean | object;

export default function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*');

      if (error) throw error;
      
      const settingsMap: Record<string, any> = {};
      data?.forEach(s => {
        settingsMap[s.key] = s.value;
      });
      setSettings(settingsMap);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: SettingValue, category: string, description?: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          key,
          value: value as any,
          category,
          description,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });

      if (error) throw error;
      
      setSettings(prev => ({ ...prev, [key]: value }));
      toast({ title: 'Setting saved' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const updateLocalSetting = (key: string, value: SettingValue) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your store configuration</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="general" className="gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger>
          <TabsTrigger value="shipping" className="gap-2">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Shipping</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="localization" className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Localization</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Basic details about your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input
                    value={settings.store_name || ''}
                    onChange={(e) => updateLocalSetting('store_name', e.target.value)}
                    placeholder="My Store"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={settings.contact_email || ''}
                    onChange={(e) => updateLocalSetting('contact_email', e.target.value)}
                    placeholder="contact@store.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input
                    value={settings.contact_phone || ''}
                    onChange={(e) => updateLocalSetting('contact_phone', e.target.value)}
                    placeholder="+880 1234 567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Support Hours</Label>
                  <Input
                    value={settings.support_hours || ''}
                    onChange={(e) => updateLocalSetting('support_hours', e.target.value)}
                    placeholder="9 AM - 6 PM"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Store Address</Label>
                <Textarea
                  value={settings.store_address || ''}
                  onChange={(e) => updateLocalSetting('store_address', e.target.value)}
                  placeholder="123 Main Street, City, Country"
                />
              </div>
              <Button 
                onClick={() => {
                  saveSetting('store_name', settings.store_name || '', 'general');
                  saveSetting('contact_email', settings.contact_email || '', 'general');
                  saveSetting('contact_phone', settings.contact_phone || '', 'general');
                  saveSetting('support_hours', settings.support_hours || '', 'general');
                  saveSetting('store_address', settings.store_address || '', 'general');
                }}
                disabled={saving}
                className="gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Commission Settings</CardTitle>
              <CardDescription>Platform commission rates for sellers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Default Commission (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.default_commission || 10}
                    onChange={(e) => updateLocalSetting('default_commission', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bronze Seller (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.bronze_commission || 10}
                    onChange={(e) => updateLocalSetting('bronze_commission', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Silver Seller (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.silver_commission || 8}
                    onChange={(e) => updateLocalSetting('silver_commission', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gold Seller (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.gold_commission || 5}
                    onChange={(e) => updateLocalSetting('gold_commission', Number(e.target.value))}
                  />
                </div>
              </div>
              <Button 
                onClick={() => {
                  saveSetting('default_commission', settings.default_commission || 10, 'commission');
                  saveSetting('bronze_commission', settings.bronze_commission || 10, 'commission');
                  saveSetting('silver_commission', settings.silver_commission || 8, 'commission');
                  saveSetting('gold_commission', settings.gold_commission || 5, 'commission');
                }}
                disabled={saving}
                className="gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Commission Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Enable or disable payment options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/30">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-muted-foreground">Accept payment upon delivery</p>
                  </div>
                </div>
                <Switch
                  checked={settings.cod_enabled !== false}
                  onCheckedChange={(checked) => saveSetting('cod_enabled', checked, 'payment')}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg dark:bg-pink-900/30">
                    <CreditCard className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-medium">bKash</p>
                    <p className="text-sm text-muted-foreground">Mobile payment via bKash</p>
                  </div>
                </div>
                <Switch
                  checked={settings.bkash_enabled !== false}
                  onCheckedChange={(checked) => saveSetting('bkash_enabled', checked, 'payment')}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg dark:bg-orange-900/30">
                    <CreditCard className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">Nagad</p>
                    <p className="text-sm text-muted-foreground">Mobile payment via Nagad</p>
                  </div>
                </div>
                <Switch
                  checked={settings.nagad_enabled !== false}
                  onCheckedChange={(checked) => saveSetting('nagad_enabled', checked, 'payment')}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/30">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Card Payment</p>
                    <p className="text-sm text-muted-foreground">Visa/Mastercard payments</p>
                  </div>
                </div>
                <Switch
                  checked={settings.card_enabled !== false}
                  onCheckedChange={(checked) => saveSetting('card_enabled', checked, 'payment')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Charges</CardTitle>
              <CardDescription>Configure shipping costs by area</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Inside Dhaka (৳)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.shipping_inside_dhaka || 60}
                    onChange={(e) => updateLocalSetting('shipping_inside_dhaka', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Outside Dhaka (৳)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.shipping_outside_dhaka || 120}
                    onChange={(e) => updateLocalSetting('shipping_outside_dhaka', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Free Shipping Threshold (৳)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.free_shipping_threshold || 2000}
                    onChange={(e) => updateLocalSetting('free_shipping_threshold', Number(e.target.value))}
                  />
                </div>
              </div>
              <Button 
                onClick={() => {
                  saveSetting('shipping_inside_dhaka', settings.shipping_inside_dhaka || 60, 'shipping');
                  saveSetting('shipping_outside_dhaka', settings.shipping_outside_dhaka || 120, 'shipping');
                  saveSetting('free_shipping_threshold', settings.free_shipping_threshold || 2000, 'shipping');
                }}
                disabled={saving}
                className="gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Shipping Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery SLA</CardTitle>
              <CardDescription>Expected delivery timeframes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Inside Dhaka (hours)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={settings.sla_inside_dhaka || 24}
                    onChange={(e) => updateLocalSetting('sla_inside_dhaka', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Outside Dhaka (hours)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={settings.sla_outside_dhaka || 72}
                    onChange={(e) => updateLocalSetting('sla_outside_dhaka', Number(e.target.value))}
                  />
                </div>
              </div>
              <Button 
                onClick={() => {
                  saveSetting('sla_inside_dhaka', settings.sla_inside_dhaka || 24, 'shipping');
                  saveSetting('sla_outside_dhaka', settings.sla_outside_dhaka || 72, 'shipping');
                }}
                disabled={saving}
                className="gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save SLA Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure email alerts for different events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">New Order Alert</p>
                  <p className="text-sm text-muted-foreground">Email when a new order is placed</p>
                </div>
                <Switch
                  checked={settings.notify_new_order !== false}
                  onCheckedChange={(checked) => saveSetting('notify_new_order', checked, 'notification')}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Low Stock Alert</p>
                  <p className="text-sm text-muted-foreground">Email when product stock is low</p>
                </div>
                <Switch
                  checked={settings.notify_low_stock !== false}
                  onCheckedChange={(checked) => saveSetting('notify_low_stock', checked, 'notification')}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">New Seller Registration</p>
                  <p className="text-sm text-muted-foreground">Email when a new seller registers</p>
                </div>
                <Switch
                  checked={settings.notify_new_seller !== false}
                  onCheckedChange={(checked) => saveSetting('notify_new_seller', checked, 'notification')}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Customer Inquiry</p>
                  <p className="text-sm text-muted-foreground">Email for new contact form submissions</p>
                </div>
                <Switch
                  checked={settings.notify_inquiry !== false}
                  onCheckedChange={(checked) => saveSetting('notify_inquiry', checked, 'notification')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                </div>
                <Switch
                  checked={settings.require_2fa === true}
                  onCheckedChange={(checked) => saveSetting('require_2fa', checked, 'security')}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Fraud Detection</p>
                  <p className="text-sm text-muted-foreground">Enable AI-powered fraud detection</p>
                </div>
                <Switch
                  checked={settings.fraud_detection !== false}
                  onCheckedChange={(checked) => saveSetting('fraud_detection', checked, 'security')}
                />
              </div>
              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <Select
                  value={String(settings.session_timeout || 60)}
                  onValueChange={(v) => saveSetting('session_timeout', Number(v), 'security')}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="480">8 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Localization Settings */}
        <TabsContent value="localization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>Configure currency, language, and timezone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={settings.currency || 'BDT'}
                    onValueChange={(v) => saveSetting('currency', v, 'localization')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BDT">BDT (৳)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={settings.timezone || 'Asia/Dhaka'}
                    onValueChange={(v) => saveSetting('timezone', v, 'localization')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Dhaka">Asia/Dhaka (GMT+6)</SelectItem>
                      <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select
                    value={settings.date_format || 'DD/MM/YYYY'}
                    onValueChange={(v) => saveSetting('date_format', v, 'localization')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={settings.language || 'en'}
                    onValueChange={(v) => saveSetting('language', v, 'localization')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
