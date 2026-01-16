import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  FileText, 
  Search, 
  Edit2, 
  Eye, 
  EyeOff, 
  Save, 
  X, 
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface StaticPage {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  meta_title: string | null;
  meta_description: string | null;
  hero_image: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export default function AdminPages() {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  async function fetchPages() {
    setLoading(true);
    const { data, error } = await supabase
      .from('static_pages')
      .select('*')
      .order('title');

    if (error) {
      console.error('Error fetching pages:', error);
      toast.error('Failed to load pages');
    } else {
      setPages(data || []);
    }
    setLoading(false);
  }

  async function togglePageStatus(page: StaticPage) {
    const { error } = await supabase
      .from('static_pages')
      .update({ is_active: !page.is_active })
      .eq('id', page.id);

    if (error) {
      toast.error('Failed to update page status');
    } else {
      toast.success(`Page ${!page.is_active ? 'activated' : 'deactivated'}`);
      fetchPages();
    }
  }

  async function savePage() {
    if (!editingPage) return;

    setSaving(true);
    const { error } = await supabase
      .from('static_pages')
      .update({
        title: editingPage.title,
        content: editingPage.content,
        meta_title: editingPage.meta_title,
        meta_description: editingPage.meta_description,
        hero_image: editingPage.hero_image,
      })
      .eq('id', editingPage.id);

    if (error) {
      toast.error('Failed to save page');
    } else {
      toast.success('Page saved successfully');
      setEditingPage(null);
      fetchPages();
    }
    setSaving(false);
  }

  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Pages</h1>
          <p className="text-muted-foreground">Edit static pages content and settings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{page.title}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {page.meta_description || 'No description'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">/{page.slug}</code>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={page.is_active ? "default" : "secondary"}
                      className={page.is_active ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : ""}
                    >
                      {page.is_active ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                      ) : (
                        <><AlertCircle className="h-3 w-3 mr-1" /> Inactive</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {page.updated_at ? new Date(page.updated_at).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => togglePageStatus(page)}
                        title={page.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {page.is_active ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingPage(page)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <a
                        href={`/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPage} onOpenChange={(open) => !open && setEditingPage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Edit Page: {editingPage?.title}
            </DialogTitle>
          </DialogHeader>
          
          {editingPage && (
            <div className="space-y-6 pt-4">
              {/* Basic Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Page Title</Label>
                  <Input
                    id="title"
                    value={editingPage.title}
                    onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug (read-only)</Label>
                  <Input
                    id="slug"
                    value={editingPage.slug}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              {/* SEO */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-foreground">SEO Settings</h3>
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={editingPage.meta_title || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, meta_title: e.target.value })}
                    placeholder="Enter meta title for search engines"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={editingPage.meta_description || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, meta_description: e.target.value })}
                    placeholder="Enter meta description for search engines"
                    rows={2}
                  />
                </div>
              </div>

              {/* Hero Image */}
              <div className="space-y-2">
                <Label htmlFor="hero_image">Hero Image URL</Label>
                <Input
                  id="hero_image"
                  value={editingPage.hero_image || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, hero_image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Page Content (Markdown)</Label>
                <Textarea
                  id="content"
                  value={editingPage.content || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                  placeholder="Enter page content in Markdown format"
                  rows={15}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Use Markdown syntax: # H1, ## H2, **bold**, - list items
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setEditingPage(null)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={savePage} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}