import { useState } from 'react';
import { RotateCcw, Upload, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const RETURN_REASONS = [
  'Product damaged during delivery',
  'Wrong item received',
  'Product not as described',
  'Quality not satisfactory',
  'Changed my mind',
  'Found better price elsewhere',
  'Other',
];

interface ReturnRequestFormProps {
  orderId: string;
  orderNumber: string;
  orderTotal: number;
}

export function ReturnRequestForm({ orderId, orderNumber, orderTotal }: ReturnRequestFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const submitReturn = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('return_requests')
        .insert({
          order_id: orderId,
          user_id: user.id,
          reason,
          description: description || null,
          refund_amount: orderTotal,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Return request submitted successfully');
    },
    onError: () => {
      toast.error('Failed to submit return request');
    },
  });

  const handleSubmit = () => {
    if (!reason) {
      toast.error('Please select a reason');
      return;
    }
    submitReturn.mutate();
  };

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Return Requested
          </Button>
        </DialogTrigger>
        <DialogContent>
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Return Request Submitted</h3>
            <p className="text-muted-foreground">
              We'll review your request and get back to you within 24-48 hours.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Request Return
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" />
            Return Request
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-secondary p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Order Number</p>
            <p className="font-medium">{orderNumber}</p>
          </div>

          <div className="space-y-2">
            <Label>Reason for Return *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {RETURN_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Additional Details (optional)</Label>
            <Textarea
              placeholder="Please provide more details about your return request..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-secondary/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Refund Amount</p>
            <p className="text-lg font-bold text-primary">
              ৳{orderTotal.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              Refund will be credited to your wallet after approval
            </p>
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={submitReturn.isPending}
          >
            {submitReturn.isPending ? 'Submitting...' : 'Submit Return Request'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
