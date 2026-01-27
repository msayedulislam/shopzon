import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, Loader2, Navigation, Footprints } from 'lucide-react';
import { useSiteSettings, HeaderSettings, FooterSettings } from '@/hooks/useSiteSettings';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface LayoutEditorProps {
  onUpdate: () => void;
}

export function LayoutEditor({ onUpdate }: LayoutEditorProps) {
  const { settings, getSetting, updateSetting, isLoading, isUpdating } = useSiteSettings();

  const [header, setHeader] = useState<HeaderSettings>({
    showTopBar: true,
    topBarText: 'Free shipping on orders over ৳2000!',
    showSearch: true,
    showCart: true,
  });

  const [footer, setFooter] = useState<FooterSettings>({
    copyrightText: '© 2024 Jhuri. All rights reserved.',
    showSocialLinks: true,
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
    },
  });

  useEffect(() => {
    if (settings) {
      const savedHeader = getSetting<HeaderSettings>('header');
      const savedFooter = getSetting<FooterSettings>('footer');
      
      if (savedHeader) setHeader(savedHeader);
      if (savedFooter) setFooter(savedFooter);
    }
  }, [settings]);

  const handleSaveHeader = () => {
    updateSetting({ key: 'header', value: header as unknown as Record<string, unknown> });
    onUpdate();
  };

  const handleSaveFooter = () => {
    updateSetting({ key: 'footer', value: footer as unknown as Record<string, unknown> });
    onUpdate();
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
      <Accordion type="multiple" defaultValue={['header', 'footer']} className="space-y-4">
        {/* Header Settings */}
        <AccordionItem value="header" className="border rounded-xl px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Navigation className="h-5 w-5 text-primary" />
              <div className="text-left">
                <h3 className="font-semibold">Header Settings</h3>
                <p className="text-sm text-muted-foreground">Configure the site header</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Top Bar</Label>
                  <p className="text-sm text-muted-foreground">Display announcement bar at the top</p>
                </div>
                <Switch
                  checked={header.showTopBar}
                  onCheckedChange={(v) => setHeader({ ...header, showTopBar: v })}
                />
              </div>

              {header.showTopBar && (
                <div className="space-y-2">
                  <Label>Top Bar Text</Label>
                  <Input
                    value={header.topBarText}
                    onChange={(e) => setHeader({ ...header, topBarText: e.target.value })}
                    placeholder="Free shipping on orders over ৳2000!"
                  />
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Search</Label>
                  <p className="text-sm text-muted-foreground">Display search bar in header</p>
                </div>
                <Switch
                  checked={header.showSearch}
                  onCheckedChange={(v) => setHeader({ ...header, showSearch: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Cart Icon</Label>
                  <p className="text-sm text-muted-foreground">Display cart icon in header</p>
                </div>
                <Switch
                  checked={header.showCart}
                  onCheckedChange={(v) => setHeader({ ...header, showCart: v })}
                />
              </div>
            </div>
            <Button onClick={handleSaveHeader} className="mt-4 w-full" disabled={isUpdating}>
              {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Header Settings
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Footer Settings */}
        <AccordionItem value="footer" className="border rounded-xl px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Footprints className="h-5 w-5 text-primary" />
              <div className="text-left">
                <h3 className="font-semibold">Footer Settings</h3>
                <p className="text-sm text-muted-foreground">Configure the site footer</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Copyright Text</Label>
                <Input
                  value={footer.copyrightText}
                  onChange={(e) => setFooter({ ...footer, copyrightText: e.target.value })}
                  placeholder="© 2024 Your Company. All rights reserved."
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Social Links</Label>
                  <p className="text-sm text-muted-foreground">Display social media icons</p>
                </div>
                <Switch
                  checked={footer.showSocialLinks}
                  onCheckedChange={(v) => setFooter({ ...footer, showSocialLinks: v })}
                />
              </div>

              {footer.showSocialLinks && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Facebook URL</Label>
                    <Input
                      value={footer.socialLinks?.facebook || ''}
                      onChange={(e) => setFooter({
                        ...footer,
                        socialLinks: { ...footer.socialLinks, facebook: e.target.value }
                      })}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Instagram URL</Label>
                    <Input
                      value={footer.socialLinks?.instagram || ''}
                      onChange={(e) => setFooter({
                        ...footer,
                        socialLinks: { ...footer.socialLinks, instagram: e.target.value }
                      })}
                      placeholder="https://instagram.com/yourpage"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Twitter URL</Label>
                    <Input
                      value={footer.socialLinks?.twitter || ''}
                      onChange={(e) => setFooter({
                        ...footer,
                        socialLinks: { ...footer.socialLinks, twitter: e.target.value }
                      })}
                      placeholder="https://twitter.com/yourpage"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>YouTube URL</Label>
                    <Input
                      value={footer.socialLinks?.youtube || ''}
                      onChange={(e) => setFooter({
                        ...footer,
                        socialLinks: { ...footer.socialLinks, youtube: e.target.value }
                      })}
                      placeholder="https://youtube.com/yourchannel"
                    />
                  </div>
                </div>
              )}
            </div>
            <Button onClick={handleSaveFooter} className="mt-4 w-full" disabled={isUpdating}>
              {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Footer Settings
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
