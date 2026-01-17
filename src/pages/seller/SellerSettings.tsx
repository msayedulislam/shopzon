import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Store, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Save,
  Camera,
  Building,
  Globe,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function SellerSettings() {
  const { seller, fetchSeller } = useOutletContext<{ seller: any; fetchSeller: () => void }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shop_name: '',
    phone: '',
    email: '',
    address: '',
    description: '',
  });

  useEffect(() => {
    if (seller) {
      setFormData({
        shop_name: seller.shop_name || '',
        phone: seller.phone || '',
        email: seller.email || '',
        address: seller.address || '',
        description: seller.description || '',
      });
    }
  }, [seller]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('sellers')
        .update({
          shop_name: formData.shop_name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          description: formData.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', seller.id);

      if (error) throw error;

      toast({ title: 'Settings Updated', description: 'Your shop settings have been saved.' });
      fetchSeller();
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

  const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
    pending: { color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Clock },
    active: { color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle },
    suspended: { color: 'text-red-700', bg: 'bg-red-100', icon: AlertCircle },
  };

  const levelConfig: Record<string, { color: string; bg: string }> = {
    bronze: { color: 'text-orange-700', bg: 'bg-orange-100' },
    silver: { color: 'text-gray-700', bg: 'bg-gray-200' },
    gold: { color: 'text-yellow-700', bg: 'bg-yellow-100' },
  };

  const StatusIcon = statusConfig[seller?.status]?.icon || Clock;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold">Shop Settings</h1>
      </div>

      {/* Shop Status Card */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                {seller?.logo_url ? (
                  <img src={seller.logo_url} alt="" className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  <Store className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">{seller?.shop_name}</h2>
                <p className="text-sm text-muted-foreground">@{seller?.slug}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={`${statusConfig[seller?.status]?.bg} ${statusConfig[seller?.status]?.color} border-0 gap-1`}>
                    <StatusIcon className="h-3 w-3" />
                    {seller?.status}
                  </Badge>
                  <Badge className={`${levelConfig[seller?.level]?.bg} ${levelConfig[seller?.level]?.color} border-0`}>
                    {seller?.level} seller
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Commission Rate</p>
              <p className="text-2xl font-bold text-primary">{seller?.commission_rate || 10}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shop Statistics */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{seller?.total_sales || 0}</p>
            <p className="text-sm text-muted-foreground">Total Sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{seller?.rating?.toFixed(1) || '0.0'}</p>
            <p className="text-sm text-muted-foreground">Shop Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">
              {seller?.created_at ? Math.floor((Date.now() - new Date(seller.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
            </p>
            <p className="text-sm text-muted-foreground">Days Active</p>
          </CardContent>
        </Card>
      </div>

      {/* Shop Information Form */}
      <Card>
        <CardHeader>
          <CardTitle>Shop Information</CardTitle>
          <CardDescription>Update your shop details and contact information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="shop_name">Shop Name</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="shop_name"
                    value={formData.shop_name}
                    onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Shop Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell customers about your shop and what makes it special..."
                className="min-h-[120px]"
              />
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="h-5 w-5" />
              Seller Level Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                <span className="text-orange-700 font-medium">Bronze</span>
                <span className="text-sm text-orange-600">10% commission</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-100 rounded-xl">
                <span className="text-gray-700 font-medium">Silver</span>
                <span className="text-sm text-gray-600">8% commission</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                <span className="text-yellow-700 font-medium">Gold</span>
                <span className="text-sm text-yellow-600">5% commission</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Quick Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2" asChild>
                <a href="/seller-policy" target="_blank">
                  <FileText className="h-4 w-4" />
                  Seller Policy
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" asChild>
                <a href="/help-center" target="_blank">
                  <Globe className="h-4 w-4" />
                  Help Center
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" asChild>
                <a href="/contact-us" target="_blank">
                  <Mail className="h-4 w-4" />
                  Contact Support
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}