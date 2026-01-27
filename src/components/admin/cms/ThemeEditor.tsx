import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Palette, Type, Save, Loader2 } from 'lucide-react';
import { useSiteSettings, ThemeColors, Typography, Branding } from '@/hooks/useSiteSettings';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ThemeEditorProps {
  onUpdate: () => void;
}

const fontOptions = [
  'Outfit',
  'Space Grotesk',
  'Inter',
  'Poppins',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Playfair Display',
  'Merriweather',
];

export function ThemeEditor({ onUpdate }: ThemeEditorProps) {
  const { settings, getSetting, updateSetting, isLoading, isUpdating } = useSiteSettings();
  
  const [colors, setColors] = useState<ThemeColors>({
    primary: '0 84% 60%',
    secondary: '0 0% 96%',
    accent: '0 84% 60%',
    background: '0 0% 100%',
    foreground: '0 0% 3.9%',
  });

  const [typography, setTypography] = useState<Typography>({
    headingFont: 'Outfit',
    bodyFont: 'Space Grotesk',
    baseFontSize: '16px',
  });

  const [branding, setBranding] = useState<Branding>({
    siteName: 'Jhuri',
    tagline: 'Your Fashion Destination',
    logoUrl: '',
    faviconUrl: '',
  });

  useEffect(() => {
    if (settings) {
      const savedColors = getSetting<ThemeColors>('theme_colors');
      const savedTypography = getSetting<Typography>('typography');
      const savedBranding = getSetting<Branding>('branding');
      
      if (savedColors) setColors(savedColors);
      if (savedTypography) setTypography(savedTypography);
      if (savedBranding) setBranding(savedBranding);
    }
  }, [settings]);

  const handleSaveColors = () => {
    updateSetting({ key: 'theme_colors', value: colors as unknown as Record<string, unknown> });
    onUpdate();
  };

  const handleSaveTypography = () => {
    updateSetting({ key: 'typography', value: typography as unknown as Record<string, unknown> });
    onUpdate();
  };

  const handleSaveBranding = () => {
    updateSetting({ key: 'branding', value: branding as unknown as Record<string, unknown> });
    onUpdate();
  };

  const hslToHex = (hsl: string): string => {
    const [h, s, l] = hsl.split(' ').map(v => parseFloat(v.replace('%', '')));
    const sDecimal = s / 100;
    const lDecimal = l / 100;
    
    const c = (1 - Math.abs(2 * lDecimal - 1)) * sDecimal;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = lDecimal - c / 2;
    
    let r = 0, g = 0, b = 0;
    if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    
    const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const hexToHsl = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0 0% 0%';
    
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
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
      <Accordion type="multiple" defaultValue={['colors', 'typography', 'branding']} className="space-y-4">
        {/* Colors */}
        <AccordionItem value="colors" className="border rounded-xl px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-primary" />
              <div className="text-left">
                <h3 className="font-semibold">Color Palette</h3>
                <p className="text-sm text-muted-foreground">Customize your brand colors</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(colors).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={hslToHex(value)}
                      onChange={(e) => setColors({ ...colors, [key]: hexToHsl(e.target.value) })}
                      className="h-10 w-14 rounded border cursor-pointer"
                    />
                    <Input
                      value={value}
                      onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
                      placeholder="H S% L%"
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={handleSaveColors} className="mt-4 w-full" disabled={isUpdating}>
              {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Colors
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Typography */}
        <AccordionItem value="typography" className="border rounded-xl px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Type className="h-5 w-5 text-primary" />
              <div className="text-left">
                <h3 className="font-semibold">Typography</h3>
                <p className="text-sm text-muted-foreground">Set fonts and text sizes</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Heading Font</Label>
                <Select 
                  value={typography.headingFont} 
                  onValueChange={(v) => setTypography({ ...typography, headingFont: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Body Font</Label>
                <Select 
                  value={typography.bodyFont} 
                  onValueChange={(v) => setTypography({ ...typography, bodyFont: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Base Font Size</Label>
                <Select 
                  value={typography.baseFontSize} 
                  onValueChange={(v) => setTypography({ ...typography, baseFontSize: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="14px">14px (Small)</SelectItem>
                    <SelectItem value="16px">16px (Default)</SelectItem>
                    <SelectItem value="18px">18px (Large)</SelectItem>
                    <SelectItem value="20px">20px (Extra Large)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSaveTypography} className="mt-4 w-full" disabled={isUpdating}>
              {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Typography
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Branding */}
        <AccordionItem value="branding" className="border rounded-xl px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-primary" />
              <div className="text-left">
                <h3 className="font-semibold">Branding</h3>
                <p className="text-sm text-muted-foreground">Site name, logo, and tagline</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Site Name</Label>
                <Input
                  value={branding.siteName}
                  onChange={(e) => setBranding({ ...branding, siteName: e.target.value })}
                  placeholder="Your Site Name"
                />
              </div>

              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input
                  value={branding.tagline}
                  onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
                  placeholder="Your tagline here"
                />
              </div>

              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input
                  value={branding.logoUrl}
                  onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="space-y-2">
                <Label>Favicon URL</Label>
                <Input
                  value={branding.faviconUrl}
                  onChange={(e) => setBranding({ ...branding, faviconUrl: e.target.value })}
                  placeholder="https://example.com/favicon.ico"
                />
              </div>
            </div>
            <Button onClick={handleSaveBranding} className="mt-4 w-full" disabled={isUpdating}>
              {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Branding
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
