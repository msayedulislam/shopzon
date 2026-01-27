import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, X, TrendingUp, Package, Loader2, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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

const popularSearches = [
  'Headphones',
  'Smart Watch',
  'Laptop',
  'Camera',
  'Shoes',
  'T-Shirt',
  'Backpack',
  'Sunglasses'
];

export function SearchAutocomplete({ className, inputClassName, isCompact = false }: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<SearchResult[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch search history and recommended products on focus
  useEffect(() => {
    const fetchData = async () => {
      // Fetch search history
      if (user) {
        const { data: historyData } = await supabase
          .from('search_history')
          .select('id, query, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        if (historyData) setHistory(historyData);
      }

      // Fetch recommended/trending products
      const { data: products } = await supabase
        .from('products')
        .select(`
          id, name, slug, price,
          images:product_images(image_url),
          category:categories(name)
        `)
        .eq('status', 'approved')
        .eq('is_featured', true)
        .limit(6);

      if (products) {
        setRecommendedProducts(products.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          image_url: p.images?.[0]?.image_url || null,
          category_name: p.category?.name || null
        })));
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [user, isOpen]);

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
        .limit(8);

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

  const showDropdown = isOpen;

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
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 max-h-[500px] overflow-y-auto"
          >
            {/* Search Results */}
            {query.length >= 2 && (
              <div className="p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : results.length > 0 ? (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Products</span>
                    </div>
                    <div className="space-y-1">
                      {results.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleProductClick(product.slug)}
                          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
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
                    </div>
                    <button
                      onClick={() => handleSearch(query)}
                      className="w-full mt-3 py-3 text-sm text-primary bg-primary/10 rounded-xl font-medium hover:bg-primary/20 transition-colors"
                    >
                      View all results for "{query}"
                    </button>
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <Package className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No products found for "{query}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Initial State: History, Popular & Recommendations */}
            {query.length < 2 && (
              <div className="p-4 space-y-5">
                {/* Search History */}
                {history.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Recent Searches</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearHistory}
                        className="h-auto py-0 px-2 text-xs text-primary hover:text-primary/80"
                      >
                        Clear all
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {history.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSearch(item.query)}
                          className="group flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-full text-sm hover:bg-secondary/80 transition-colors"
                        >
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{item.query}</span>
                          <X
                            className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground"
                            onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Popular Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSearch(term)}
                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recommended Products */}
                {recommendedProducts.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Recommended For You</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {recommendedProducts.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleProductClick(product.slug)}
                          className="flex flex-col items-center p-3 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors"
                        >
                          <div className="w-16 h-16 rounded-lg bg-background overflow-hidden mb-2">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs font-medium text-center line-clamp-2">{product.name}</p>
                          <p className="text-xs font-bold text-primary mt-1">{formatPrice(product.price)}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
