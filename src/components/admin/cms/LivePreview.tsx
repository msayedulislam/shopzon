import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, Monitor, Tablet, ExternalLink, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const viewportSizes = [
  { id: 'mobile', icon: Smartphone, width: 375, label: 'Mobile' },
  { id: 'tablet', icon: Tablet, width: 768, label: 'Tablet' },
  { id: 'desktop', icon: Monitor, width: '100%', label: 'Desktop' },
];

export function LivePreview() {
  const [viewport, setViewport] = useState('desktop');
  const [key, setKey] = useState(0);

  const currentViewport = viewportSizes.find((v) => v.id === viewport);

  const handleRefresh = () => {
    setKey(prev => prev + 1);
  };

  const handleOpenInNewTab = () => {
    window.open('/', '_blank');
  };

  return (
    <div className="flex flex-col">
      {/* Viewport Controls */}
      <div className="flex items-center justify-between p-3 border-b bg-secondary/30">
        <div className="flex gap-1">
          {viewportSizes.map((size) => (
            <Button
              key={size.id}
              variant={viewport === size.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewport(size.id)}
              className="gap-2"
            >
              <size.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{size.label}</span>
            </Button>
          ))}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleOpenInNewTab}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex justify-center p-4 bg-secondary/20 min-h-[600px]">
        <div
          className={cn(
            'bg-background rounded-lg overflow-hidden shadow-lg transition-all duration-300',
            viewport === 'mobile' && 'w-[375px]',
            viewport === 'tablet' && 'w-[768px]',
            viewport === 'desktop' && 'w-full'
          )}
          style={{
            maxWidth: typeof currentViewport?.width === 'number' ? currentViewport.width : undefined,
          }}
        >
          <iframe
            key={key}
            src="/"
            className="w-full h-[600px] border-0"
            title="Site Preview"
          />
        </div>
      </div>
    </div>
  );
}
