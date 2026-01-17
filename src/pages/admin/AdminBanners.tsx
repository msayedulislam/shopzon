import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  position: string;
  sort_order: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    position: 'hero',
    sort_order: 0,
    is_active: true,
    start_date: '',
    end_date: ''
  });

  const fetchBanners = async () => {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('position')
      .order('sort_order');
    
    if (error) {
      toast.error('Failed to fetch banners');
    } else {
      setBanners(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSubmit = async () => {
    if (!formData.title || !formData.image_url) {
      toast.error('Please fill in required fields');
      return;
    }

    const bannerData = {
      title: formData.title,
      subtitle: formData.subtitle || null,
      image_url: formData.image_url,
      link_url: formData.link_url || null,
      position: formData.position,
      sort_order: formData.sort_order,
      is_active: formData.is_active,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null
    };

    if (editingBanner) {
      const { error } = await supabase
        .from('banners')
        .update(bannerData)
        .eq('id', editingBanner.id);
      
      if (error) {
        toast.error('Failed to update banner');
      } else {
        toast.success('Banner updated');
        fetchBanners();
      }
    } else {
      const { error } = await supabase
        .from('banners')
        .insert(bannerData);
      
      if (error) {
        toast.error('Failed to create banner');
      } else {
        toast.success('Banner created');
        fetchBanners();
      }
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      position: banner.position,
      sort_order: banner.sort_order,
      is_active: banner.is_active,
      start_date: banner.start_date ? banner.start_date.split('T')[0] : '',
      end_date: banner.end_date ? banner.end_date.split('T')[0] : ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete banner');
    } else {
      toast.success('Banner deleted');
      fetchBanners();
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('banners')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to update banner');
    } else {
      fetchBanners();
    }
  };

  const resetForm = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      link_url: '',
      position: 'hero',
      sort_order: 0,
      is_active: true,
      start_date: '',
      end_date: ''
    });
  };

  const getStatusBadge = (banner: Banner) => {
    const now = new Date();
    const startDate = banner.start_date ? new Date(banner.start_date) : null;
    const endDate = banner.end_date ? new Date(banner.end_date) : null;

    if (!banner.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (startDate && startDate > now) {
      return <Badge variant="outline" className="text-amber-600 border-amber-600">Scheduled</Badge>;
    }
    if (endDate && endDate < now) {
      return <Badge variant="outline" className="text-rose-600 border-rose-600">Expired</Badge>;
    }
    return <Badge className="bg-green-600">Active</Badge>;
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Banner Management</h1>
          <p className="text-muted-foreground">Create and manage promotional banners for the homepage</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingBanner ? 'Edit Banner' : 'Create Banner'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Banner title"
                />
              </div>
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Optional subtitle"
                />
              </div>
              <div>
                <Label htmlFor="image_url">Image URL *</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="link_url">Link URL</Label>
                <Input
                  id="link_url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="/products or https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Select value={formData.position} onValueChange={(v) => setFormData({ ...formData, position: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hero">Hero</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="footer">Footer</SelectItem>
                      <SelectItem value="popup">Popup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>{editingBanner ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Banners Grid */}
      <div className="grid gap-4">
        {banners.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No banners yet</h3>
            <p className="text-muted-foreground text-sm">Create your first promotional banner</p>
          </div>
        ) : (
          banners.map((banner) => (
            <div key={banner.id} className="flex gap-4 p-4 bg-card rounded-xl border border-border">
              <div className="w-40 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{banner.title}</h3>
                    {banner.subtitle && <p className="text-sm text-muted-foreground">{banner.subtitle}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(banner)}
                    <Badge variant="outline">{banner.position}</Badge>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {banner.link_url && (
                    <span className="flex items-center gap-1">
                      <LinkIcon className="h-3 w-3" />
                      {banner.link_url}
                    </span>
                  )}
                  {(banner.start_date || banner.end_date) && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {banner.start_date && format(new Date(banner.start_date), 'MMM d')}
                      {banner.start_date && banner.end_date && ' - '}
                      {banner.end_date && format(new Date(banner.end_date), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleActive(banner.id, banner.is_active)}
                  title={banner.is_active ? 'Deactivate' : 'Activate'}
                >
                  {banner.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
