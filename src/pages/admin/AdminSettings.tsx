import { useState, useEffect } from 'react';
import { Settings, Shield, Bell, Globe, Store, CreditCard, Truck, Loader2, Save, MapPin, Plus, Trash2, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type SettingValue = string | number | boolean | object;

interface ShippingZone {
  id: string;
  name: string;
  areas: string[];
  rate: number;
  slaHours: number;
  isActive: boolean;
}

interface CommissionTier {
  id: string;
  name: string;
  minSales: number;
  maxSales: number | null;
  rate: number;
}

export default function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, any>>({});
  
  // Shipping zones state
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [zoneDialogOpen, setZoneDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [newZone, setNewZone] = useState<Partial<ShippingZone>>({
    name: '',
    areas: [],
    rate: 0,
    slaHours: 24,
    isActive: true
  });
  const [newAreaInput, setNewAreaInput] = useState('');

  // Commission tiers state
  const [commissionTiers, setCommissionTiers] = useState<CommissionTier[]>([]);
  const [tierDialogOpen, setTierDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<CommissionTier | null>(null);
  const [newTier, setNewTier] = useState<Partial<CommissionTier>>({
    name: '',
    minSales: 0,
    maxSales: null,
    rate: 10
  });

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
      
      // Load shipping zones from settings
      if (settingsMap.shipping_zones) {
        setShippingZones(settingsMap.shipping_zones as ShippingZone[]);
      } else {
        // Default zones
        setShippingZones([
          { id: '1', name: 'Inside Dhaka', areas: ['Dhaka', 'Mirpur', 'Uttara', 'Gulshan', 'Banani', 'Dhanmondi'], rate: 60, slaHours: 24, isActive: true },
          { id: '2', name: 'Outside Dhaka', areas: ['Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur'], rate: 120, slaHours: 72, isActive: true },
        ]);
      }
      
      // Load commission tiers
      if (settingsMap.commission_tiers) {
        setCommissionTiers(settingsMap.commission_tiers as CommissionTier[]);
      } else {
        setCommissionTiers([
          { id: '1', name: 'Bronze', minSales: 0, maxSales: 50000, rate: 10 },
          { id: '2', name: 'Silver', minSales: 50001, maxSales: 200000, rate: 8 },
          { id: '3', name: 'Gold', minSales: 200001, maxSales: null, rate: 5 },
        ]);
      }
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

  // Shipping zone handlers
  const handleAddArea = () => {
    if (newAreaInput.trim()) {
      setNewZone(prev => ({
        ...prev,
        areas: [...(prev.areas || []), newAreaInput.trim()]
      }));
      setNewAreaInput('');
    }
  };

  const handleRemoveArea = (area: string) => {
    setNewZone(prev => ({
      ...prev,
      areas: (prev.areas || []).filter(a => a !== area)
    }));
  };

  const handleSaveZone = async () => {
    const zone: ShippingZone = {
      id: editingZone?.id || Date.now().toString(),
      name: newZone.name || '',
      areas: newZone.areas || [],
      rate: newZone.rate || 0,
      slaHours: newZone.slaHours || 24,
      isActive: newZone.isActive ?? true
    };

    const updatedZones = editingZone
      ? shippingZones.map(z => z.id === editingZone.id ? zone : z)
      : [...shippingZones, zone];

    setShippingZones(updatedZones);
    await saveSetting('shipping_zones', updatedZones, 'shipping', 'Shipping zone configuration');
    setZoneDialogOpen(false);
    setEditingZone(null);
    setNewZone({ name: '', areas: [], rate: 0, slaHours: 24, isActive: true });
  };

  const handleDeleteZone = async (id: string) => {
    const updatedZones = shippingZones.filter(z => z.id !== id);
    setShippingZones(updatedZones);
    await saveSetting('shipping_zones', updatedZones, 'shipping');
  };

  const handleEditZone = (zone: ShippingZone) => {
    setEditingZone(zone);
    setNewZone(zone);
    setZoneDialogOpen(true);
  };

  // Commission tier handlers
  const handleSaveTier = async () => {
    const tier: CommissionTier = {
      id: editingTier?.id || Date.now().toString(),
      name: newTier.name || '',
      minSales: newTier.minSales || 0,
      maxSales: newTier.maxSales || null,
      rate: newTier.rate || 10
    };

    const updatedTiers = editingTier
      ? commissionTiers.map(t => t.id === editingTier.id ? tier : t)
      : [...commissionTiers, tier];

    setCommissionTiers(updatedTiers);
    await saveSetting('commission_tiers', updatedTiers, 'commission', 'Commission tier configuration');
    setTierDialogOpen(false);
    setEditingTier(null);
    setNewTier({ name: '', minSales: 0, maxSales: null, rate: 10 });
  };

  const handleDeleteTier = async (id: string) => {
    const updatedTiers = commissionTiers.filter(t => t.id !== id);
    setCommissionTiers(updatedTiers);
    await saveSetting('commission_tiers', updatedTiers, 'commission');
  };

  const handleEditTier = (tier: CommissionTier) => {
    setEditingTier(tier);
    setNewTier(tier);
    setTierDialogOpen(true);
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
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
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
          <TabsTrigger value="zones" className="gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Zones</span>
          </TabsTrigger>
          <TabsTrigger value="commission" className="gap-2">
            <Percent className="h-4 w-4" />
            <span className="hidden sm:inline">Commission</span>
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

        {/* Shipping Zones */}
        <TabsContent value="zones" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Shipping Zones</CardTitle>
                <CardDescription>Configure delivery areas and rates</CardDescription>
              </div>
              <Button onClick={() => { setEditingZone(null); setNewZone({ name: '', areas: [], rate: 0, slaHours: 24, isActive: true }); setZoneDialogOpen(true); }} className="gap-2">
                <Plus className="h-4 w-4" /> Add Zone
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zone Name</TableHead>
                    <TableHead>Areas</TableHead>
                    <TableHead>Rate (৳)</TableHead>
                    <TableHead>SLA (hrs)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shippingZones.map((zone) => (
                    <TableRow key={zone.id}>
                      <TableCell className="font-medium">{zone.name}</TableCell>
                      <TableCell><div className="flex flex-wrap gap-1">{zone.areas.slice(0, 3).map(a => <Badge key={a} variant="secondary">{a}</Badge>)}{zone.areas.length > 3 && <Badge variant="outline">+{zone.areas.length - 3}</Badge>}</div></TableCell>
                      <TableCell>৳{zone.rate}</TableCell>
                      <TableCell>{zone.slaHours}h</TableCell>
                      <TableCell><Badge variant={zone.isActive ? "default" : "secondary"}>{zone.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEditZone(zone)}>Edit</Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteZone(zone.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commission Tiers */}
        <TabsContent value="commission" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Commission Tiers</CardTitle>
                <CardDescription>Configure seller commission rates based on sales volume</CardDescription>
              </div>
              <Button onClick={() => { setEditingTier(null); setNewTier({ name: '', minSales: 0, maxSales: null, rate: 10 }); setTierDialogOpen(true); }} className="gap-2">
                <Plus className="h-4 w-4" /> Add Tier
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tier Name</TableHead>
                    <TableHead>Min Sales (৳)</TableHead>
                    <TableHead>Max Sales (৳)</TableHead>
                    <TableHead>Commission Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissionTiers.map((tier) => (
                    <TableRow key={tier.id}>
                      <TableCell className="font-medium">{tier.name}</TableCell>
                      <TableCell>৳{tier.minSales.toLocaleString()}</TableCell>
                      <TableCell>{tier.maxSales ? `৳${tier.maxSales.toLocaleString()}` : 'Unlimited'}</TableCell>
                      <TableCell><Badge>{tier.rate}%</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEditTier(tier)}>Edit</Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteTier(tier.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

      {/* Zone Dialog */}
      <Dialog open={zoneDialogOpen} onOpenChange={setZoneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingZone ? 'Edit Zone' : 'Add Zone'}</DialogTitle>
            <DialogDescription>Configure shipping zone details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Zone Name</Label>
              <Input value={newZone.name || ''} onChange={(e) => setNewZone(prev => ({ ...prev, name: e.target.value }))} placeholder="Zone name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rate (৳)</Label>
                <Input type="number" value={newZone.rate || 0} onChange={(e) => setNewZone(prev => ({ ...prev, rate: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>SLA (hours)</Label>
                <Input type="number" value={newZone.slaHours || 24} onChange={(e) => setNewZone(prev => ({ ...prev, slaHours: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Areas</Label>
              <div className="flex gap-2">
                <Input value={newAreaInput} onChange={(e) => setNewAreaInput(e.target.value)} placeholder="Add area" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddArea())} />
                <Button type="button" onClick={handleAddArea}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {(newZone.areas || []).map(area => (
                  <Badge key={area} variant="secondary" className="gap-1">{area}<button onClick={() => handleRemoveArea(area)} className="ml-1 hover:text-destructive">×</button></Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={newZone.isActive ?? true} onCheckedChange={(checked) => setNewZone(prev => ({ ...prev, isActive: checked }))} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setZoneDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveZone}>Save Zone</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tier Dialog */}
      <Dialog open={tierDialogOpen} onOpenChange={setTierDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTier ? 'Edit Tier' : 'Add Tier'}</DialogTitle>
            <DialogDescription>Configure commission tier</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tier Name</Label>
              <Input value={newTier.name || ''} onChange={(e) => setNewTier(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Gold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Sales (৳)</Label>
                <Input type="number" value={newTier.minSales || 0} onChange={(e) => setNewTier(prev => ({ ...prev, minSales: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Max Sales (৳)</Label>
                <Input type="number" value={newTier.maxSales || ''} onChange={(e) => setNewTier(prev => ({ ...prev, maxSales: e.target.value ? Number(e.target.value) : null }))} placeholder="Leave empty for unlimited" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Commission Rate (%)</Label>
              <Input type="number" min="0" max="100" value={newTier.rate || 10} onChange={(e) => setNewTier(prev => ({ ...prev, rate: Number(e.target.value) }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTierDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTier}>Save Tier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
