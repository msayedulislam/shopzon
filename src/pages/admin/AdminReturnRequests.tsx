import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Search,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

export default function AdminReturnRequests() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['return-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('return_requests')
        .select(`
          *,
          orders (
            order_number,
            total,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const updateRequest = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from('return_requests')
        .update({
          status,
          admin_notes: notes,
          processed_by: user?.id,
          processed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['return-requests'] });
      toast.success('Return request updated');
      setSelectedRequest(null);
    },
  });

  const handleApprove = (request: any) => {
    updateRequest.mutate({ 
      id: request.id, 
      status: 'approved',
      notes: adminNotes,
    });
  };

  const handleReject = (request: any) => {
    if (!adminNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    updateRequest.mutate({ 
      id: request.id, 
      status: 'rejected',
      notes: adminNotes,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500 gap-1"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500 gap-1"><CheckCircle className="h-3 w-3" /> Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.orders?.order_number?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const totalRefundAmount = requests
    .filter(r => r.status === 'approved' || r.status === 'completed')
    .reduce((sum, r) => sum + (r.refund_amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Return Requests</h1>
        <p className="text-muted-foreground">Manage customer return and refund requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <RotateCcw className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{requests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
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
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-full">
                <RotateCcw className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Refunded</p>
                <p className="text-2xl font-bold">৳{totalRefundAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>All Requests</CardTitle>
            <div className="flex gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : filteredRequests.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No return requests found
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.orders?.order_number || '-'}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {request.reason}
                    </TableCell>
                    <TableCell>৳{(request.refund_amount || 0).toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {format(new Date(request.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRequest(request);
                          setAdminNotes(request.admin_notes || '');
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Request Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Return Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order</p>
                  <p className="font-medium">{selectedRequest.orders?.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Refund Amount</p>
                  <p className="font-medium">৳{(selectedRequest.refund_amount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requested</p>
                  <p className="font-medium">
                    {format(new Date(selectedRequest.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Reason</p>
                <p className="bg-secondary p-3 rounded-lg">{selectedRequest.reason}</p>
              </div>

              {selectedRequest.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="bg-secondary p-3 rounded-lg">{selectedRequest.description}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-1">Admin Notes</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for this request..."
                  rows={3}
                />
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="flex gap-3">
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => handleApprove(selectedRequest)}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve & Refund
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 gap-2"
                    onClick={() => handleReject(selectedRequest)}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
