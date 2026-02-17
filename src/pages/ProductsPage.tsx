import { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Grid, List, ChevronDown, Loader2 } from 'lucide-react';
import { GovalyHeader } from '@/components/layout/GovalyHeader';
import { Footer } from '@/components/layout/Footer';
import { GovalyProductCard } from '@/components/product/GovalyProductCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { products as mockProducts, categories as mockCategories, formatPrice } from '@/data/mockData';
import { useProducts, useCategories, toDisplayProduct } from '@/hooks/useProducts';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileProductsPage } from '@/components/mobile/MobileProductsPage';

const brands = [
  { id: 'samsung', name: 'Samsung', count: 45 },
  { id: 'apple', name: 'Apple', count: 32 },
  { id: 'sony', name: 'Sony', count: 28 },
  { id: 'nike', name: 'Nike', count: 56 },
  { id: 'adidas', name: 'Adidas', count: 42 },
];

const ratings = [5, 4, 3, 2, 1];

export default function ProductsPage() {
  const isMobile = useIsMobile();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('popular');

  // Fetch products from database
  const { data: dbProducts, isLoading } = useProducts({ limit: 100 });
  const { data: dbCategories } = useCategories();

  // Use database products or fall back to mock
  const allProducts = useMemo(() => {
    if (dbProducts && dbProducts.length > 0) {
      return dbProducts.map(toDisplayProduct);
    }
    return mockProducts;
  }, [dbProducts]);

  const categories = dbCategories && dbCategories.length > 0
    ? dbCategories.map(c => ({ id: c.id, name: c.name, slug: c.slug, icon: c.icon || '📦', productCount: 0 }))
    : mockCategories;

  const category = categories.find((c) => c.slug === slug);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      if (slug && product.category.slug !== slug) return false;
      if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
      if (selectedBrands.length > 0 && product.brand && !selectedBrands.includes(product.brand.slug)) return false;
      if (selectedRating && product.rating < selectedRating) return false;
      return true;
    });
  }, [allProducts, slug, priceRange, selectedBrands, selectedRating]);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold">
          Price Range
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={0}
            max={200000}
            step={1000}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{formatPrice(priceRange[0])}</span>
            <span className="text-muted-foreground">{formatPrice(priceRange[1])}</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Brands */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold">
          Brands
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-3">
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
              <span className="flex-1 text-sm">{brand.name}</span>
              <span className="text-xs text-muted-foreground">({brand.count})</span>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Rating */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold">
          Rating
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-2">
          {ratings.map((rating) => (
            <button
              key={rating}
              onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
              className={`flex items-center gap-2 w-full p-2 rounded-lg transition-colors ${selectedRating === rating ? 'bg-primary/10' : 'hover:bg-secondary'
                }`}
            >
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${i < rating ? 'text-warning' : 'text-muted'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm">& Up</span>
            </button>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Other Filters */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold">
          Other Filters
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox />
            <span className="text-sm">Free Delivery</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox />
            <span className="text-sm">In Stock</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox />
            <span className="text-sm">On Sale</span>
          </label>
        </CollapsibleContent>
      </Collapsible>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setPriceRange([0, 200000]);
          setSelectedBrands([]);
          setSelectedRating(null);
        }}
      >
        Clear All Filters
      </Button>
    </div>
  );

  if (isMobile) {
    return <MobileProductsPage title={category ? category.name : 'All Products'} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <GovalyHeader />
      <main className="flex-1 bg-secondary/30">
        <div className="container py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <a href="/" className="hover:text-foreground">Home</a>
            <span>/</span>
            {category ? (
              <>
                <a href="/products" className="hover:text-foreground">Products</a>
                <span>/</span>
                <span className="text-foreground">{category.name}</span>
              </>
            ) : (
              <span className="text-foreground">All Products</span>
            )}
          </nav>

          <div className="flex gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="bg-card rounded-2xl p-6 shadow-sm sticky top-24">
                <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </h2>
                <FilterContent />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground">
                    {category ? category.name : 'All Products'}
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    {filteredProducts.length} products found
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Mobile Filter Button */}
                  <Sheet>
                    <SheetTrigger asChild className="lg:hidden">
                      <Button variant="outline" size="sm" className="gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px]">
                      <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                          <Filter className="h-5 w-5" />
                          Filters
                        </SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterContent />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Mode */}
                  <div className="hidden sm:flex items-center border rounded-lg">
                    <Button
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-9 w-9 rounded-r-none"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-9 w-9 rounded-l-none"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredProducts.length > 0 ? (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'
                      : 'space-y-4'
                  }
                >
                  {filteredProducts.map((product, index) => (
                    <GovalyProductCard
                      key={`prod-${product.id}-${index}`}
                      product={product}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-6xl mb-4">🔍</p>
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
