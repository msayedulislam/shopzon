import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, User, Phone, Mail, MapPin, FileText, Loader2, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const sellerSchema = z.object({
  shopName: z.string().min(3, 'Shop name must be at least 3 characters'),
  phone: z.string().regex(/^01[3-9]\d{8}$/, 'Invalid Bangladesh phone number'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  description: z.string().optional(),
});

export default function SellerRegisterPage() {
  const { user, refreshRoles } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    shopName: '',
    phone: '',
    email: user?.email || '',
    address: '',
    description: '',
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to register as a seller.',
        variant: 'destructive',
      });
      navigate('/auth?mode=login');
      return;
    }

    setErrors({});
    const result = sellerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      // Check if user is already a seller
      const { data: existingSeller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingSeller) {
        toast({
          title: 'Already Registered',
          description: 'You are already registered as a seller.',
          variant: 'destructive',
        });
        navigate('/seller/dashboard');
        return;
      }

      const slug = generateSlug(formData.shopName) + '-' + Date.now().toString(36);

      const { error } = await supabase.from('sellers').insert({
        user_id: user.id,
        shop_name: formData.shopName,
        slug,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        description: formData.description,
        status: 'pending',
      });

      if (error) throw error;

      // Add seller role - check if not already exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', 'seller')
        .maybeSingle();

      if (!existingRole) {
        const { error: roleError } = await supabase.from('user_roles').insert({
          user_id: user.id,
          role: 'seller',
        });
        
        if (roleError) {
          console.error('Error adding seller role:', roleError);
        }
      }

      // Small delay to ensure database commit, then refresh roles
      await new Promise(resolve => setTimeout(resolve, 500));
      await refreshRoles();

      toast({
        title: 'Application Submitted!',
        description: 'Your seller application is under review. We will notify you soon.',
      });
      navigate('/seller/dashboard');
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/30">
        <div className="container py-12">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Store className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Become a Seller</h1>
              <p className="text-muted-foreground">
                Start selling on Jhuri and reach millions of customers in Bangladesh
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="shopName">Shop Name *</Label>
                  <div className="relative mt-1">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="shopName"
                      placeholder="Enter your shop name"
                      value={formData.shopName}
                      onChange={(e) =>
                        setFormData({ ...formData, shopName: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                  {errors.shopName && (
                    <p className="text-destructive text-sm mt-1">{errors.shopName}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="01XXXXXXXXX"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="pl-10"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-destructive text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="shop@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="pl-10"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-destructive text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Business Address *</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Textarea
                      id="address"
                      placeholder="Enter your business address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="pl-10 min-h-[80px]"
                    />
                  </div>
                  {errors.address && (
                    <p className="text-destructive text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Shop Description</Label>
                  <div className="relative mt-1">
                    <FileText className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Textarea
                      id="description"
                      placeholder="Tell customers about your shop and products"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="pl-10 min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-xl p-4">
                  <h3 className="font-semibold mb-2">What happens next?</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your application will be reviewed within 24-48 hours</li>
                    <li>• You'll receive email notification upon approval</li>
                    <li>• Once approved, you can start listing products</li>
                    <li>• Commission rate starts at 10% per sale</li>
                  </ul>
                </div>

                <Button type="submit" className="w-full btn-hero" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Submit Application
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
