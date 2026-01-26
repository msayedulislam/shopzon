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
    <div className="min-h-screen bg-white dark:bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border/50 safe-area-top">
        <div className="flex items-center gap-3 h-14 px-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/60 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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

          {/* Filter Button */}
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <button className="p-2 relative">
                <SlidersHorizontal className="h-5 w-5 text-foreground" />
                {(selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 200000) && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
              <SheetHeader className="mb-6">
                <SheetTitle className="flex items-center justify-between">
                  <span>Filters</span>
                  <button onClick={clearFilters} className="text-sm text-primary font-normal">
                    Clear All
                  </button>
                </SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6 overflow-y-auto max-h-[calc(70vh-120px)]">
                {/* Price Range */}
                <div>
                  <h3 className="font-semibold mb-4">Price Range</h3>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={200000}
                    step={1000}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <h3 className="font-semibold mb-4">Brands</h3>
                  <div className="space-y-3">
                    {brands.map((brand) => (
                      <label key={brand.id} className="flex items-center gap-3 cursor-pointer">
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

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-card border-t">
                <Button 
                  onClick={() => setFilterOpen(false)} 
                  className="w-full rounded-full"
                >
                  Show {products.length} Results
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Results Count */}
      <div className="px-4 py-3 flex items-center justify-between bg-secondary/30">
        <span className="text-sm text-muted-foreground">
          {products.length} products found
        </span>
        <button className="flex items-center gap-1 text-sm font-medium">
          Sort by
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Products Grid */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-2.5">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-secondary/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-3 gap-2.5">
            {products.map((product, index) => (
              <MobileProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold mb-2">No products found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
}
