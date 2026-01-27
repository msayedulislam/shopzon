import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Filter, Package, Users, ShoppingBag, Store, FileText, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/mockData';

type SearchCategory = 'all' | 'products' | 'orders' | 'users' | 'sellers';

interface SearchResult {
  id: string;
  type: SearchCategory;
  title: string;
  subtitle: string;
  meta?: string;
  path: string;
}

export function AdminAdvancedSearch() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      const searchResults: SearchResult[] = [];

      try {
        // Search products
        if (category === 'all' || category === 'products') {
          const { data: products } = await supabase
            .from('products')
            .select('id, name, price, status, slug')
            .ilike('name', `%${query}%`)
            .limit(5);

          products?.forEach(p => {
            searchResults.push({
              id: p.id,
              type: 'products',
              title: p.name,
              subtitle: formatPrice(p.price),
              meta: p.status,
              path: `/admin/products?search=${p.id}`,
            });
          });
        }

        // Search orders
        if (category === 'all' || category === 'orders') {
          const { data: orders } = await supabase
            .from('orders')
            .select('id, order_number, total, status, shipping_name')
            .or(`order_number.ilike.%${query}%,shipping_name.ilike.%${query}%`)
            .limit(5);

          orders?.forEach(o => {
            searchResults.push({
              id: o.id,
              type: 'orders',
              title: o.order_number,
              subtitle: o.shipping_name,
              meta: o.status,
              path: `/admin/orders?search=${o.order_number}`,
            });
          });
        }

        // Search users
        if (category === 'all' || category === 'users') {
          const { data: users } = await supabase
            .from('profiles')
            .select('id, full_name, email, phone')
            .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
            .limit(5);

          users?.forEach(u => {
            searchResults.push({
              id: u.id,
              type: 'users',
              title: u.full_name || 'Unknown',
              subtitle: u.email || u.phone || '',
              path: `/admin/users?search=${u.id}`,
            });
          });
        }

        // Search sellers
        if (category === 'all' || category === 'sellers') {
          const { data: sellers } = await supabase
            .from('sellers')
            .select('id, shop_name, email, status')
            .or(`shop_name.ilike.%${query}%,email.ilike.%${query}%`)
            .limit(5);

          sellers?.forEach(s => {
            searchResults.push({
              id: s.id,
              type: 'sellers',
              title: s.shop_name,
              subtitle: s.email || '',
              meta: s.status,
              path: `/admin/sellers?search=${s.id}`,
            });
          });
        }

        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query, category]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    setIsOpen(false);
    setQuery('');
  };

  const getIcon = (type: SearchCategory) => {
    switch (type) {
      case 'products': return Package;
      case 'orders': return ShoppingBag;
      case 'users': return Users;
      case 'sellers': return Store;
      default: return FileText;
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      delivered: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      cancelled: 'bg-red-100 text-red-800',
      suspended: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <Button
        variant="outline"
        className="gap-2 text-muted-foreground"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Search everything...</span>
        <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="sr-only">Search</DialogTitle>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search products, orders, users, sellers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border-0 focus-visible:ring-0 text-lg"
                autoFocus
              />
              <Select value={category} onValueChange={(v) => setCategory(v as SearchCategory)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="products">Products</SelectItem>
                  <SelectItem value="orders">Orders</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="sellers">Sellers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DialogHeader>

          <div className="max-h-96 overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {query ? 'No results found' : 'Start typing to search...'}
              </div>
            ) : (
              <div className="space-y-1">
                {results.map((result) => {
                  const Icon = getIcon(result.type);
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelect(result)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left"
                    >
                      <div className="p-2 rounded-lg bg-secondary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{result.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                      </div>
                      {result.meta && (
                        <Badge className={getStatusColor(result.meta)} variant="secondary">
                          {result.meta}
                        </Badge>
                      )}
                      <Badge variant="outline" className="capitalize">
                        {result.type}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
