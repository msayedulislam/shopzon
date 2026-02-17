import { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Check, Loader2, Home, Building, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLocationDetect } from '@/hooks/useLocationDetect';

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  area: string;
  postal_code: string;
  is_default: boolean;
}

interface Profile {
  full_name: string | null;
  phone: string | null;
}

export default function AddressesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { detecting, detectLocation } = useLocationDetect();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Dhaka',
    area: '',
    postal_code: '',
    is_default: false,
  });

  useEffect(() => {
    if (user) {
      fetchAddresses();
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('user_id', user.id)
      .maybeSingle();
    setProfile(data);
  };

  const fetchAddresses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        name: address.name,
        phone: address.phone,
        address: address.address,
        city: address.city,
        area: address.area,
        postal_code: address.postal_code || '',
        is_default: address.is_default,
      });
    } else {
      setEditingAddress(null);
      // Auto-fill name and phone from profile when adding new address
      setFormData({
        name: profile?.full_name || '',
        phone: profile?.phone || '',
        address: '',
        city: 'Dhaka',
        area: '',
        postal_code: '',
        is_default: addresses.length === 0,
      });
    }
    setDialogOpen(true);
  };

  const handleDetectLocation = async () => {
    const location = await detectLocation();
    if (location) {
      setFormData(prev => ({
        ...prev,
        address: location.address,
        city: location.city,
        area: location.area,
        postal_code: location.postalCode,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setFormLoading(true);

    try {
      if (formData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      if (editingAddress) {
        const { error } = await supabase
          .from('addresses')
          .update(formData)
          .eq('id', editingAddress.id);

        if (error) throw error;
        toast({ title: 'Address Updated' });
      } else {
        const { error } = await supabase.from('addresses').insert({
          ...formData,
          user_id: user.id,
        });

        if (error) throw error;
        toast({ title: 'Address Added' });
      }

      setDialogOpen(false);
      fetchAddresses();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', id);
      if (error) throw error;
      setAddresses(addresses.filter((a) => a.id !== id));
      toast({ title: 'Address Deleted' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const setAsDefault = async (id: string) => {
    if (!user) return;

    try {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id);

      fetchAddresses();
      toast({ title: 'Default Address Updated' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header - Premium Govaly Design */}
      <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 p-8 shadow-xl shadow-primary/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 italic">Dashboard</p>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">My Delivery Hub</h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2 opacity-70">
              Manage your premium shipping destinations
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="h-14 px-8 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                onClick={() => openDialog()}
              >
                <Plus className="h-5 w-5 mr-3" strokeWidth={3} />
                Add New Heritage
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] border-border/5 p-10">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic">
                  {editingAddress ? 'Modify Heritage' : 'Register New Heritage'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Guardian Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="ENTER FULL NAME"
                      className="h-12 bg-secondary/30 border-none rounded-2xl focus-visible:ring-primary shadow-inner font-bold uppercase tracking-widest text-[10px]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Contact Protocol</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+880 XXXXXX"
                      className="h-12 bg-secondary/30 border-none rounded-2xl focus-visible:ring-primary shadow-inner font-bold uppercase tracking-widest text-[10px]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="address" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Detailed Coordinates</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleDetectLocation}
                      disabled={detecting}
                      className="gap-2 h-6 text-primary hover:bg-primary/5 text-[8px] font-black uppercase tracking-[0.2em]"
                    >
                      {detecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Navigation className="h-3 w-3" />}
                      Sync Real-time
                    </Button>
                  </div>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="HOUSE, ROAD, BLOCK, LANDMARK..."
                    className="h-12 bg-secondary/30 border-none rounded-2xl focus-visible:ring-primary shadow-inner font-bold uppercase tracking-widest text-[10px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Estate</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="h-12 bg-secondary/30 border-none rounded-2xl focus-visible:ring-primary shadow-inner font-bold uppercase tracking-widest text-[10px]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Sector</Label>
                    <Input
                      id="area"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      placeholder="AREA"
                      className="h-12 bg-secondary/30 border-none rounded-2xl focus-visible:ring-primary shadow-inner font-bold uppercase tracking-widest text-[10px]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Code</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      placeholder="POSTAL"
                      className="h-12 bg-secondary/30 border-none rounded-2xl focus-visible:ring-primary shadow-inner font-bold uppercase tracking-widest text-[10px]"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-secondary/10 p-4 rounded-3xl border border-border/5">
                  <Checkbox
                    id="is_default"
                    checked={formData.is_default}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked as boolean })}
                    className="border-primary data-[state=checked]:bg-primary rounded-lg h-5 w-5"
                  />
                  <Label htmlFor="is_default" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer">
                    Establish as Primary Delivery Site
                  </Label>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="h-12 px-8 rounded-2xl border-border/5 font-black uppercase tracking-widest text-[9px]"
                  >
                    Abort
                  </Button>
                  <Button
                    type="submit"
                    disabled={formLoading}
                    className="h-12 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 text-[9px]"
                  >
                    {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingAddress ? 'Confirm Protocol' : 'Deploy Heritage'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Addresses Grid - High Density Layout */}
      {addresses.length === 0 ? (
        <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 p-20 text-center shadow-sm">
          <div className="w-24 h-24 rounded-[2.5rem] bg-secondary/50 flex items-center justify-center mx-auto mb-8 border border-border/10">
            <MapPin className="h-12 w-12 text-muted-foreground/30" strokeWidth={1} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter italic mb-4">No Registered Sites</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-10 max-w-sm mx-auto leading-relaxed">
            Register your delivery coordinates to enable rapid heritage deployment and priority logistics.
          </p>
          <Button onClick={() => openDialog()} className="h-14 px-12 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            Begin Site Integration
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white dark:bg-card rounded-[2.5rem] border-2 p-8 transition-all group relative overflow-hidden ${address.is_default
                ? 'border-primary shadow-2xl shadow-primary/10'
                : 'border-border/5 shadow-sm hover:border-primary/20'
                }`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />

              {/* Header Info */}
              <div className="flex items-start justify-between relative z-10 mb-8">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border border-current/10 ${address.is_default
                    ? 'bg-primary text-white'
                    : 'bg-secondary text-muted-foreground'
                    }`}>
                    {address.city === 'Dhaka' ? (
                      <Building className="h-7 w-7" strokeWidth={2.5} />
                    ) : (
                      <Home className="h-7 w-7" strokeWidth={2.5} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tighter italic group-hover:text-primary transition-colors">{address.name}</h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1 flex items-center gap-2">
                      Protocol: <span className="text-black dark:text-white">{address.phone}</span>
                    </p>
                  </div>
                </div>
                {address.is_default && (
                  <Badge variant="outline" className="bg-primary hover:bg-primary rounded-full border-0 px-4 py-1.5 text-[8px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20">
                    Primary
                  </Badge>
                )}
              </div>

              {/* Coordinates */}
              <div className="bg-secondary/10 p-6 rounded-[2rem] border border-border/5 relative z-10 mb-8">
                <p className="text-[10px] font-bold text-muted-foreground leading-relaxed uppercase tracking-tight">
                  {address.address}
                </p>
                <div className="flex items-center gap-3 mt-3 text-[10px] font-black uppercase tracking-widest text-primary">
                  <Navigation className="h-3.5 w-3.5" />
                  {address.area}, {address.city} {address.postal_code ? `• ${address.postal_code}` : ''}
                </div>
              </div>

              {/* Actions Protocol */}
              <div className="flex items-center gap-4 relative z-10 pt-6 border-t border-border/5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDialog(address)}
                  className="h-10 px-5 rounded-xl border-border/5 text-[9px] font-black uppercase tracking-widest flex-1 sm:flex-none hover:bg-secondary"
                >
                  <Edit2 className="h-3.5 w-3.5 mr-2" strokeWidth={3} />
                  Reconfigure
                </Button>
                {!address.is_default && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAsDefault(address.id)}
                      className="h-10 px-5 rounded-xl border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest flex-1 sm:flex-none hover:bg-primary hover:text-white"
                    >
                      <Check className="h-3.5 w-3.5 mr-2" strokeWidth={3} />
                      Set Primary
                    </Button>
                    <button
                      onClick={() => deleteAddress(address.id)}
                      className="w-10 h-10 rounded-xl bg-secondary hover:bg-primary/10 text-muted-foreground hover:text-primary flex items-center justify-center transition-all ml-auto hover:rotate-12"
                    >
                      <Trash2 className="h-5 w-5" strokeWidth={2.5} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
