import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileProductCard } from './MobileProductCard';
import { MobileBottomNav } from './MobileBottomNav';
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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border/30 safe-area-top">
        <div className="flex items-center gap-2 h-12 px-3">
          <button onClick={() => navigate(-1)} className="p-1.5 -ml-1">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/50 rounded-lg pl-8 pr-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Filter Button */}
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <button className="p-1.5 relative">
                <SlidersHorizontal className="h-5 w-5 text-foreground" />
                {(selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 200000) && (
                  <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[65vh] rounded-t-2xl">
              <SheetHeader className="mb-4">
                <SheetTitle className="flex items-center justify-between">
                  <span className="text-base">Filters</span>
                  <button onClick={clearFilters} className="text-xs text-primary font-normal">
                    Clear All
                  </button>
                </SheetTitle>
              </SheetHeader>
              
              <div className="space-y-5 overflow-y-auto max-h-[calc(65vh-100px)]">
                {/* Price Range */}
                <div>
                  <h3 className="font-semibold text-sm mb-3">Price Range</h3>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={200000}
                    step={1000}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <h3 className="font-semibold text-sm mb-3">Brands</h3>
                  <div className="space-y-2.5">
                    {brands.map((brand) => (
                      <label key={brand.id} className="flex items-center gap-2.5 cursor-pointer">
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
                        <span className="text-sm">{brand.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3 bg-white dark:bg-card border-t">
                <Button 
                  onClick={() => setFilterOpen(false)} 
                  className="w-full rounded-lg h-10"
                >
                  Show {products.length} Results
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Results Count */}
      <div className="px-3 py-2 flex items-center justify-between bg-white dark:bg-card border-b border-border/20">
        <span className="text-xs text-muted-foreground">
          {products.length} products
        </span>
        <button className="flex items-center gap-1 text-xs font-medium">
          Sort
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Products Grid - 3 columns */}
      <div className="p-2">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-1.5">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-white dark:bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-3 gap-1.5">
            {products.map((product, index) => (
              <MobileProductCard key={product.id} product={product} index={index} variant="square" />
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
