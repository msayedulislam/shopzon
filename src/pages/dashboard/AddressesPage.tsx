import { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Check, Loader2, Home, Building } from 'lucide-react';
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

export default function AddressesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
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
    }
  }, [user]);

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
      setFormData({
        name: '',
        phone: '',
        address: '',
        city: 'Dhaka',
        area: '',
        postal_code: '',
        is_default: addresses.length === 0,
      });
    }
    setDialogOpen(true);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Addresses</h1>
            <p className="text-muted-foreground">
              Manage your delivery addresses
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => openDialog()}>
                <Plus className="h-4 w-4" />
                Add Address
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="01XXXXXXXXX"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="House/Building, Road, Block"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Area</Label>
                    <Input
                      id="area"
                      value={formData.area}
                      onChange={(e) =>
                        setFormData({ ...formData, area: e.target.value })
                      }
                      placeholder="e.g., Dhanmondi"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) =>
                        setFormData({ ...formData, postal_code: e.target.value })
                      }
                      placeholder="1205"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_default"
                    checked={formData.is_default}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_default: checked as boolean })
                    }
                  />
                  <Label htmlFor="is_default" className="text-sm cursor-pointer">
                    Set as default delivery address
                  </Label>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={formLoading}>
                    {formLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingAddress ? (
                      'Update Address'
                    ) : (
                      'Add Address'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Addresses */}
      {addresses.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-10 w-10 text-orange-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No addresses saved</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Add a delivery address to make checkout faster and easier.
          </p>
          <Button onClick={() => openDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-card rounded-2xl border-2 p-6 transition-all ${
                address.is_default 
                  ? 'border-primary shadow-lg shadow-primary/10' 
                  : 'border-border hover:border-primary/30'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    address.is_default 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-muted-foreground'
                  }`}>
                    {address.city === 'Dhaka' ? (
                      <Building className="h-5 w-5" />
                    ) : (
                      <Home className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{address.name}</p>
                    <p className="text-sm text-muted-foreground">{address.phone}</p>
                  </div>
                </div>
                {address.is_default && (
                  <Badge className="bg-primary/10 text-primary border-0">
                    Default
                  </Badge>
                )}
              </div>

              {/* Address Details */}
              <div className="text-sm space-y-1 mb-6">
                <p>{address.address}</p>
                <p className="text-muted-foreground">
                  {address.area}, {address.city}
                  {address.postal_code && ` - ${address.postal_code}`}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDialog(address)}
                  className="gap-1"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
                {!address.is_default && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAsDefault(address.id)}
                      className="gap-1"
                    >
                      <Check className="h-4 w-4" />
                      Set Default
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 ml-auto"
                      onClick={() => deleteAddress(address.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
