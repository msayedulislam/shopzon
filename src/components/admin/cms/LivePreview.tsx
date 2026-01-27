import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Monitor, 
  Tablet, 
  ExternalLink, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const viewportSizes = [
  { id: 'mobile', icon: Smartphone, width: 375, height: 812, label: 'Mobile' },
  { id: 'tablet', icon: Tablet, width: 768, height: 1024, label: 'Tablet' },
  { id: 'desktop', icon: Monitor, width: 1440, height: 900, label: 'Desktop' },
];

const popularDevices = [
  { name: 'iPhone 14', width: 390, height: 844 },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
  { name: 'Samsung Galaxy S23', width: 360, height: 780 },
  { name: 'iPad Air', width: 820, height: 1180 },
  { name: 'iPad Pro 12.9"', width: 1024, height: 1366 },
  { name: 'MacBook Pro 14"', width: 1512, height: 982 },
  { name: 'iMac 27"', width: 2560, height: 1440 },
];

export function LivePreview() {
  const [viewport, setViewport] = useState('desktop');
  const [key, setKey] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [customWidth, setCustomWidth] = useState(1440);
  const [customHeight, setCustomHeight] = useState(900);
  const [isRotated, setIsRotated] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentViewport = viewportSizes.find((v) => v.id === viewport);

  const handleRefresh = () => {
    setKey(prev => prev + 1);
  };

  const handleOpenInNewTab = () => {
    window.open('/', '_blank');
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 150));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleRotate = () => {
    setIsRotated(!isRotated);
  };

  const getPreviewDimensions = () => {
    if (viewport === 'custom') {
      return isRotated 
        ? { width: customHeight, height: customWidth }
        : { width: customWidth, height: customHeight };
    }
    
    const size = currentViewport || viewportSizes[2];
    return isRotated 
      ? { width: size.height, height: size.width }
      : { width: size.width, height: size.height };
  };

  const dimensions = getPreviewDimensions();

  const getPreviewUrl = () => {
    const baseUrl = '/';
    const params = new URLSearchParams();
    
    if (previewTheme !== 'system') {
      params.set('theme', previewTheme);
    }
    
    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col bg-background">
      {/* Controls Bar */}
      <div className="flex items-center justify-between p-3 border-b bg-secondary/30">
        <div className="flex items-center gap-2">
          {/* Viewport Selector */}
          <div className="flex gap-1 p-1 rounded-lg bg-background border">
            {viewportSizes.map((size) => (
              <Button
                key={size.id}
                variant={viewport === size.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setViewport(size.id);
                  setIsRotated(false);
                }}
                className="gap-1.5 h-8"
              >
                <size.icon className="h-4 w-4" />
                <span className="hidden lg:inline text-xs">{size.label}</span>
              </Button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Rotate */}
          {viewport !== 'desktop' && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRotate}
              className={cn("h-8 w-8", isRotated && "bg-primary/10 text-primary")}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}

          {/* Dimensions Display */}
          <Badge variant="outline" className="font-mono text-xs">
            {dimensions.width} × {dimensions.height}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <div className="flex gap-0.5 p-0.5 rounded-md bg-background border">
            <Button
              variant={previewTheme === 'light' ? 'default' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setPreviewTheme('light')}
            >
              <Sun className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={previewTheme === 'dark' ? 'default' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setPreviewTheme('dark')}
            >
              <Moon className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 min-w-[4rem] font-mono text-xs"
              onClick={handleResetZoom}
            >
              {zoom}%
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Action Buttons */}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenInNewTab}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Frame */}
      <div 
        className={cn(
          "flex justify-center items-start p-6 bg-secondary/20 overflow-auto",
          isFullscreen ? "min-h-screen" : "min-h-[600px]"
        )}
        style={{
          backgroundImage: `
            linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%),
            linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%),
            linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        }}
      >
        <div
          className={cn(
            "relative transition-all duration-300 ease-out",
            viewport === 'mobile' && "rounded-[2.5rem]",
            viewport === 'tablet' && "rounded-[1.5rem]",
            viewport !== 'desktop' && "shadow-2xl ring-4 ring-foreground/10"
          )}
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
          }}
        >
          {/* Device Frame for Mobile/Tablet */}
          {viewport !== 'desktop' && (
            <div 
              className={cn(
                "absolute inset-0 pointer-events-none",
                viewport === 'mobile' && "bg-foreground/90 rounded-[2.5rem] p-3",
                viewport === 'tablet' && "bg-foreground/90 rounded-[1.5rem] p-2"
              )}
              style={{
                padding: viewport === 'mobile' ? '12px' : '8px',
                background: 'linear-gradient(145deg, hsl(var(--foreground) / 0.9), hsl(var(--foreground) / 0.7))'
              }}
            >
              {/* Notch for mobile */}
              {viewport === 'mobile' && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-foreground rounded-full" />
              )}
            </div>
          )}

          <div
            className={cn(
              "bg-background overflow-hidden transition-all duration-300",
              viewport === 'mobile' && "rounded-[2rem] m-3",
              viewport === 'tablet' && "rounded-xl m-2",
              viewport === 'desktop' && "rounded-lg shadow-lg ring-1 ring-border"
            )}
            style={{
              width: dimensions.width,
              height: isFullscreen ? 'calc(100vh - 120px)' : Math.min(dimensions.height, 700),
            }}
          >
            <iframe
              ref={iframeRef}
              key={key}
              src={getPreviewUrl()}
              className="w-full h-full border-0"
              title="Site Preview"
              style={{
                colorScheme: previewTheme === 'system' ? 'normal' : previewTheme,
              }}
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t bg-secondary/30 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            <span>Live Preview</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <span className="font-mono">
            {dimensions.width}×{dimensions.height} @ {zoom}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {viewport === 'mobile' ? 'Mobile View' : viewport === 'tablet' ? 'Tablet View' : 'Desktop View'}
          </Badge>
          {previewTheme !== 'system' && (
            <Badge variant="secondary" className="text-xs capitalize">
              {previewTheme} Mode
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
