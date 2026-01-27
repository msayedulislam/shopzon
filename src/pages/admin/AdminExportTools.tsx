import { useState } from 'react';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Users, 
  Package, 
  ShoppingBag,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ExportJob {
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  fileName?: string;
}

export default function AdminExportTools() {
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(h => {
          const value = row[h];
          if (typeof value === 'object') return JSON.stringify(value);
          if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
          return value ?? '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const handleExport = async (type: string) => {
    const job: ExportJob = {
      type,
      status: 'processing',
      progress: 0,
    };
    
    setExportJobs(prev => [...prev, job]);
    const jobIndex = exportJobs.length;

    const updateProgress = (progress: number) => {
      setExportJobs(prev => prev.map((j, i) => 
        i === jobIndex ? { ...j, progress } : j
      ));
    };

    try {
      updateProgress(20);
      let data: any[] = [];
      let filename = '';

      switch (type) {
        case 'products': {
          const { data: products, error } = await supabase
            .from('products')
            .select('id, name, slug, price, original_price, stock, sold, status, created_at')
            .order('created_at', { ascending: false });
          if (error) throw error;
          data = products || [];
          filename = `products_${format(new Date(), 'yyyy-MM-dd')}.csv`;
          break;
        }
        case 'orders': {
          const { data: orders, error } = await supabase
            .from('orders')
            .select('id, order_number, total, status, payment_method, payment_status, shipping_city, created_at')
            .order('created_at', { ascending: false });
          if (error) throw error;
          data = orders || [];
          filename = `orders_${format(new Date(), 'yyyy-MM-dd')}.csv`;
          break;
        }
        case 'users': {
          const { data: profiles, error } = await supabase
            .from('profiles')
            .select('user_id, full_name, email, phone, created_at')
            .order('created_at', { ascending: false });
          if (error) throw error;
          data = profiles || [];
          filename = `users_${format(new Date(), 'yyyy-MM-dd')}.csv`;
          break;
        }
        case 'sellers': {
          const { data: sellers, error } = await supabase
            .from('sellers')
            .select('id, shop_name, email, phone, status, rating, total_sales, balance, created_at')
            .order('created_at', { ascending: false });
          if (error) throw error;
          data = sellers || [];
          filename = `sellers_${format(new Date(), 'yyyy-MM-dd')}.csv`;
          break;
        }
        case 'categories': {
          const { data: categories, error } = await supabase
            .from('categories')
            .select('id, name, slug, is_active, sort_order')
            .order('sort_order');
          if (error) throw error;
          data = categories || [];
          filename = `categories_${format(new Date(), 'yyyy-MM-dd')}.csv`;
          break;
        }
        case 'coupons': {
          const { data: coupons, error } = await supabase
            .from('coupons')
            .select('id, code, type, value, min_purchase, max_discount, usage_limit, used_count, is_active, expires_at');
          if (error) throw error;
          data = coupons || [];
          filename = `coupons_${format(new Date(), 'yyyy-MM-dd')}.csv`;
          break;
        }
      }

      updateProgress(80);

      exportToCSV(data, filename);
      
      setExportJobs(prev => prev.map((j, i) => 
        i === jobIndex ? { ...j, status: 'completed', progress: 100, fileName: filename } : j
      ));
      
      toast.success(`Exported ${data.length} records`);
    } catch (error) {
      setExportJobs(prev => prev.map((j, i) => 
        i === jobIndex ? { ...j, status: 'error', progress: 0 } : j
      ));
      toast.error('Export failed');
    }
  };

  const exportOptions = [
    { type: 'products', label: 'Products', icon: Package, description: 'Export all product data' },
    { type: 'orders', label: 'Orders', icon: ShoppingBag, description: 'Export order history' },
    { type: 'users', label: 'Users', icon: Users, description: 'Export customer profiles' },
    { type: 'sellers', label: 'Sellers', icon: Users, description: 'Export seller data' },
    { type: 'categories', label: 'Categories', icon: FileSpreadsheet, description: 'Export categories' },
    { type: 'coupons', label: 'Coupons', icon: FileSpreadsheet, description: 'Export coupon codes' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Export Tools</h1>
        <p className="text-muted-foreground">Export data to CSV for analysis and backup</p>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exportOptions.map((option) => (
          <Card key={option.type}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <option.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{option.label}</CardTitle>
                  <CardDescription className="text-xs">{option.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full gap-2"
                onClick={() => handleExport(option.type)}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Exports */}
      {exportJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Exports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exportJobs.map((job, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
                  <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{job.type}</span>
                      {job.status === 'processing' && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {job.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    {job.status === 'processing' && (
                      <Progress value={job.progress} className="h-1 mt-2" />
                    )}
                    {job.fileName && (
                      <p className="text-sm text-muted-foreground">{job.fileName}</p>
                    )}
                  </div>
                  <Badge variant={
                    job.status === 'completed' ? 'default' :
                    job.status === 'error' ? 'destructive' : 'secondary'
                  }>
                    {job.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Import data from CSV files (coming soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Drag and drop CSV files here or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Import functionality coming soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
