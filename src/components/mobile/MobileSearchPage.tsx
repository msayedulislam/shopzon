import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileProductCard } from './MobileProductCard';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileHeader } from './MobileHeader';
import { useProducts, useCategories, toDisplayProduct } from '@/hooks/useProducts';
import { products as mockProducts, formatPrice } from '@/data/mockData';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

const brands = [
  { id: 'samsung', name: 'Samsung' },
  { id: 'apple', name: 'Apple' },
  { id: 'sony', name: 'Sony' },
  { id: 'nike', name: 'Nike' },
  { id: 'adidas', name: 'Adidas' },
];

export function MobileSearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const { data: dbProducts, isLoading } = useProducts({ limit: 50 });

  const products = useMemo(() => {
    const allProducts = dbProducts && dbProducts.length > 0
      ? dbProducts.map(toDisplayProduct)
      : mockProducts;

    return allProducts.filter((product) => {
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
      if (selectedBrands.length > 0 && product.brand && !selectedBrands.includes(product.brand.slug)) return false;
      return true;
    });
  }, [dbProducts, searchQuery, priceRange, selectedBrands]);

  const clearFilters = () => {
    setPriceRange([0, 200000]);
    setSelectedBrands([]);
  };

  return (
    <div className="min-h-screen bg-secondary/30 dark:bg-background pb-16">
      {/* Standardized Govaly Header */}
      <MobileHeader
        title="Search"
        showBack
        showSearch={false} // We have a custom search input below
      />

      {/* Search Input Section - Matching Home Style */}
      <div className="bg-white dark:bg-card px-3 pb-3 border-b border-border/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for products, brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary/50 rounded-lg pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 border border-border/20"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Results Bar */}
      <div className="px-3 py-2 flex items-center justify-between bg-[#f8f8f8] border-b border-border/10">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          {products.length} Products Found
        </span>

        {/* Filter Button Integrated in results bar */}
        <div className="flex items-center gap-4">
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <button className="flex items-center gap-1.5 text-xs font-bold text-foreground relative">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filter
                {(selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 200000) && (
                  <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[65vh] rounded-t-2xl p-0">
              <div className="p-4 border-b">
                <SheetHeader>
                  <SheetTitle className="flex items-center justify-between">
                    <span className="text-base font-bold">Filters</span>
                    <button onClick={clearFilters} className="text-xs text-primary font-bold">
                      Clear All
                    </button>
                  </SheetTitle>
                </SheetHeader>
              </div>

              <div className="p-4 space-y-6 overflow-y-auto h-[calc(65vh-150px)]">
                {/* Price Range */}
                <div>
                  <h3 className="font-bold text-sm mb-4">Price Range</h3>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={200000}
                    step={1000}
                    className="text-primary"
                  />
                  <div className="flex justify-between text-xs font-bold text-muted-foreground mt-3">
                    <span className="bg-secondary/50 px-2 py-1 rounded">{formatPrice(priceRange[0])}</span>
                    <span className="bg-secondary/50 px-2 py-1 rounded">{formatPrice(priceRange[1])}</span>
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <h3 className="font-bold text-sm mb-4">Brands</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {brands.map((brand) => (
                      <label key={brand.id} className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all cursor-pointer ${selectedBrands.includes(brand.id) ? 'border-primary bg-primary/5' : 'border-border/50'
                        }`}>
                        <Checkbox
                          checked={selectedBrands.includes(brand.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedBrands([...selectedBrands, brand.id]);
                            } else {
                              setSelectedBrands(selectedBrands.filter((b) => b !== brand.id));
                            }
                          }}
                        />
                        <span className="text-xs font-semibold">{brand.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-card border-t shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <Button
                  onClick={() => setFilterOpen(false)}
                  className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90 text-white font-bold"
                >
                  Apply Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <button className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
            Sort
          </button>
        </div>
      </div>

      <div className="p-3">
        {isLoading ? (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-white dark:bg-card rounded-lg animate-pulse border border-border/20" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
            {products.map((product, index) => (
              <MobileProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-card rounded-lg">
            <Search className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="font-semibold text-sm mb-1">No products found</h3>
            <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
}
