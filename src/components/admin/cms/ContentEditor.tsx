import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save, Trash2, Loader2, GripVertical, Edit2 } from 'lucide-react';
import { usePageContent } from '@/hooks/useSiteSettings';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface ContentEditorProps {
  onUpdate: () => void;
}

interface ContentSection {
  id: string;
  page_slug: string;
  section_id: string;
  content: Record<string, unknown>;
  sort_order: number;
  is_active: boolean;
}

const sectionTypes = [
  { value: 'hero', label: 'Hero Banner' },
  { value: 'features', label: 'Features Grid' },
  { value: 'promo', label: 'Promo Banner' },
  { value: 'text', label: 'Text Block' },
  { value: 'cta', label: 'Call to Action' },
  { value: 'gallery', label: 'Image Gallery' },
];

const pageOptions = [
  { value: 'home', label: 'Homepage' },
  { value: 'about', label: 'About Us' },
  { value: 'contact', label: 'Contact' },
  { value: 'help', label: 'Help Center' },
];

export function ContentEditor({ onUpdate }: ContentEditorProps) {
  const [selectedPage, setSelectedPage] = useState('home');
  const { pageContent, isLoading, updateContent, deleteContent, isUpdating } = usePageContent(selectedPage);
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    type: 'hero',
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    backgroundImage: '',
    content: '',
  });

  useEffect(() => {
    if (editingSection) {
      const content = editingSection.content as Record<string, string>;
      setFormData({
        type: content.type || 'hero',
        title: content.title || '',
        subtitle: content.subtitle || '',
        buttonText: content.buttonText || '',
        buttonLink: content.buttonLink || '',
        backgroundImage: content.backgroundImage || '',
        content: content.content || '',
      });
    } else {
      setFormData({
        type: 'hero',
        title: '',
        subtitle: '',
        buttonText: '',
        buttonLink: '',
        backgroundImage: '',
        content: '',
      });
    }
  }, [editingSection]);

  const handleSave = () => {
    const sectionId = editingSection?.section_id || `section_${Date.now()}`;
    updateContent({
      pageSlug: selectedPage,
      sectionId,
      content: formData,
    });
    setIsDialogOpen(false);
    setEditingSection(null);
    onUpdate();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this section?')) {
      deleteContent(id);
      onUpdate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Select Page</CardTitle>
          <CardDescription>Choose which page to edit</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedPage} onValueChange={setSelectedPage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageOptions.map((page) => (
                <SelectItem key={page.value} value={page.value}>
                  {page.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Content Sections */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Content Sections</CardTitle>
              <CardDescription>Manage page sections</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => setEditingSection(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingSection ? 'Edit Section' : 'Add New Section'}</DialogTitle>
                  <DialogDescription>
                    Configure the content for this section
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                  <div className="space-y-4 p-1">
                    <div className="space-y-2">
                      <Label>Section Type</Label>
                      <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sectionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Section title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Subtitle</Label>
                      <Input
                        value={formData.subtitle}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        placeholder="Section subtitle"
                      />
                    </div>

                    {formData.type === 'text' && (
                      <div className="space-y-2">
                        <Label>Content</Label>
                        <Textarea
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          placeholder="Enter your content here..."
                          rows={6}
                        />
                      </div>
                    )}

                    {['hero', 'promo', 'cta'].includes(formData.type) && (
                      <>
                        <div className="space-y-2">
                          <Label>Button Text</Label>
                          <Input
                            value={formData.buttonText}
                            onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                            placeholder="Shop Now"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Button Link</Label>
                          <Input
                            value={formData.buttonLink}
                            onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                            placeholder="/products"
                          />
                        </div>
                      </>
                    )}

                    {['hero', 'promo', 'gallery'].includes(formData.type) && (
                      <div className="space-y-2">
                        <Label>Background Image URL</Label>
                        <Input
                          value={formData.backgroundImage}
                          onChange={(e) => setFormData({ ...formData, backgroundImage: e.target.value })}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isUpdating}>
                    {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pageContent && pageContent.length > 0 ? (
              pageContent.map((section) => {
                const content = section.content as Record<string, string>;
                return (
                  <div
                    key={section.id}
                    className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-secondary/30 transition-colors"
                  >
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{content.title || section.section_id}</h4>
                        <Badge variant="secondary" className="capitalize">
                          {content.type || 'unknown'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {content.subtitle || 'No description'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingSection(section as ContentSection);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(section.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No content sections yet</p>
                <p className="text-sm">Click "Add Section" to create your first section</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
