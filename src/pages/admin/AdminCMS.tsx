import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, Type, Layout, FileText, Eye, Sparkles, PanelLeft, PanelRight, Monitor, Smartphone } from 'lucide-react';
import { ThemeEditor } from '@/components/admin/cms/ThemeEditor';
import { ContentEditor } from '@/components/admin/cms/ContentEditor';
import { LayoutEditor } from '@/components/admin/cms/LayoutEditor';
import { LivePreview } from '@/components/admin/cms/LivePreview';
import { cn } from '@/lib/utils';

export default function AdminCMS() {
  const [activeTab, setActiveTab] = useState('theme');
  const [previewKey, setPreviewKey] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const refreshPreview = () => {
    setPreviewKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Content Management System</h1>
              <p className="text-muted-foreground">
                Customize your site's appearance and content
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={showPreview ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="gap-2"
          >
            {showPreview ? <PanelRight className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/20">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Theme</p>
                <p className="font-semibold">Customizable</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-500/20">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pages</p>
                <p className="font-semibold">9 Editable</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-500/20">
                <Layout className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sections</p>
                <p className="font-semibold">12 Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-500/20">
                <Eye className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Preview</p>
                <p className="font-semibold">Real-time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={cn(
        "grid gap-6",
        showPreview ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1"
      )}>
        {/* Editor Panel */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 h-12">
              <TabsTrigger value="theme" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Theme</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Content</span>
              </TabsTrigger>
              <TabsTrigger value="layout" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Layout className="h-4 w-4" />
                <span className="hidden sm:inline">Layout</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="theme" className="mt-6">
              <ThemeEditor onUpdate={refreshPreview} />
            </TabsContent>

            <TabsContent value="content" className="mt-6">
              <ContentEditor onUpdate={refreshPreview} />
            </TabsContent>

            <TabsContent value="layout" className="mt-6">
              <LayoutEditor onUpdate={refreshPreview} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="hidden xl:block">
            <Card className="sticky top-6 overflow-hidden">
              <CardHeader className="pb-0 px-0 pt-0">
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Live Preview</CardTitle>
                    <Badge variant="secondary" className="text-xs">Real-time</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <LivePreview key={previewKey} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Mobile Preview Button */}
      {!showPreview && (
        <Card className="xl:hidden">
          <CardContent className="p-4">
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="h-4 w-4" />
              Open Live Preview
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
