import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Type, Layout, Image, FileText, Eye } from 'lucide-react';
import { ThemeEditor } from '@/components/admin/cms/ThemeEditor';
import { ContentEditor } from '@/components/admin/cms/ContentEditor';
import { LayoutEditor } from '@/components/admin/cms/LayoutEditor';
import { LivePreview } from '@/components/admin/cms/LivePreview';

export default function AdminCMS() {
  const [activeTab, setActiveTab] = useState('theme');
  const [previewKey, setPreviewKey] = useState(0);

  const refreshPreview = () => {
    setPreviewKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content Management System</h1>
        <p className="text-muted-foreground">
          Edit all site content, styles, and layouts with live preview
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Editor Panel */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="theme" className="gap-2">
                <Palette className="h-4 w-4" />
                Theme
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-2">
                <FileText className="h-4 w-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="layout" className="gap-2">
                <Layout className="h-4 w-4" />
                Layout
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
        <div className="hidden xl:block">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                <CardTitle className="text-lg">Live Preview</CardTitle>
              </div>
              <CardDescription>See changes in real-time</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <LivePreview key={previewKey} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
