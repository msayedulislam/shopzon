import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Wallet, Search, Plus, History, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface UserWallet {
  id: string;
  user_id: string;
  balance: number;
  total_credited: number;
  total_spent: number;
  created_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  };
}

interface WalletTransaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  balance_after: number;
  created_at: string;
}

const AdminWallets = () => {
  const [wallets, setWallets] = useState<UserWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<UserWallet | null>(null);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditNotes, setCreditNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const { data: walletsData, error: walletsError } = await supabase
        .from("wallets")
        .select("*")
        .order("created_at", { ascending: false });

      if (walletsError) throw walletsError;

      // Fetch profiles for each wallet
      const userIds = walletsData?.map(w => w.user_id) || [];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, phone")
        .in("user_id", userIds);

      const walletsWithProfiles = walletsData?.map(wallet => ({
        ...wallet,
        profile: profilesData?.find(p => p.user_id === wallet.user_id)
      })) || [];

      setWallets(walletsWithProfiles);
    } catch (error) {
      console.error("Error fetching wallets:", error);
      toast.error("Failed to load wallets");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (walletId: string) => {
    setLoadingTransactions(true);
    try {
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("wallet_id", walletId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleCreditWallet = async () => {
    if (!selectedWallet || !creditAmount) return;

    const amount = parseFloat(creditAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setProcessing(true);
    try {
      // Get current user for audit log
      const { data: { user } } = await supabase.auth.getUser();
      
      // Credit the wallet using the database function
      const { data: success, error: creditError } = await supabase.rpc("credit_wallet", {
        p_user_id: selectedWallet.user_id,
        p_amount: amount,
        p_description: creditNotes || "Admin credit",
        p_reference_type: "admin_credit",
        p_reference_id: user?.id || null
      });

      if (creditError) throw creditError;

      if (!success) {
        throw new Error("Failed to credit wallet");
      }

      // Log the action in admin_audit_logs
      await supabase.from("admin_audit_logs").insert({
        admin_id: user?.id,
        action: "wallet_credit",
        entity_type: "wallet",
        entity_id: selectedWallet.id,
        details: {
          user_id: selectedWallet.user_id,
          amount: amount,
          notes: creditNotes,
          previous_balance: selectedWallet.balance,
          new_balance: selectedWallet.balance + amount
        }
      });

      toast.success(`Successfully credited ৳${amount.toFixed(2)} to wallet`);
      setCreditDialogOpen(false);
      setCreditAmount("");
      setCreditNotes("");
      setSelectedWallet(null);
      fetchWallets();
    } catch (error) {
      console.error("Error crediting wallet:", error);
      toast.error("Failed to credit wallet");
    } finally {
      setProcessing(false);
    }
  };

  const openCreditDialog = (wallet: UserWallet) => {
    setSelectedWallet(wallet);
    setCreditDialogOpen(true);
  };

  const openHistoryDialog = (wallet: UserWallet) => {
    setSelectedWallet(wallet);
    setHistoryDialogOpen(true);
    fetchTransactions(wallet.id);
  };

  const filteredWallets = wallets.filter(wallet => {
    const searchLower = searchQuery.toLowerCase();
    return (
      wallet.profile?.full_name?.toLowerCase().includes(searchLower) ||
      wallet.profile?.email?.toLowerCase().includes(searchLower) ||
      wallet.profile?.phone?.includes(searchQuery)
    );
  });

  const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
  const totalCredited = wallets.reduce((sum, w) => sum + Number(w.total_credited), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wallets</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wallets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{totalBalance.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credited</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{totalCredited.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Wallets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Total Credited</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWallets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No wallets found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWallets.map((wallet) => (
                    <TableRow key={wallet.id}>
                      <TableCell>
                        <div className="font-medium">
                          {wallet.profile?.full_name || "Unknown User"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{wallet.profile?.email}</div>
                          <div className="text-muted-foreground">{wallet.profile?.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={Number(wallet.balance) > 0 ? "default" : "secondary"}>
                          ৳{Number(wallet.balance).toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        +৳{Number(wallet.total_credited).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        -৳{Number(wallet.total_spent).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => openCreditDialog(wallet)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Credit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openHistoryDialog(wallet)}
                          >
                            <History className="h-4 w-4 mr-1" />
                            History
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Credit Dialog */}
      <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credit Wallet</DialogTitle>
            <DialogDescription>
              Add credit to {selectedWallet?.profile?.full_name || "customer"}'s wallet.
              Current balance: ৳{Number(selectedWallet?.balance || 0).toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (৳)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter amount"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (for audit log)</Label>
              <Textarea
                id="notes"
                placeholder="Reason for credit (e.g., Refund for order #123, Compensation, Promotion)"
                value={creditNotes}
                onChange={(e) => setCreditNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreditWallet} disabled={processing || !creditAmount}>
              {processing ? "Processing..." : "Credit Wallet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction History</DialogTitle>
            <DialogDescription>
              {selectedWallet?.profile?.full_name || "Customer"}'s wallet transactions
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {loadingTransactions ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm">
                        {format(new Date(tx.created_at), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={tx.type === "credit" ? "default" : "secondary"}>
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {tx.description || "-"}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${tx.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                        {tx.type === "credit" ? "+" : "-"}৳{Math.abs(Number(tx.amount)).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ৳{Number(tx.balance_after).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWallets;
