import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Save, Trash2, Loader2, GripVertical, Edit2, Eye, EyeOff, Copy, ChevronUp, ChevronDown, Home, FileText, Layout, Image, Type, Megaphone, Sparkles, ShoppingBag, Zap } from 'lucide-react';
import { usePageContent } from '@/hooks/useSiteSettings';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  { value: 'hero', label: 'Hero Banner', icon: Megaphone, description: 'Large banner with heading and CTA' },
  { value: 'features', label: 'Features Grid', icon: Layout, description: 'Grid of feature cards' },
  { value: 'promo', label: 'Promo Banner', icon: Sparkles, description: 'Promotional banner section' },
  { value: 'text', label: 'Text Block', icon: Type, description: 'Rich text content block' },
  { value: 'cta', label: 'Call to Action', icon: Zap, description: 'Action-focused section' },
  { value: 'gallery', label: 'Image Gallery', icon: Image, description: 'Multiple image showcase' },
  { value: 'products', label: 'Product Showcase', icon: ShoppingBag, description: 'Featured products section' },
  { value: 'testimonials', label: 'Testimonials', icon: FileText, description: 'Customer reviews carousel' },
  { value: 'newsletter', label: 'Newsletter', icon: Megaphone, description: 'Email signup section' },
  { value: 'categories', label: 'Categories Grid', icon: Layout, description: 'Category navigation grid' },
  { value: 'banner-carousel', label: 'Banner Carousel', icon: Image, description: 'Multiple rotating banners' },
  { value: 'flash-sale', label: 'Flash Sale', icon: Zap, description: 'Time-limited offers section' },
];

const pageOptions = [
  { value: 'home', label: 'Homepage', icon: Home },
  { value: 'about', label: 'About Us', icon: FileText },
  { value: 'contact', label: 'Contact', icon: FileText },
  { value: 'help', label: 'Help Center', icon: FileText },
  { value: 'shipping', label: 'Shipping Info', icon: FileText },
  { value: 'payment', label: 'Payment Methods', icon: FileText },
  { value: 'careers', label: 'Careers', icon: FileText },
  { value: 'privacy', label: 'Privacy Policy', icon: FileText },
  { value: 'terms', label: 'Terms & Conditions', icon: FileText },
];

const homepageSections = [
  { id: 'hero', label: 'Hero Banner', required: true },
  { id: 'categories', label: 'Categories', required: false },
  { id: 'flash-sale', label: 'Flash Sale', required: false },
  { id: 'featured-products', label: 'Featured Products', required: false },
  { id: 'promo-banners', label: 'Promo Banners', required: false },
  { id: 'best-selling', label: 'Best Selling', required: false },
  { id: 'new-arrivals', label: 'New Arrivals', required: false },
  { id: 'testimonials', label: 'Testimonials', required: false },
  { id: 'newsletter', label: 'Newsletter', required: false },
  { id: 'brand-logos', label: 'Brand Logos', required: false },
];

