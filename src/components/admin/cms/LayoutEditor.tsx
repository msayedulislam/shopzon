import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2, Navigation, Footprints, Menu, Plus, Trash2, GripVertical, ExternalLink, ChevronDown, Settings2, Bell, Shield, Globe } from 'lucide-react';
import { useSiteSettings, HeaderSettings, FooterSettings } from '@/hooks/useSiteSettings';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LayoutEditorProps {
  onUpdate: () => void;
}

interface ExtendedHeaderSettings extends HeaderSettings {
  stickyHeader: boolean;
  headerStyle: 'default' | 'transparent' | 'solid';
  menuItems: { label: string; link: string; children?: { label: string; link: string }[] }[];
  showCategories: boolean;
  showWishlist: boolean;
  showAccount: boolean;
  mobileMenuStyle: 'drawer' | 'fullscreen';
}

interface ExtendedFooterSettings extends FooterSettings {
  layout: 'simple' | 'detailed' | 'minimal';
  showNewsletter: boolean;
  newsletterTitle: string;
  newsletterSubtitle: string;
  columns: {
    title: string;
    links: { label: string; url: string }[];
  }[];
  bottomLinks: { label: string; url: string }[];
  showPaymentIcons: boolean;
  paymentMethods: string[];
}

interface SiteWideSettings {
  announcementBar: {
    enabled: boolean;
    text: string;
    link: string;
    backgroundColor: string;
    textColor: string;
    closable: boolean;
  };
  cookieConsent: {
    enabled: boolean;
    message: string;
    buttonText: string;
    policyLink: string;
  };
  loadingScreen: {
    enabled: boolean;
    showLogo: boolean;
    style: 'spinner' | 'progress' | 'minimal';
  };
  scrollToTop: {
    enabled: boolean;
    position: 'left' | 'right';
  };
}

