import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Tag, 
  Image, 
  Percent,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

const ACTION_TYPES = [
  { value: 'price_change', label: 'Price Change', icon: Tag },
  { value: 'banner_update', label: 'Banner Update', icon: Image },
  { value: 'flash_sale_start', label: 'Start Flash Sale', icon: Percent },
  { value: 'flash_sale_end', label: 'End Flash Sale', icon: Percent },
  { value: 'coupon_activate', label: 'Activate Coupon', icon: Tag },
  { value: 'coupon_deactivate', label: 'Deactivate Coupon', icon: Tag },
];

export default function AdminScheduledActions() {
  const [isOpen, setIsOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [targetType, setTargetType] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [payload, setPayload] = useState('');
  
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: actions = [], isLoading } = useQuery({
    queryKey: ['scheduled-actions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_actions')
        .select('*')
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const createAction = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('scheduled_actions')
        .insert({
          action_type: actionType,
          target_type: targetType,
          scheduled_for: scheduledFor,
          payload: payload ? JSON.parse(payload) : {},
          created_by: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-actions'] });
      toast.success('Action scheduled successfully');
      setIsOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const cancelAction = useMutation({
    mutationFn: async (actionId: string) => {
      const { error } = await supabase
        .from('scheduled_actions')
        .update({ status: 'cancelled' })
        .eq('id', actionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-actions'] });
      toast.success('Action cancelled');
    },
  });

  const deleteAction = useMutation({
    mutationFn: async (actionId: string) => {
      const { error } = await supabase
        .from('scheduled_actions')
        .delete()
        .eq('id', actionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-actions'] });
      toast.success('Action deleted');
    },
  });

  const resetForm = () => {
    setActionType('');
    setTargetType('');
    setScheduledFor('');
    setPayload('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'executed':
        return <Badge className="bg-green-500 gap-1"><CheckCircle className="h-3 w-3" /> Executed</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="gap-1"><XCircle className="h-3 w-3" /> Cancelled</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" /> Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const pendingActions = actions.filter(a => a.status === 'pending');
  const executedActions = actions.filter(a => a.status === 'executed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scheduled Actions</h1>
          <p className="text-muted-foreground">Automate price changes, sales, and promotions</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Schedule Action
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Action</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Action Type</Label>
                <Select value={actionType} onValueChange={setActionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Type</Label>
                <Select value={targetType} onValueChange={setTargetType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="coupon">Coupon</SelectItem>
                    <SelectItem value="global">Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Scheduled For</Label>
                <Input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Payload (JSON)</Label>
                <Textarea
                  placeholder='{"discount": 20, "reason": "Flash Sale"}'
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={() => createAction.mutate()} 
                className="w-full"
                disabled={!actionType || !targetType || !scheduledFor || createAction.isPending}
              >
                Schedule Action
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingActions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Executed</p>
                <p className="text-2xl font-bold">{executedActions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Actions</p>
                <p className="text-2xl font-bold">{actions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Scheduled Actions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : actions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No scheduled actions yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action Type</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Scheduled For</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actions.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell className="font-medium">
                      {ACTION_TYPES.find(t => t.value === action.action_type)?.label || action.action_type}
                    </TableCell>
                    <TableCell>{action.target_type}</TableCell>
                    <TableCell>
                      {format(new Date(action.scheduled_for), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{getStatusBadge(action.status)}</TableCell>
                    <TableCell>
                      {format(new Date(action.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {action.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelAction.mutate(action.id)}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteAction.mutate(action.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
