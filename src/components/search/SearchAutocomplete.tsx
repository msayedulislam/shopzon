import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, X, TrendingUp, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
  category_name: string | null;
}

interface SearchHistoryItem {
  id: string;
  query: string;
  created_at: string;
}

interface SearchAutocompleteProps {
  className?: string;
  inputClassName?: string;
  isCompact?: boolean;
}

export function SearchAutocomplete({ className, inputClassName, isCompact = false }: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch search history
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('search_history')
        .select('id, query, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (data) setHistory(data);
    };
    fetchHistory();
  }, [user]);

  // Search products with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select(`
          id, name, slug, price,
          images:product_images(image_url),
          category:categories(name)
        `)
        .eq('status', 'approved')
        .ilike('name', `%${query}%`)
        .limit(6);

      if (data) {
        setResults(data.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          image_url: p.images?.[0]?.image_url || null,
          category_name: p.category?.name || null
        })));
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveToHistory = async (searchQuery: string) => {
    if (!user || searchQuery.length < 2) return;
    await supabase
      .from('search_history')
      .upsert({ user_id: user.id, query: searchQuery }, { onConflict: 'user_id,query' })
      .select();
  };

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    saveToHistory(searchQuery);
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    setIsOpen(false);
    setQuery('');
  };

  const handleProductClick = (slug: string) => {
    saveToHistory(query);
    navigate(`/product/${slug}`);
    setIsOpen(false);
    setQuery('');
  };

  const handleClearHistory = async () => {
    if (!user) return;
    await supabase.from('search_history').delete().eq('user_id', user.id);
    setHistory([]);
  };

  const handleDeleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from('search_history').delete().eq('id', id);
    setHistory(h => h.filter(item => item.id !== id));
  };

  const showDropdown = isOpen && (query.length >= 2 || history.length > 0);

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search products, brands, categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch(query);
          }}
          className={cn(
            "pl-12 pr-4 rounded-2xl glass border-white/10 focus:border-primary/50 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground transition-all duration-500",
            isCompact ? "h-11" : "h-14",
            inputClassName
          )}
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
          {/* Search Results */}
          {query.length >= 2 && (
            <div>
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                </div>
              ) : results.length > 0 ? (
                <>
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" />
                    Products
                  </div>
                  {results.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product.slug)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category_name}</p>
                      </div>
                      <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => handleSearch(query)}
                    className="w-full px-3 py-3 text-sm text-primary hover:bg-primary/10 transition-colors border-t border-border font-medium"
                  >
                    View all results for "{query}"
                  </button>
                </>
              ) : (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No products found for "{query}"
                </div>
              )}
            </div>
          )}

          {/* Search History */}
          {query.length < 2 && history.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Recent Searches
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearHistory}
                  className="h-auto py-0 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              </div>
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSearch(item.query)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors group"
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-left text-sm">{item.query}</span>
                  <button
                    onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
