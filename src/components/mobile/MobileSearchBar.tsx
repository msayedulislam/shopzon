import { useState, useEffect, useRef } from 'react';
import { Search, Camera, Clock, X, TrendingUp, Package, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/data/mockData';

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
}

const popularSearches = [
  'Headphones',
  'Smart Watch',
  'Laptop',
  'Camera',
  'Shoes',
  'T-Shirt'
];

export function MobileSearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<SearchResult[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch search history and recommended products on focus
  useEffect(() => {
    const fetchData = async () => {
      // Fetch search history
      if (user) {
        const { data: historyData } = await supabase
          .from('search_history')
          .select('id, query')
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
        .limit(4);

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

    if (isFocused) {
      fetchData();
    }
  }, [user, isFocused]);

  // Search products with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length < 2) {
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
        .ilike('name', `%${searchQuery}%`)
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
  }, [searchQuery]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveToHistory = async (query: string) => {
    if (!user || query.length < 2) return;
    await supabase
      .from('search_history')
      .upsert({ user_id: user.id, query }, { onConflict: 'user_id,query' })
      .select();
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    saveToHistory(query);
    navigate(`/products?search=${encodeURIComponent(query)}`);
    setIsFocused(false);
    setSearchQuery('');
  };

  const handleProductClick = (slug: string) => {
    saveToHistory(searchQuery);
    navigate(`/product/${slug}`);
    setIsFocused(false);
    setSearchQuery('');
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

  const showDropdown = isFocused;

  return (
    <div ref={wrapperRef} className="px-4 py-3 bg-white dark:bg-card relative z-50">
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(searchQuery); }}>
        <motion.div 
          className={`relative flex items-center rounded-xl transition-all duration-200 ${
            isFocused 
              ? 'bg-secondary ring-2 ring-primary/20' 
              : 'bg-secondary/60'
          }`}
          animate={{ scale: isFocused ? 1.01 : 1 }}
        >
          <Search className="absolute left-3.5 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Product"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className="w-full bg-transparent pl-10 pr-12 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button 
            type="button" 
            className="absolute right-3 p-1.5 rounded-lg hover:bg-secondary-foreground/10 transition-colors"
          >
            <Camera className="h-4.5 w-4.5 text-muted-foreground" />
          </button>
        </motion.div>
      </form>

      {/* Search Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full bg-white dark:bg-card border-t border-border shadow-xl z-50 max-h-[70vh] overflow-y-auto"
          >
            {/* Search Results */}
            {searchQuery.length >= 2 && (
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
                    <div className="space-y-2">
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
                      onClick={() => handleSearch(searchQuery)}
                      className="w-full mt-3 py-3 text-sm text-primary bg-primary/10 rounded-xl font-medium"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <Package className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No products found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Initial State: History, Popular & Recommendations */}
            {searchQuery.length < 2 && (
              <div className="p-4 space-y-5">
                {/* Search History */}
                {history.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Recent</span>
                      </div>
                      <button
                        onClick={handleClearHistory}
                        className="text-xs text-primary font-medium"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {history.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSearch(item.query)}
                          className="group flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-full text-sm"
                        >
                          <span>{item.query}</span>
                          <X
                            className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
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
                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
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
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Recommended</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
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
                          <p className="text-xs font-medium text-center line-clamp-1">{product.name}</p>
                          <p className="text-xs font-bold text-primary mt-0.5">{formatPrice(product.price)}</p>
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
