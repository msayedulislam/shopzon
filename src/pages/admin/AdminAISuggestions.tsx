import { useState, useEffect } from 'react';
import { Sparkles, Check, X, Loader2, Brain, TrendingUp, Package, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

type Suggestion = {
  id: string;
  type: string;
  suggestion: any;
  confidence: number | null;
  status: string | null;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string | null;
};

export default function AdminAISuggestions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = async (id: string, action: 'approved' | 'rejected', reason?: string) => {
    setActionLoading(id);
    try {
      const updates: any = {
        status: action,
        ...(action === 'approved' ? { approved_at: new Date().toISOString(), approved_by: user?.id } : {}),
        ...(action === 'rejected' && reason ? { rejected_reason: reason } : {}),
      };

      const { error } = await supabase
        .from('ai_suggestions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({ title: `Suggestion ${action}` });
      fetchSuggestions();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pricing': return <TrendingUp className="h-5 w-5" />;
      case 'inventory': return <Package className="h-5 w-5" />;
      case 'customer': return <Users className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pricing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'inventory': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'customer': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-primary/10 text-primary';
    }
  };

  const getConfidenceColor = (confidence: number | null) => {
    if (!confidence) return 'text-muted-foreground';
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
  const approvedSuggestions = suggestions.filter(s => s.status === 'approved');
  const rejectedSuggestions = suggestions.filter(s => s.status === 'rejected');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Suggestions
          </h1>
          <p className="text-muted-foreground">AI-powered recommendations for your business</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-3xl font-bold">{pendingSuggestions.length}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                <Brain className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-3xl font-bold">{approvedSuggestions.length}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <Check className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-3xl font-bold">{rejectedSuggestions.length}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <X className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingSuggestions.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedSuggestions.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedSuggestions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingSuggestions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending suggestions</p>
              </CardContent>
            </Card>
          ) : (
            pendingSuggestions.map(suggestion => (
              <Card key={suggestion.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(suggestion.type)}`}>
                        {getTypeIcon(suggestion.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg capitalize">{suggestion.type} Suggestion</CardTitle>
                        <CardDescription>
                          {suggestion.entity_type && `For ${suggestion.entity_type}`}
                          {suggestion.created_at && ` • ${new Date(suggestion.created_at).toLocaleDateString()}`}
                        </CardDescription>
                      </div>
                    </div>
                    {suggestion.confidence && (
                      <Badge variant="outline" className={getConfidenceColor(suggestion.confidence)}>
                        {Math.round(suggestion.confidence * 100)}% confidence
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-secondary/50 rounded-lg p-4 mb-4">
                    <pre className="text-sm whitespace-pre-wrap">
                      {typeof suggestion.suggestion === 'object' 
                        ? JSON.stringify(suggestion.suggestion, null, 2) 
                        : String(suggestion.suggestion)}
                    </pre>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSuggestion(suggestion.id, 'approved')}
                      disabled={actionLoading === suggestion.id}
                      className="gap-2"
                    >
                      {actionLoading === suggestion.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSuggestion(suggestion.id, 'rejected', 'Not applicable')}
                      disabled={actionLoading === suggestion.id}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedSuggestions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Check className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No approved suggestions yet</p>
              </CardContent>
            </Card>
          ) : (
            approvedSuggestions.map(suggestion => (
              <Card key={suggestion.id} className="border-green-200 dark:border-green-900">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(suggestion.type)}`}>
                      {getTypeIcon(suggestion.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg capitalize">{suggestion.type} Suggestion</CardTitle>
                      <CardDescription>
                        Approved {suggestion.created_at && new Date(suggestion.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <pre className="text-sm whitespace-pre-wrap">
                      {typeof suggestion.suggestion === 'object' 
                        ? JSON.stringify(suggestion.suggestion, null, 2) 
                        : String(suggestion.suggestion)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedSuggestions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <X className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No rejected suggestions</p>
              </CardContent>
            </Card>
          ) : (
            rejectedSuggestions.map(suggestion => (
              <Card key={suggestion.id} className="border-red-200 dark:border-red-900 opacity-75">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted`}>
                      {getTypeIcon(suggestion.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg capitalize">{suggestion.type} Suggestion</CardTitle>
                      <CardDescription>
                        Rejected {suggestion.created_at && new Date(suggestion.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg p-4">
                    <pre className="text-sm whitespace-pre-wrap text-muted-foreground">
                      {typeof suggestion.suggestion === 'object' 
                        ? JSON.stringify(suggestion.suggestion, null, 2) 
                        : String(suggestion.suggestion)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
