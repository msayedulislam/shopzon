import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Smartphone, Plus, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  type: 'bkash' | 'nagad' | 'card';
  label: string;
  lastFour: string;
  isDefault: boolean;
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'bkash' as 'bkash' | 'nagad' | 'card',
    number: '',
    label: ''
  });

  // Mock payment methods - In production, these would come from a database
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      // Simulating stored payment methods
      const mockMethods: PaymentMethod[] = [
        { id: '1', type: 'bkash', label: 'Personal bKash', lastFour: '4521', isDefault: true },
        { id: '2', type: 'nagad', label: 'Business Nagad', lastFour: '8832', isDefault: false },
      ];

      setTimeout(() => {
        setPaymentMethods(mockMethods);
        setLoading(false);
      }, 500);
    };

    fetchPaymentMethods();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'bkash':
      case 'nagad':
        return <Smartphone className="h-5 w-5" />;
      case 'card':
        return <CreditCard className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bkash':
        return 'bg-pink-500/10 text-pink-600 border-pink-200';
      case 'nagad':
        return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'card':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleAddMethod = () => {
    if (!formData.number || formData.number.length < 4) {
      toast.error('Please enter a valid number');
      return;
    }

    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: formData.type,
      label: formData.label || `My ${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}`,
      lastFour: formData.number.slice(-4),
      isDefault: paymentMethods.length === 0
    };

    setPaymentMethods([...paymentMethods, newMethod]);
    setFormData({ type: 'bkash', number: '', label: '' });
    setDialogOpen(false);
    toast.success('Payment method added successfully');
  };

  const handleDelete = (id: string) => {
    setPaymentMethods(paymentMethods.filter(m => m.id !== id));
    toast.success('Payment method removed');
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(paymentMethods.map(m => ({
      ...m,
      isDefault: m.id === id
    })));
    toast.success('Default payment method updated');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Economic Links</h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2 opacity-70">
              Manage your premium financial heritage protocols
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-14 px-8 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                <Plus className="h-5 w-5 mr-3" strokeWidth={3} />
                Deploy New Link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-border/5 p-10">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic">Register Economic Link</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-8">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Protocol Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'bkash' | 'nagad' | 'card') => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="h-12 bg-secondary/30 border-none rounded-2xl focus:ring-primary shadow-inner font-black uppercase tracking-widest text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/5 p-2">
                      <SelectItem value="bkash" className="text-[9px] font-black uppercase tracking-widest">bKash Network</SelectItem>
                      <SelectItem value="nagad" className="text-[9px] font-black uppercase tracking-widest">Nagad Platform</SelectItem>
                      <SelectItem value="card" className="text-[9px] font-black uppercase tracking-widest">Master/Visa Cipher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    {formData.type === 'card' ? 'Cipher Sequence' : 'Contact Protocol'}
                  </Label>
                  <Input
                    placeholder={formData.type === 'card' ? '•••• •••• •••• ••••' : '01XXXXXXXXX'}
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    maxLength={formData.type === 'card' ? 16 : 11}
                    className="h-12 bg-secondary/30 border-none rounded-2xl focus-visible:ring-primary shadow-inner font-bold tracking-widest text-[10px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Protocol Label</Label>
                  <Input
                    placeholder="E.G., PERSONAL REGISTRY"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="h-12 bg-secondary/30 border-none rounded-2xl focus-visible:ring-primary shadow-inner font-bold uppercase tracking-widest text-[10px]"
                  />
                </div>
                <Button
                  onClick={handleAddMethod}
                  className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 text-[10px]"
                >
                  Execute Integration
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {paymentMethods.length === 0 ? (
        <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 p-20 text-center shadow-sm">
          <div className="w-24 h-24 rounded-[2.5rem] bg-secondary/50 flex items-center justify-center mx-auto mb-8 border border-border/10">
            <CreditCard className="h-12 w-12 text-muted-foreground/30" strokeWidth={1} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter italic mb-4">No Economic Links</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-10 max-w-sm mx-auto leading-relaxed">
            Link your preferred financial protocols to enable rapid heritage deployment and priority logistics.
          </p>
          <Button onClick={() => setDialogOpen(true)} className="h-14 px-12 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            Begin Link Integration
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`bg-white dark:bg-card rounded-[2.5rem] border-2 p-8 transition-all group relative overflow-hidden ${method.isDefault
                ? 'border-primary shadow-2xl shadow-primary/10'
                : 'border-border/5 shadow-sm hover:border-primary/20'
                }`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />

              {/* Header Info */}
              <div className="flex items-start justify-between relative z-10 mb-8">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border border-current/10 ${method.type === 'bkash' ? 'bg-[#D12053] text-white' :
                    method.type === 'nagad' ? 'bg-[#F7941D] text-white' :
                      'bg-blue-600 text-white'
                    }`}>
                    {getIcon(method.type)}
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tighter italic group-hover:text-primary transition-colors">{method.label}</h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1 flex items-center gap-2">
                      Registry: <span className="text-black dark:text-white">•••• {method.lastFour}</span>
                    </p>
                  </div>
                </div>
                {method.isDefault && (
                  <Badge variant="outline" className="bg-primary hover:bg-primary rounded-full border-0 px-4 py-1.5 text-[8px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20">
                    Master
                  </Badge>
                )}
              </div>

              {/* Status Protocol */}
              <div className="bg-secondary/10 p-5 rounded-[2rem] border border-border/5 relative z-10 mb-8 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Network Type</p>
                  <p className="text-[10px] font-black uppercase tracking-tighter italic text-primary">
                    {method.type === 'bkash' ? 'bKash Operational' : method.type === 'nagad' ? 'Nagad Protocol' : 'Master Interface'}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-white dark:bg-card flex items-center justify-center shadow-sm">
                  <CheckCircle className="h-5 w-5 text-emerald-500" strokeWidth={2.5} />
                </div>
              </div>

              {/* Actions Protocol */}
              <div className="flex items-center gap-4 relative z-10 pt-6 border-t border-border/5">
                {!method.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(method.id)}
                    className="h-10 px-6 rounded-xl border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest flex-1 sm:flex-none hover:bg-primary hover:text-white shadow-sm"
                  >
                    Set Master
                  </Button>
                )}
                <button
                  onClick={() => handleDelete(method.id)}
                  className="w-10 h-10 rounded-xl bg-secondary hover:bg-primary/10 text-muted-foreground hover:text-primary flex items-center justify-center transition-all ml-auto hover:rotate-12"
                >
                  <Trash2 className="h-5 w-5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Logic Archive */}
      <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
        <h3 className="text-base font-black uppercase tracking-tighter italic mb-6 flex items-center gap-3">
          <Smartphone className="h-5 w-5" strokeWidth={3} />
          Protocol Intelligence
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-white dark:bg-card rounded-2xl border border-border/5 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
                <Smartphone className="h-4 w-4" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1">bKash/Nagad</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase leading-tight">Instant heritage funding via mobile cipher.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white dark:bg-card rounded-2xl border border-border/5 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <CreditCard className="h-4 w-4" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1">Cipher Cards</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase leading-tight">Secure master/visa link with tiered encryption.</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white dark:bg-card rounded-[2rem] border border-border/5 shadow-sm relative group">
            <p className="text-[9px] font-bold text-muted-foreground uppercase leading-relaxed mb-4">
              Economic information is fully encrypted within the Govaly Vault. Your telemetry is never archived beyond transactional necessity.
            </p>
            <Button variant="link" className="text-primary p-0 h-auto text-[9px] font-black uppercase tracking-widest hover:no-underline hover:translate-x-1 transition-transform">
              Read Security Whitepaper →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
