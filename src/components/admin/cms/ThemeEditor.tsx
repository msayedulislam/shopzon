import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Palette, Type, Save, Loader2, Sun, Moon, Sparkles, Image, RefreshCw, Check, Copy, Wand2 } from 'lucide-react';
import { useSiteSettings, ThemeColors, Typography, Branding } from '@/hooks/useSiteSettings';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ThemeEditorProps {
  onUpdate: () => void;
}

interface ExtendedThemeColors extends ThemeColors {
  muted: string;
  mutedForeground: string;
  card: string;
  cardForeground: string;
  border: string;
  ring: string;
  destructive: string;
  success: string;
}

interface ExtendedTypography extends Typography {
  lineHeight: string;
  letterSpacing: string;
  headingWeight: string;
  bodyWeight: string;
}

interface ExtendedBranding extends Branding {
  logoType: 'text' | 'image' | 'both';
  logoSize: string;
  borderRadius: string;
  shadowIntensity: string;
}

interface SpacingSettings {
  containerPadding: string;
  sectionGap: string;
  cardPadding: string;
  buttonPadding: string;
}

const fontOptions = [
  { value: 'Outfit', label: 'Outfit', style: 'Modern Sans' },
  { value: 'Space Grotesk', label: 'Space Grotesk', style: 'Tech' },
  { value: 'Inter', label: 'Inter', style: 'Clean' },
  { value: 'Poppins', label: 'Poppins', style: 'Friendly' },
  { value: 'DM Sans', label: 'DM Sans', style: 'Professional' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', style: 'Premium' },
  { value: 'Manrope', label: 'Manrope', style: 'Modern' },
  { value: 'Playfair Display', label: 'Playfair Display', style: 'Elegant' },
  { value: 'Libre Baskerville', label: 'Libre Baskerville', style: 'Classic' },
  { value: 'Sora', label: 'Sora', style: 'Futuristic' },
];

const colorPresets = [
  { name: 'Ruby Red', primary: '0 84% 60%', accent: '0 72% 51%' },
  { name: 'Ocean Blue', primary: '217 91% 60%', accent: '199 89% 48%' },
  { name: 'Emerald Green', primary: '142 76% 36%', accent: '158 64% 52%' },
  { name: 'Royal Purple', primary: '271 76% 53%', accent: '262 83% 58%' },
  { name: 'Sunset Orange', primary: '24 95% 53%', accent: '38 92% 50%' },
  { name: 'Midnight Dark', primary: '240 6% 10%', accent: '240 5% 26%' },
  { name: 'Rose Pink', primary: '350 89% 60%', accent: '330 81% 60%' },
  { name: 'Teal', primary: '174 72% 40%', accent: '168 76% 42%' },
];

export function ThemeEditor({ onUpdate }: ThemeEditorProps) {
  const { settings, getSetting, updateSetting, createSetting, isLoading, isUpdating } = useSiteSettings();
  const [activeMode, setActiveMode] = useState<'light' | 'dark'>('light');
  const [copied, setCopied] = useState<string | null>(null);
  
  const [colors, setColors] = useState<ExtendedThemeColors>({
    primary: '0 84% 60%',
    secondary: '0 0% 96%',
    accent: '0 84% 60%',
    background: '0 0% 100%',
    foreground: '0 0% 3.9%',
    muted: '0 0% 96%',
    mutedForeground: '0 0% 45%',
    card: '0 0% 100%',
    cardForeground: '0 0% 3.9%',
    border: '0 0% 90%',
    ring: '0 84% 60%',
    destructive: '0 84% 60%',
    success: '142 76% 36%',
  });

  const [darkColors, setDarkColors] = useState<ExtendedThemeColors>({
    primary: '0 84% 60%',
    secondary: '0 0% 14%',
    accent: '0 84% 60%',
    background: '0 0% 7%',
    foreground: '0 0% 98%',
    muted: '0 0% 14%',
    mutedForeground: '0 0% 64%',
    card: '0 0% 10%',
    cardForeground: '0 0% 98%',
    border: '0 0% 18%',
    ring: '0 84% 60%',
    destructive: '0 84% 60%',
    success: '142 76% 36%',
  });

  const [typography, setTypography] = useState<ExtendedTypography>({
    headingFont: 'Outfit',
    bodyFont: 'Space Grotesk',
    baseFontSize: '16px',
    lineHeight: '1.6',
    letterSpacing: 'normal',
    headingWeight: '700',
    bodyWeight: '400',
  });

  const [branding, setBranding] = useState<ExtendedBranding>({
    siteName: 'Jhuri',
    tagline: 'Your Fashion Destination',
    logoUrl: '',
    faviconUrl: '',
    logoType: 'text',
    logoSize: 'medium',
    borderRadius: '0.75rem',
    shadowIntensity: 'medium',
  });

  const [spacing, setSpacing] = useState<SpacingSettings>({
    containerPadding: '1.5rem',
    sectionGap: '3rem',
    cardPadding: '1.5rem',
    buttonPadding: '1rem 2rem',
  });

  useEffect(() => {
    if (settings) {
      const savedColors = getSetting<ExtendedThemeColors>('theme_colors');
      const savedDarkColors = getSetting<ExtendedThemeColors>('dark_theme_colors');
      const savedTypography = getSetting<ExtendedTypography>('typography');
      const savedBranding = getSetting<ExtendedBranding>('branding');
      const savedSpacing = getSetting<SpacingSettings>('spacing');
      
      if (savedColors) setColors(prev => ({ ...prev, ...savedColors }));
      if (savedDarkColors) setDarkColors(prev => ({ ...prev, ...savedDarkColors }));
      if (savedTypography) setTypography(prev => ({ ...prev, ...savedTypography }));
      if (savedBranding) setBranding(prev => ({ ...prev, ...savedBranding }));
      if (savedSpacing) setSpacing(prev => ({ ...prev, ...savedSpacing }));
    }
  }, [settings]);

  const handleSaveAll = async () => {
    try {
      updateSetting({ key: 'theme_colors', value: colors as unknown as Record<string, unknown> });
      updateSetting({ key: 'dark_theme_colors', value: darkColors as unknown as Record<string, unknown> });
      updateSetting({ key: 'typography', value: typography as unknown as Record<string, unknown> });
      updateSetting({ key: 'branding', value: branding as unknown as Record<string, unknown> });
      updateSetting({ key: 'spacing', value: spacing as unknown as Record<string, unknown> });
      onUpdate();
      toast.success('Theme settings saved successfully!');
    } catch {
      toast.error('Failed to save theme settings');
    }
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    setColors(prev => ({ ...prev, primary: preset.primary, accent: preset.accent, ring: preset.primary }));
    toast.success(`Applied "${preset.name}" color preset`);
  };

  const generateDarkMode = () => {
    setDarkColors({
      ...darkColors,
      primary: colors.primary,
      accent: colors.accent,
      ring: colors.ring,
    });
    toast.success('Dark mode colors generated from light mode');
  };

  const hslToHex = (hsl: string): string => {
    try {
      const parts = hsl.split(' ');
      const h = parseFloat(parts[0]) || 0;
      const s = parseFloat(parts[1]?.replace('%', '')) || 0;
      const l = parseFloat(parts[2]?.replace('%', '')) || 0;
      
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
    } catch {
      return '#000000';
    }
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

  const copyToClipboard = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
    toast.success('Copied to clipboard');
  };

  const currentColors = activeMode === 'light' ? colors : darkColors;
  const setCurrentColors = activeMode === 'light' ? setColors : setDarkColors;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const ColorInput = ({ colorKey, label }: { colorKey: keyof ExtendedThemeColors; label: string }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <button
          onClick={() => copyToClipboard(currentColors[colorKey], colorKey)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {copied === colorKey ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
      <div className="flex gap-2">
        <div className="relative">
          <input
            type="color"
            value={hslToHex(currentColors[colorKey])}
            onChange={(e) => setCurrentColors({ ...currentColors, [colorKey]: hexToHsl(e.target.value) })}
            className="h-10 w-12 rounded-lg border cursor-pointer appearance-none bg-transparent"
            style={{ backgroundColor: `hsl(${currentColors[colorKey]})` }}
          />
          <div 
            className="absolute inset-0 rounded-lg pointer-events-none border-2 border-border"
            style={{ backgroundColor: `hsl(${currentColors[colorKey]})` }}
          />
        </div>
        <Input
          value={currentColors[colorKey]}
          onChange={(e) => setCurrentColors({ ...currentColors, [colorKey]: e.target.value })}
          placeholder="H S% L%"
          className="flex-1 font-mono text-xs"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleSaveAll} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save All Changes
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={generateDarkMode}>
              <Wand2 className="h-4 w-4" />
              Auto Generate Dark Mode
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          <TabsTrigger value="colors" className="gap-2 py-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Colors</span>
          </TabsTrigger>
          <TabsTrigger value="typography" className="gap-2 py-2">
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">Typography</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-2 py-2">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Branding</span>
          </TabsTrigger>
          <TabsTrigger value="spacing" className="gap-2 py-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Spacing</span>
          </TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          {/* Color Presets */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Quick Presets
              </CardTitle>
              <CardDescription>Apply a color theme instantly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyColorPreset(preset)}
                    className="group flex flex-col items-center gap-2 p-3 rounded-xl border hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <div className="flex gap-1">
                      <div 
                        className="h-6 w-6 rounded-full shadow-sm ring-1 ring-black/10"
                        style={{ backgroundColor: `hsl(${preset.primary})` }}
                      />
                      <div 
                        className="h-6 w-6 rounded-full shadow-sm ring-1 ring-black/10"
                        style={{ backgroundColor: `hsl(${preset.accent})` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mode Toggle */}
          <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-secondary/50">
            <Button
              variant={activeMode === 'light' ? 'default' : 'ghost'}
              size="sm"
              className="gap-2"
              onClick={() => setActiveMode('light')}
            >
              <Sun className="h-4 w-4" />
              Light Mode
            </Button>
            <Button
              variant={activeMode === 'dark' ? 'default' : 'ghost'}
              size="sm"
              className="gap-2"
              onClick={() => setActiveMode('dark')}
            >
              <Moon className="h-4 w-4" />
              Dark Mode
            </Button>
          </div>

          {/* Color Groups */}
          <Accordion type="multiple" defaultValue={['brand', 'backgrounds', 'text']} className="space-y-3">
            <AccordionItem value="brand" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: `hsl(${currentColors.primary})` }} />
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: `hsl(${currentColors.accent})` }} />
                  </div>
                  <span className="font-medium">Brand Colors</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="grid grid-cols-2 gap-4">
                  <ColorInput colorKey="primary" label="Primary" />
                  <ColorInput colorKey="secondary" label="Secondary" />
                  <ColorInput colorKey="accent" label="Accent" />
                  <ColorInput colorKey="ring" label="Focus Ring" />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="backgrounds" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="h-4 w-4 rounded border" style={{ backgroundColor: `hsl(${currentColors.background})` }} />
                    <div className="h-4 w-4 rounded border" style={{ backgroundColor: `hsl(${currentColors.card})` }} />
                  </div>
                  <span className="font-medium">Backgrounds</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="grid grid-cols-2 gap-4">
                  <ColorInput colorKey="background" label="Background" />
                  <ColorInput colorKey="card" label="Card" />
                  <ColorInput colorKey="muted" label="Muted" />
                  <ColorInput colorKey="border" label="Border" />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="text" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <Type className="h-4 w-4" />
                  <span className="font-medium">Text Colors</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="grid grid-cols-2 gap-4">
                  <ColorInput colorKey="foreground" label="Foreground" />
                  <ColorInput colorKey="cardForeground" label="Card Text" />
                  <ColorInput colorKey="mutedForeground" label="Muted Text" />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="semantic" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: `hsl(${currentColors.destructive})` }} />
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: `hsl(${currentColors.success})` }} />
                  </div>
                  <span className="font-medium">Semantic Colors</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="grid grid-cols-2 gap-4">
                  <ColorInput colorKey="destructive" label="Destructive/Error" />
                  <ColorInput colorKey="success" label="Success" />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Font Families</CardTitle>
              <CardDescription>Choose your heading and body fonts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Heading Font</Label>
                  <Select 
                    value={typography.headingFont} 
                    onValueChange={(v) => setTypography({ ...typography, headingFont: v })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <div className="flex items-center gap-2">
                            <span style={{ fontFamily: font.value }}>{font.label}</span>
                            <Badge variant="secondary" className="text-xs">{font.style}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div 
                    className="p-4 rounded-lg bg-secondary/30 border"
                    style={{ fontFamily: typography.headingFont }}
                  >
                    <p className="text-2xl font-bold">Sample Heading</p>
                    <p className="text-lg">The quick brown fox</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Body Font</Label>
                  <Select 
                    value={typography.bodyFont} 
                    onValueChange={(v) => setTypography({ ...typography, bodyFont: v })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <div className="flex items-center gap-2">
                            <span style={{ fontFamily: font.value }}>{font.label}</span>
                            <Badge variant="secondary" className="text-xs">{font.style}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div 
                    className="p-4 rounded-lg bg-secondary/30 border"
                    style={{ fontFamily: typography.bodyFont }}
                  >
                    <p>This is a sample paragraph text.</p>
                    <p className="text-sm text-muted-foreground">Secondary text style</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Font Settings</CardTitle>
              <CardDescription>Adjust sizes, weights and spacing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Base Font Size</Label>
                  <Select 
                    value={typography.baseFontSize} 
                    onValueChange={(v) => setTypography({ ...typography, baseFontSize: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="14px">14px - Compact</SelectItem>
                      <SelectItem value="15px">15px - Small</SelectItem>
                      <SelectItem value="16px">16px - Default</SelectItem>
                      <SelectItem value="17px">17px - Medium</SelectItem>
                      <SelectItem value="18px">18px - Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Line Height</Label>
                  <Select 
                    value={typography.lineHeight} 
                    onValueChange={(v) => setTypography({ ...typography, lineHeight: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.4">1.4 - Tight</SelectItem>
                      <SelectItem value="1.5">1.5 - Normal</SelectItem>
                      <SelectItem value="1.6">1.6 - Relaxed</SelectItem>
                      <SelectItem value="1.75">1.75 - Loose</SelectItem>
                      <SelectItem value="2">2.0 - Double</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Heading Weight</Label>
                  <Select 
                    value={typography.headingWeight} 
                    onValueChange={(v) => setTypography({ ...typography, headingWeight: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="500">500 - Medium</SelectItem>
                      <SelectItem value="600">600 - Semibold</SelectItem>
                      <SelectItem value="700">700 - Bold</SelectItem>
                      <SelectItem value="800">800 - Extrabold</SelectItem>
                      <SelectItem value="900">900 - Black</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Body Weight</Label>
                  <Select 
                    value={typography.bodyWeight} 
                    onValueChange={(v) => setTypography({ ...typography, bodyWeight: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="300">300 - Light</SelectItem>
                      <SelectItem value="400">400 - Regular</SelectItem>
                      <SelectItem value="500">500 - Medium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Letter Spacing</Label>
                <Select 
                  value={typography.letterSpacing} 
                  onValueChange={(v) => setTypography({ ...typography, letterSpacing: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-0.025em">Tight (-0.025em)</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="0.025em">Wide (0.025em)</SelectItem>
                    <SelectItem value="0.05em">Wider (0.05em)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Site Identity</CardTitle>
              <CardDescription>Your brand name and tagline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Site Name</Label>
                  <Input
                    value={branding.siteName}
                    onChange={(e) => setBranding({ ...branding, siteName: e.target.value })}
                    placeholder="Your Site Name"
                    className="text-lg font-semibold"
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Logo Settings</CardTitle>
              <CardDescription>Configure your logo appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logo Type</Label>
                <Select 
                  value={branding.logoType} 
                  onValueChange={(v) => setBranding({ ...branding, logoType: v as 'text' | 'image' | 'both' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Only</SelectItem>
                    <SelectItem value="image">Image Only</SelectItem>
                    <SelectItem value="both">Image + Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(branding.logoType === 'image' || branding.logoType === 'both') && (
                <div className="space-y-2">
                  <Label>Logo Image URL</Label>
                  <Input
                    value={branding.logoUrl}
                    onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                  {branding.logoUrl && (
                    <div className="p-4 rounded-lg bg-secondary/30 border flex items-center justify-center">
                      <img 
                        src={branding.logoUrl} 
                        alt="Logo preview" 
                        className="max-h-16 object-contain"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Logo Size</Label>
                  <Select 
                    value={branding.logoSize} 
                    onValueChange={(v) => setBranding({ ...branding, logoSize: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Visual Style</CardTitle>
              <CardDescription>Border radius and shadow intensity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Border Radius</Label>
                  <Select 
                    value={branding.borderRadius} 
                    onValueChange={(v) => setBranding({ ...branding, borderRadius: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None (0)</SelectItem>
                      <SelectItem value="0.25rem">Small (0.25rem)</SelectItem>
                      <SelectItem value="0.5rem">Medium (0.5rem)</SelectItem>
                      <SelectItem value="0.75rem">Large (0.75rem)</SelectItem>
                      <SelectItem value="1rem">XL (1rem)</SelectItem>
                      <SelectItem value="1.5rem">2XL (1.5rem)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Shadow Intensity</Label>
                  <Select 
                    value={branding.shadowIntensity} 
                    onValueChange={(v) => setBranding({ ...branding, shadowIntensity: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="subtle">Subtle</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="strong">Strong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preview */}
              <div className="pt-4">
                <Label className="mb-3 block">Preview</Label>
                <div className="flex gap-4">
                  <div 
                    className={cn(
                      "p-4 border bg-card",
                      branding.shadowIntensity === 'subtle' && 'shadow-sm',
                      branding.shadowIntensity === 'medium' && 'shadow-md',
                      branding.shadowIntensity === 'strong' && 'shadow-lg'
                    )}
                    style={{ borderRadius: branding.borderRadius }}
                  >
                    <p className="font-medium">Card Preview</p>
                    <p className="text-sm text-muted-foreground">Sample content</p>
                  </div>
                  <button 
                    className={cn(
                      "px-6 py-3 bg-primary text-primary-foreground font-medium",
                      branding.shadowIntensity === 'subtle' && 'shadow-sm',
                      branding.shadowIntensity === 'medium' && 'shadow-md',
                      branding.shadowIntensity === 'strong' && 'shadow-lg'
                    )}
                    style={{ borderRadius: branding.borderRadius }}
                  >
                    Button Preview
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spacing Tab */}
        <TabsContent value="spacing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Layout Spacing</CardTitle>
              <CardDescription>Control the spacing throughout your site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Container Padding</Label>
                  <Select 
                    value={spacing.containerPadding} 
                    onValueChange={(v) => setSpacing({ ...spacing, containerPadding: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1rem">Compact (1rem)</SelectItem>
                      <SelectItem value="1.5rem">Default (1.5rem)</SelectItem>
                      <SelectItem value="2rem">Spacious (2rem)</SelectItem>
                      <SelectItem value="3rem">Wide (3rem)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Section Gap</Label>
                  <Select 
                    value={spacing.sectionGap} 
                    onValueChange={(v) => setSpacing({ ...spacing, sectionGap: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2rem">Tight (2rem)</SelectItem>
                      <SelectItem value="3rem">Default (3rem)</SelectItem>
                      <SelectItem value="4rem">Relaxed (4rem)</SelectItem>
                      <SelectItem value="5rem">Spacious (5rem)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Card Padding</Label>
                  <Select 
                    value={spacing.cardPadding} 
                    onValueChange={(v) => setSpacing({ ...spacing, cardPadding: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1rem">Compact (1rem)</SelectItem>
                      <SelectItem value="1.5rem">Default (1.5rem)</SelectItem>
                      <SelectItem value="2rem">Spacious (2rem)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Button Padding</Label>
                  <Select 
                    value={spacing.buttonPadding} 
                    onValueChange={(v) => setSpacing({ ...spacing, buttonPadding: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5rem 1rem">Compact</SelectItem>
                      <SelectItem value="0.75rem 1.5rem">Small</SelectItem>
                      <SelectItem value="1rem 2rem">Default</SelectItem>
                      <SelectItem value="1.25rem 2.5rem">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
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
            Save All Theme Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