export function ContentEditor({ onUpdate }: ContentEditorProps) {
  const [selectedPage, setSelectedPage] = useState('home');
  const [activeTab, setActiveTab] = useState('sections');
  const { pageContent, isLoading, updateContent, deleteContent, isUpdating } = usePageContent(selectedPage);
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    type: 'hero',
    title: '',
    subtitle: '',
    description: '',
    buttonText: '',
    buttonLink: '',
    secondaryButtonText: '',
    secondaryButtonLink: '',
    backgroundImage: '',
    backgroundOverlay: 'rgba(0,0,0,0.5)',
    alignment: 'center',
    content: '',
    items: [] as { title: string; description: string; icon?: string; image?: string }[],
    images: [] as string[],
    autoPlay: true,
    interval: 5000,
  });

  useEffect(() => {
    if (editingSection) {
      const content = editingSection.content as Record<string, any>;
      setFormData({
        type: content.type || 'hero',
        title: content.title || '',
        subtitle: content.subtitle || '',
        description: content.description || '',
        buttonText: content.buttonText || '',
        buttonLink: content.buttonLink || '',
        secondaryButtonText: content.secondaryButtonText || '',
        secondaryButtonLink: content.secondaryButtonLink || '',
        backgroundImage: content.backgroundImage || '',
        backgroundOverlay: content.backgroundOverlay || 'rgba(0,0,0,0.5)',
        alignment: content.alignment || 'center',
        content: content.content || '',
        items: content.items || [],
        images: content.images || [],
        autoPlay: content.autoPlay ?? true,
        interval: content.interval || 5000,
      });
    } else {
      setFormData({
        type: 'hero',
        title: '',
        subtitle: '',
        description: '',
        buttonText: '',
        buttonLink: '',
        secondaryButtonText: '',
        secondaryButtonLink: '',
        backgroundImage: '',
        backgroundOverlay: 'rgba(0,0,0,0.5)',
        alignment: 'center',
        content: '',
        items: [],
        images: [],
        autoPlay: true,
        interval: 5000,
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
    toast.success('Section saved successfully!');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this section?')) {
      deleteContent(id);
      onUpdate();
      toast.success('Section deleted');
    }
  };

  const handleDuplicate = (section: ContentSection) => {
    const newSectionId = `section_${Date.now()}`;
    const content = section.content as Record<string, unknown>;
    updateContent({
      pageSlug: selectedPage,
      sectionId: newSectionId,
      content: { ...content, title: `${content.title || 'Section'} (Copy)` },
    });
    onUpdate();
    toast.success('Section duplicated');
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { title: '', description: '', icon: '', image: '' }],
    });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const addImage = () => {
    setFormData({
      ...formData,
      images: [...formData.images, ''],
    });
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const getSectionIcon = (type: string) => {
    const section = sectionTypes.find(s => s.value === type);
    return section?.icon || FileText;
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
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            {pageOptions.map((page) => (
              <Button
                key={page.value}
                variant={selectedPage === page.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPage(page.value)}
                className="gap-2"
              >
                <page.icon className="h-4 w-4" />
                {page.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sections" className="gap-2">
            <Layout className="h-4 w-4" />
            Page Sections
          </TabsTrigger>
          <TabsTrigger value="homepage" className="gap-2" disabled={selectedPage !== 'home'}>
            <Home className="h-4 w-4" />
            Homepage Manager
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="mt-6">
          {/* Content Sections */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Layout className="h-5 w-5 text-primary" />
                    Content Sections
                  </CardTitle>
                  <CardDescription>
                    {selectedPage === 'home' ? 'Manage homepage sections' : `Manage ${pageOptions.find(p => p.value === selectedPage)?.label || selectedPage} page content`}
                  </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setEditingSection(null)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Section
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle>{editingSection ? 'Edit Section' : 'Add New Section'}</DialogTitle>
                      <DialogDescription>
                        Configure the content for this section
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[65vh] pr-4">
                      <div className="space-y-6 py-4">
                        {/* Section Type Selector */}
                        <div className="space-y-3">
                          <Label className="text-base font-semibold">Section Type</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {sectionTypes.map((type) => (
                              <button
                                key={type.value}
                                onClick={() => setFormData({ ...formData, type: type.value })}
                                className={cn(
                                  "flex items-start gap-3 p-3 rounded-xl border text-left transition-all",
                                  formData.type === type.value 
                                    ? "border-primary bg-primary/5 ring-1 ring-primary" 
                                    : "hover:border-primary/50 hover:bg-secondary/50"
                                )}
                              >
                                <type.icon className={cn(
                                  "h-5 w-5 mt-0.5",
                                  formData.type === type.value ? "text-primary" : "text-muted-foreground"
                                )} />
                                <div>
                                  <p className="font-medium text-sm">{type.label}</p>
                                  <p className="text-xs text-muted-foreground">{type.description}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        {/* Common Fields */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
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
                          </div>

                          {/* Description/Content for text-heavy sections */}
                          {['text', 'hero', 'cta', 'newsletter'].includes(formData.type) && (
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Textarea
                                value={formData.description || formData.content}
                                onChange={(e) => setFormData({ 
                                  ...formData, 
                                  description: e.target.value,
                                  content: e.target.value 
                                })}
                                placeholder="Enter your content here..."
                                rows={4}
                              />
                            </div>
                          )}
                        </div>

                        {/* Button Fields */}
                        {['hero', 'promo', 'cta'].includes(formData.type) && (
                          <>
                            <Separator />
                            <div className="space-y-4">
                              <Label className="text-base font-semibold">Call to Action Buttons</Label>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-sm">Primary Button Text</Label>
                                  <Input
                                    value={formData.buttonText}
                                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                                    placeholder="Shop Now"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm">Primary Button Link</Label>
                                  <Input
                                    value={formData.buttonLink}
                                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                                    placeholder="/products"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm">Secondary Button Text</Label>
                                  <Input
                                    value={formData.secondaryButtonText}
                                    onChange={(e) => setFormData({ ...formData, secondaryButtonText: e.target.value })}
                                    placeholder="Learn More"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm">Secondary Button Link</Label>
                                  <Input
                                    value={formData.secondaryButtonLink}
                                    onChange={(e) => setFormData({ ...formData, secondaryButtonLink: e.target.value })}
                                    placeholder="/about"
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Background/Image Fields */}
                        {['hero', 'promo', 'cta', 'banner-carousel'].includes(formData.type) && (
                          <>
                            <Separator />
                            <div className="space-y-4">
                              <Label className="text-base font-semibold">Background Settings</Label>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-sm">Background Image URL</Label>
                                  <Input
                                    value={formData.backgroundImage}
                                    onChange={(e) => setFormData({ ...formData, backgroundImage: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                  />
                                  {formData.backgroundImage && (
                                    <div className="relative h-32 rounded-lg overflow-hidden border">
                                      <img 
                                        src={formData.backgroundImage} 
                                        alt="Background preview" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                      />
                                    </div>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label className="text-sm">Overlay Color</Label>
                                    <Input
                                      value={formData.backgroundOverlay}
                                      onChange={(e) => setFormData({ ...formData, backgroundOverlay: e.target.value })}
                                      placeholder="rgba(0,0,0,0.5)"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm">Content Alignment</Label>
                                    <Select 
                                      value={formData.alignment} 
                                      onValueChange={(v) => setFormData({ ...formData, alignment: v })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="left">Left</SelectItem>
                                        <SelectItem value="center">Center</SelectItem>
                                        <SelectItem value="right">Right</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Items Editor for Features/Testimonials */}
                        {['features', 'testimonials'].includes(formData.type) && (
                          <>
                            <Separator />
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">
                                  {formData.type === 'features' ? 'Feature Items' : 'Testimonials'}
                                </Label>
                                <Button variant="outline" size="sm" onClick={addItem}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Item
                                </Button>
                              </div>
                              <div className="space-y-3">
                                {formData.items.map((item, index) => (
                                  <div key={index} className="p-4 rounded-xl border bg-secondary/20 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium">Item {index + 1}</span>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-destructive"
                                        onClick={() => removeItem(index)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <Input
                                        placeholder="Title"
                                        value={item.title}
                                        onChange={(e) => updateItem(index, 'title', e.target.value)}
                                      />
                                      <Input
                                        placeholder="Icon name (optional)"
                                        value={item.icon || ''}
                                        onChange={(e) => updateItem(index, 'icon', e.target.value)}
                                      />
                                    </div>
                                    <Textarea
                                      placeholder="Description"
                                      value={item.description}
                                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                                      rows={2}
                                    />
                                    <Input
                                      placeholder="Image URL (optional)"
                                      value={item.image || ''}
                                      onChange={(e) => updateItem(index, 'image', e.target.value)}
                                    />
                                  </div>
                                ))}
                                {formData.items.length === 0 && (
                                  <div className="text-center py-6 text-muted-foreground border border-dashed rounded-xl">
                                    <p>No items yet. Click "Add Item" to start.</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}

                        {/* Image Gallery */}
                        {['gallery', 'banner-carousel'].includes(formData.type) && (
                          <>
                            <Separator />
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">Images</Label>
                                <Button variant="outline" size="sm" onClick={addImage}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Image
                                </Button>
                              </div>
                              <div className="space-y-3">
                                {formData.images.map((image, index) => (
                                  <div key={index} className="flex gap-2">
                                    <Input
                                      placeholder="Image URL"
                                      value={image}
                                      onChange={(e) => updateImage(index, e.target.value)}
                                      className="flex-1"
                                    />
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="text-destructive"
                                      onClick={() => removeImage(index)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                {formData.images.length === 0 && (
                                  <div className="text-center py-6 text-muted-foreground border border-dashed rounded-xl">
                                    <p>No images yet. Click "Add Image" to start.</p>
                                  </div>
                                )}
                              </div>
                              {formData.type === 'banner-carousel' && (
                                <div className="flex items-center gap-4 pt-2">
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={formData.autoPlay}
                                      onCheckedChange={(v) => setFormData({ ...formData, autoPlay: v })}
                                    />
                                    <Label>Auto Play</Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Label>Interval (ms)</Label>
                                    <Input
                                      type="number"
                                      value={formData.interval}
                                      onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) })}
                                      className="w-24"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </ScrollArea>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={isUpdating}>
                        {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Section
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pageContent && pageContent.length > 0 ? (
                  pageContent.map((section, index) => {
                    const content = section.content as Record<string, any>;
                    const Icon = getSectionIcon(content.type);
                    return (
                      <div
                        key={section.id}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-xl border transition-all",
                          section.is_active !== false 
                            ? "bg-card hover:bg-secondary/30" 
                            : "bg-secondary/20 opacity-60"
                        )}
                      >
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab flex-shrink-0" />
                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 flex-shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium truncate">{content.title || section.section_id}</h4>
                            <Badge variant="secondary" className="capitalize text-xs">
                              {content.type || 'unknown'}
                            </Badge>
                            {section.is_active === false && (
                              <Badge variant="outline" className="text-xs">Hidden</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {content.subtitle || content.description || 'No description'}
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDuplicate(section as ContentSection)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
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
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(section.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 border border-dashed rounded-xl">
                    <Layout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">No content sections yet</p>
                    <p className="text-sm text-muted-foreground mb-4">Click "Add Section" to create your first section</p>
                    <Button size="sm" onClick={() => { setEditingSection(null); setIsDialogOpen(true); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Section
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="homepage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                Homepage Section Manager
              </CardTitle>
              <CardDescription>
                Enable, disable, and reorder homepage sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {homepageSections.map((section, index) => (
                  <div
                    key={section.id}
                    className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-secondary/30 transition-all"
                  >
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{section.label}</h4>
                        {section.required && (
                          <Badge variant="default" className="text-xs">Required</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0}>
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={index === homepageSections.length - 1}>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Switch defaultChecked={true} disabled={section.required} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