export function LayoutEditor({ onUpdate }: LayoutEditorProps) {
  const { settings, getSetting, updateSetting, isLoading, isUpdating } = useSiteSettings();

  const [header, setHeader] = useState<ExtendedHeaderSettings>({
    showTopBar: true,
    topBarText: 'Free shipping on orders over ৳2000!',
    showSearch: true,
    showCart: true,
    stickyHeader: true,
    headerStyle: 'default',
    menuItems: [
      { label: 'Home', link: '/' },
      { label: 'Products', link: '/products' },
      { label: 'Categories', link: '/categories' },
      { label: 'Blog', link: '/blog' },
    ],
    showCategories: true,
    showWishlist: true,
    showAccount: true,
    mobileMenuStyle: 'drawer',
  });

  const [footer, setFooter] = useState<ExtendedFooterSettings>({
    copyrightText: '© 2024 Jhuri. All rights reserved.',
    showSocialLinks: true,
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
    },
    layout: 'detailed',
    showNewsletter: true,
    newsletterTitle: 'Subscribe to our newsletter',
    newsletterSubtitle: 'Get updates on new arrivals and exclusive offers',
    columns: [
      {
        title: 'Shop',
        links: [
          { label: 'New Arrivals', url: '/products?sort=newest' },
          { label: 'Best Sellers', url: '/products?sort=popular' },
          { label: 'Sale', url: '/products?sale=true' },
        ],
      },
      {
        title: 'Support',
        links: [
          { label: 'Help Center', url: '/help' },
          { label: 'Shipping Info', url: '/page/shipping' },
          { label: 'Returns', url: '/page/returns' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'About Us', url: '/page/about' },
          { label: 'Careers', url: '/page/careers' },
          { label: 'Contact', url: '/page/contact' },
        ],
      },
    ],
    bottomLinks: [
      { label: 'Privacy Policy', url: '/page/privacy' },
      { label: 'Terms of Service', url: '/page/terms' },
    ],
    showPaymentIcons: true,
    paymentMethods: ['bkash', 'nagad', 'cod', 'card'],
  });

  const [siteWide, setSiteWide] = useState<SiteWideSettings>({
    announcementBar: {
      enabled: true,
      text: '🎉 Flash Sale! Up to 50% off on selected items',
      link: '/products?sale=true',
      backgroundColor: 'hsl(var(--primary))',
      textColor: 'hsl(var(--primary-foreground))',
      closable: true,
    },
    cookieConsent: {
      enabled: true,
      message: 'We use cookies to improve your experience.',
      buttonText: 'Accept',
      policyLink: '/page/privacy',
    },
    loadingScreen: {
      enabled: false,
      showLogo: true,
      style: 'spinner',
    },
    scrollToTop: {
      enabled: true,
      position: 'right',
    },
  });

  useEffect(() => {
    if (settings) {
      const savedHeader = getSetting<ExtendedHeaderSettings>('header');
      const savedFooter = getSetting<ExtendedFooterSettings>('footer');
      const savedSiteWide = getSetting<SiteWideSettings>('site_wide');
      
      if (savedHeader) setHeader(prev => ({ ...prev, ...savedHeader }));
      if (savedFooter) setFooter(prev => ({ ...prev, ...savedFooter }));
      if (savedSiteWide) setSiteWide(prev => ({ ...prev, ...savedSiteWide }));
    }
  }, [settings]);

  const handleSaveAll = () => {
    updateSetting({ key: 'header', value: header as unknown as Record<string, unknown> });
    updateSetting({ key: 'footer', value: footer as unknown as Record<string, unknown> });
    updateSetting({ key: 'site_wide', value: siteWide as unknown as Record<string, unknown> });
    onUpdate();
    toast.success('Layout settings saved!');
  };

  const addMenuItem = () => {
    setHeader({
      ...header,
      menuItems: [...header.menuItems, { label: 'New Link', link: '/' }],
    });
  };

  const updateMenuItem = (index: number, field: 'label' | 'link', value: string) => {
    const newItems = [...header.menuItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setHeader({ ...header, menuItems: newItems });
  };

  const removeMenuItem = (index: number) => {
    setHeader({
      ...header,
      menuItems: header.menuItems.filter((_, i) => i !== index),
    });
  };

  const addFooterColumn = () => {
    setFooter({
      ...footer,
      columns: [...footer.columns, { title: 'New Column', links: [] }],
    });
  };

  const updateFooterColumn = (index: number, title: string) => {
    const newColumns = [...footer.columns];
    newColumns[index] = { ...newColumns[index], title };
    setFooter({ ...footer, columns: newColumns });
  };

  const removeFooterColumn = (index: number) => {
    setFooter({
      ...footer,
      columns: footer.columns.filter((_, i) => i !== index),
    });
  };

  const addColumnLink = (columnIndex: number) => {
    const newColumns = [...footer.columns];
    newColumns[columnIndex].links.push({ label: 'New Link', url: '/' });
    setFooter({ ...footer, columns: newColumns });
  };

  const updateColumnLink = (columnIndex: number, linkIndex: number, field: 'label' | 'url', value: string) => {
    const newColumns = [...footer.columns];
    newColumns[columnIndex].links[linkIndex] = { 
      ...newColumns[columnIndex].links[linkIndex], 
      [field]: value 
    };
    setFooter({ ...footer, columns: newColumns });
  };

  const removeColumnLink = (columnIndex: number, linkIndex: number) => {
    const newColumns = [...footer.columns];
    newColumns[columnIndex].links = newColumns[columnIndex].links.filter((_, i) => i !== linkIndex);
    setFooter({ ...footer, columns: newColumns });
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
      {/* Quick Save */}
      <Card className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-primary/20">
        <CardContent className="p-4">
          <Button onClick={handleSaveAll} disabled={isUpdating} className="gap-2">
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save All Layout Settings
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="header" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="header" className="gap-2 py-2">
            <Navigation className="h-4 w-4" />
            <span className="hidden sm:inline">Header</span>
          </TabsTrigger>
          <TabsTrigger value="footer" className="gap-2 py-2">
            <Footprints className="h-4 w-4" />
            <span className="hidden sm:inline">Footer</span>
          </TabsTrigger>
          <TabsTrigger value="site-wide" className="gap-2 py-2">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Site-Wide</span>
          </TabsTrigger>
        </TabsList>

        {/* Header Tab */}
        <TabsContent value="header" className="space-y-6">
          <Accordion type="multiple" defaultValue={['top-bar', 'navigation', 'elements']} className="space-y-3">
            {/* Top Bar Settings */}
            <AccordionItem value="top-bar" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <span className="font-medium">Top Announcement Bar</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Top Bar</Label>
                    <p className="text-sm text-muted-foreground">Show announcement bar at the top</p>
                  </div>
                  <Switch
                    checked={header.showTopBar}
                    onCheckedChange={(v) => setHeader({ ...header, showTopBar: v })}
                  />
                </div>

                {header.showTopBar && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-2">
                      <Label>Announcement Text</Label>
                      <Input
                        value={header.topBarText}
                        onChange={(e) => setHeader({ ...header, topBarText: e.target.value })}
                        placeholder="Free shipping on orders over ৳2000!"
                      />
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Navigation Menu */}
            <AccordionItem value="navigation" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <Menu className="h-5 w-5 text-primary" />
                  <span className="font-medium">Navigation Menu</span>
                  <Badge variant="secondary">{header.menuItems.length} items</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-4">
                <div className="space-y-3">
                  {header.menuItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 rounded-lg border bg-secondary/20">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <Input
                        value={item.label}
                        onChange={(e) => updateMenuItem(index, 'label', e.target.value)}
                        placeholder="Label"
                        className="flex-1"
                      />
                      <Input
                        value={item.link}
                        onChange={(e) => updateMenuItem(index, 'link', e.target.value)}
                        placeholder="/link"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeMenuItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addMenuItem} className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Add Menu Item
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Header Elements */}
            <AccordionItem value="elements" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <Settings2 className="h-5 w-5 text-primary" />
                  <span className="font-medium">Header Elements</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <Label>Sticky Header</Label>
                    <Switch
                      checked={header.stickyHeader}
                      onCheckedChange={(v) => setHeader({ ...header, stickyHeader: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <Label>Show Search</Label>
                    <Switch
                      checked={header.showSearch}
                      onCheckedChange={(v) => setHeader({ ...header, showSearch: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <Label>Show Cart</Label>
                    <Switch
                      checked={header.showCart}
                      onCheckedChange={(v) => setHeader({ ...header, showCart: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <Label>Show Wishlist</Label>
                    <Switch
                      checked={header.showWishlist}
                      onCheckedChange={(v) => setHeader({ ...header, showWishlist: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <Label>Show Account</Label>
                    <Switch
                      checked={header.showAccount}
                      onCheckedChange={(v) => setHeader({ ...header, showAccount: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <Label>Show Categories</Label>
                    <Switch
                      checked={header.showCategories}
                      onCheckedChange={(v) => setHeader({ ...header, showCategories: v })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Header Style</Label>
                  <Select 
                    value={header.headerStyle} 
                    onValueChange={(v) => setHeader({ ...header, headerStyle: v as 'default' | 'transparent' | 'solid' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="transparent">Transparent (for Hero)</SelectItem>
                      <SelectItem value="solid">Solid Color</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Mobile Menu Style</Label>
                  <Select 
                    value={header.mobileMenuStyle} 
                    onValueChange={(v) => setHeader({ ...header, mobileMenuStyle: v as 'drawer' | 'fullscreen' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drawer">Side Drawer</SelectItem>
                      <SelectItem value="fullscreen">Fullscreen Overlay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        {/* Footer Tab */}
        <TabsContent value="footer" className="space-y-6">
          <Accordion type="multiple" defaultValue={['layout', 'columns', 'social']} className="space-y-3">
            {/* Footer Layout */}
            <AccordionItem value="layout" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <Settings2 className="h-5 w-5 text-primary" />
                  <span className="font-medium">Footer Layout</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-4">
                <div className="space-y-2">
                  <Label>Layout Style</Label>
                  <Select 
                    value={footer.layout} 
                    onValueChange={(v) => setFooter({ ...footer, layout: v as 'simple' | 'detailed' | 'minimal' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal - Just copyright</SelectItem>
                      <SelectItem value="simple">Simple - Copyright + Links</SelectItem>
                      <SelectItem value="detailed">Detailed - Full footer with columns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Copyright Text</Label>
                  <Input
                    value={footer.copyrightText}
                    onChange={(e) => setFooter({ ...footer, copyrightText: e.target.value })}
                    placeholder="© 2024 Your Company. All rights reserved."
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label>Show Payment Icons</Label>
                  <Switch
                    checked={footer.showPaymentIcons}
                    onCheckedChange={(v) => setFooter({ ...footer, showPaymentIcons: v })}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Footer Columns */}
            <AccordionItem value="columns" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <Menu className="h-5 w-5 text-primary" />
                  <span className="font-medium">Footer Columns</span>
                  <Badge variant="secondary">{footer.columns.length} columns</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-4">
                {footer.columns.map((column, columnIndex) => (
                  <div key={columnIndex} className="p-4 rounded-xl border bg-secondary/20 space-y-3">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <Input
                        value={column.title}
                        onChange={(e) => updateFooterColumn(columnIndex, e.target.value)}
                        placeholder="Column Title"
                        className="flex-1 font-medium"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeFooterColumn(columnIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="pl-6 space-y-2">
                      {column.links.map((link, linkIndex) => (
                        <div key={linkIndex} className="flex items-center gap-2">
                          <Input
                            value={link.label}
                            onChange={(e) => updateColumnLink(columnIndex, linkIndex, 'label', e.target.value)}
                            placeholder="Label"
                            className="flex-1"
                          />
                          <Input
                            value={link.url}
                            onChange={(e) => updateColumnLink(columnIndex, linkIndex, 'url', e.target.value)}
                            placeholder="/link"
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeColumnLink(columnIndex, linkIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addColumnLink(columnIndex)}
                        className="gap-2"
                      >
                        <Plus className="h-3 w-3" />
                        Add Link
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addFooterColumn} className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Add Column
                </Button>
              </AccordionContent>
            </AccordionItem>

            {/* Social Links */}
            <AccordionItem value="social" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <span className="font-medium">Social Links</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label>Show Social Links</Label>
                  <Switch
                    checked={footer.showSocialLinks}
                    onCheckedChange={(v) => setFooter({ ...footer, showSocialLinks: v })}
                  />
                </div>

                {footer.showSocialLinks && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Facebook</Label>
                      <Input
                        value={footer.socialLinks?.facebook || ''}
                        onChange={(e) => setFooter({
                          ...footer,
                          socialLinks: { ...footer.socialLinks, facebook: e.target.value }
                        })}
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Instagram</Label>
                      <Input
                        value={footer.socialLinks?.instagram || ''}
                        onChange={(e) => setFooter({
                          ...footer,
                          socialLinks: { ...footer.socialLinks, instagram: e.target.value }
                        })}
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Twitter/X</Label>
                      <Input
                        value={footer.socialLinks?.twitter || ''}
                        onChange={(e) => setFooter({
                          ...footer,
                          socialLinks: { ...footer.socialLinks, twitter: e.target.value }
                        })}
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>YouTube</Label>
                      <Input
                        value={footer.socialLinks?.youtube || ''}
                        onChange={(e) => setFooter({
                          ...footer,
                          socialLinks: { ...footer.socialLinks, youtube: e.target.value }
                        })}
                        placeholder="https://youtube.com/..."
                      />
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Newsletter */}
            <AccordionItem value="newsletter" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <span className="font-medium">Newsletter Section</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label>Show Newsletter</Label>
                  <Switch
                    checked={footer.showNewsletter}
                    onCheckedChange={(v) => setFooter({ ...footer, showNewsletter: v })}
                  />
                </div>

                {footer.showNewsletter && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Newsletter Title</Label>
                      <Input
                        value={footer.newsletterTitle}
                        onChange={(e) => setFooter({ ...footer, newsletterTitle: e.target.value })}
                        placeholder="Subscribe to our newsletter"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Newsletter Subtitle</Label>
                      <Input
                        value={footer.newsletterSubtitle}
                        onChange={(e) => setFooter({ ...footer, newsletterSubtitle: e.target.value })}
                        placeholder="Get updates on new arrivals and exclusive offers"
                      />
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        {/* Site-Wide Tab */}
        <TabsContent value="site-wide" className="space-y-6">
          <Accordion type="multiple" defaultValue={['announcement', 'features']} className="space-y-3">
            {/* Announcement Bar */}
            <AccordionItem value="announcement" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <span className="font-medium">Global Announcement Bar</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label>Enable Announcement Bar</Label>
                  <Switch
                    checked={siteWide.announcementBar.enabled}
                    onCheckedChange={(v) => setSiteWide({
                      ...siteWide,
                      announcementBar: { ...siteWide.announcementBar, enabled: v }
                    })}
                  />
                </div>

                {siteWide.announcementBar.enabled && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Announcement Text</Label>
                      <Input
                        value={siteWide.announcementBar.text}
                        onChange={(e) => setSiteWide({
                          ...siteWide,
                          announcementBar: { ...siteWide.announcementBar, text: e.target.value }
                        })}
                        placeholder="🎉 Flash Sale! Up to 50% off"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Link (optional)</Label>
                      <Input
                        value={siteWide.announcementBar.link}
                        onChange={(e) => setSiteWide({
                          ...siteWide,
                          announcementBar: { ...siteWide.announcementBar, link: e.target.value }
                        })}
                        placeholder="/products?sale=true"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <Label>Allow Close</Label>
                      <Switch
                        checked={siteWide.announcementBar.closable}
                        onCheckedChange={(v) => setSiteWide({
                          ...siteWide,
                          announcementBar: { ...siteWide.announcementBar, closable: v }
                        })}
                      />
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Site Features */}
            <AccordionItem value="features" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <Settings2 className="h-5 w-5 text-primary" />
                  <span className="font-medium">Site Features</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <Label>Scroll to Top Button</Label>
                      <p className="text-sm text-muted-foreground">Show button to scroll back to top</p>
                    </div>
                    <Switch
                      checked={siteWide.scrollToTop.enabled}
                      onCheckedChange={(v) => setSiteWide({
                        ...siteWide,
                        scrollToTop: { ...siteWide.scrollToTop, enabled: v }
                      })}
                    />
                  </div>

                  {siteWide.scrollToTop.enabled && (
                    <div className="space-y-2 pl-3">
                      <Label>Button Position</Label>
                      <Select 
                        value={siteWide.scrollToTop.position} 
                        onValueChange={(v) => setSiteWide({
                          ...siteWide,
                          scrollToTop: { ...siteWide.scrollToTop, position: v as 'left' | 'right' }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Bottom Left</SelectItem>
                          <SelectItem value="right">Bottom Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <Label>Cookie Consent Banner</Label>
                      <p className="text-sm text-muted-foreground">Show GDPR cookie consent popup</p>
                    </div>
                    <Switch
                      checked={siteWide.cookieConsent.enabled}
                      onCheckedChange={(v) => setSiteWide({
                        ...siteWide,
                        cookieConsent: { ...siteWide.cookieConsent, enabled: v }
                      })}
                    />
                  </div>

                  {siteWide.cookieConsent.enabled && (
                    <div className="space-y-3 pl-3">
                      <div className="space-y-2">
                        <Label>Cookie Message</Label>
                        <Textarea
                          value={siteWide.cookieConsent.message}
                          onChange={(e) => setSiteWide({
                            ...siteWide,
                            cookieConsent: { ...siteWide.cookieConsent, message: e.target.value }
                          })}
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Button Text</Label>
                          <Input
                            value={siteWide.cookieConsent.buttonText}
                            onChange={(e) => setSiteWide({
                              ...siteWide,
                              cookieConsent: { ...siteWide.cookieConsent, buttonText: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Privacy Policy Link</Label>
                          <Input
                            value={siteWide.cookieConsent.policyLink}
                            onChange={(e) => setSiteWide({
                              ...siteWide,
                              cookieConsent: { ...siteWide.cookieConsent, policyLink: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <Label>Loading Screen</Label>
                      <p className="text-sm text-muted-foreground">Show loading animation on page load</p>
                    </div>
                    <Switch
                      checked={siteWide.loadingScreen.enabled}
                      onCheckedChange={(v) => setSiteWide({
                        ...siteWide,
                        loadingScreen: { ...siteWide.loadingScreen, enabled: v }
                      })}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>

      {/* Save All Button */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <Button onClick={handleSaveAll} className="w-full h-12 text-base" disabled={isUpdating}>
            {isUpdating ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            Save All Layout Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
