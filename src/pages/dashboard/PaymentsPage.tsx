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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground">Manage your saved payment methods</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Method
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Payment Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: 'bkash' | 'nagad' | 'card') => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{formData.type === 'card' ? 'Card Number' : 'Mobile Number'}</Label>
                <Input
                  placeholder={formData.type === 'card' ? '•••• •••• •••• ••••' : '01XXXXXXXXX'}
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  maxLength={formData.type === 'card' ? 16 : 11}
                />
              </div>
              <div className="space-y-2">
                <Label>Label (Optional)</Label>
                <Input
                  placeholder="e.g., Personal, Business"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                />
              </div>
              <Button onClick={handleAddMethod} className="w-full">
                Add Payment Method
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {paymentMethods.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No payment methods</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add a payment method for faster checkout
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {paymentMethods.map((method) => (
            <Card key={method.id} className={method.isDefault ? 'ring-2 ring-primary' : ''}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${getTypeColor(method.type)}`}>
                    {getIcon(method.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{method.label}</span>
                      <Badge variant="outline" className={getTypeColor(method.type)}>
                        {method.type.charAt(0).toUpperCase() + method.type.slice(1)}
                      </Badge>
                      {method.isDefault && (
                        <Badge variant="default" className="bg-primary">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      •••• {method.lastFour}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(method.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Payment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About Payment Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>• <strong>bKash/Nagad:</strong> Link your mobile wallet for quick payments</p>
          <p>• <strong>Card:</strong> Add debit or credit cards for online payments</p>
          <p>• Your payment information is securely encrypted</p>
          <p>• You can also pay with Cash on Delivery (COD) at checkout</p>
        </CardContent>
      </Card>
    </div>
  );
}
