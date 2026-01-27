import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Menu, MapPin, Phone, ChevronDown, Sparkles, ChevronUp, LogOut } from 'lucide-react';
import jhuriLogo from '@/assets/jhuri-logo.png';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { categories as mockCategories } from '@/data/mockData';
import { useCategories } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SearchAutocomplete } from '@/components/search/SearchAutocomplete';

export function Header() {
  const { items } = useCart();
  const { user, signOut, isApprovedSeller, isAdmin } = useAuth();
  const navigate = useNavigate();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Fetch categories from database, fall back to mock data
  const { data: dbCategories } = useCategories();
  const categories = dbCategories && dbCategories.length > 0 
    ? dbCategories.map(c => ({ id: c.id, name: c.name, slug: c.slug, icon: c.icon || '📦', productCount: 0 }))
    : mockCategories;
  
  // Scroll state - header always visible now
  const [isAtTop, setIsAtTop] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsAtTop(currentScrollY < 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-out ${
          !isAtTop ? 'shadow-xl' : ''
        }`}
      >
        {/* Top Bar - Collapses when scrolled */}
        <div 
          className={`bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground relative overflow-hidden transition-all duration-500 ${
            isAtTop ? 'py-2.5 opacity-100' : 'py-0 h-0 opacity-0'
          }`}
        >
          {/* Animated Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          
          <div className="container relative flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 font-medium">
                <Phone className="h-3.5 w-3.5" />
                +880 1234-567890
              </span>
              <span className="hidden sm:flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                Dhaka, Bangladesh
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/seller/register" className="hover:underline font-medium flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Become a Seller
              </Link>
              <Link to="/track-order" className="hover:underline hidden sm:block font-medium">
                Track Order
              </Link>
            </div>
          </div>
        </div>

        {/* Main Header - Compact height */}
        <div className={`glass-strong border-b border-white/5 backdrop-blur-xl transition-all duration-300 ${
          !isAtTop ? 'bg-background/98 dark:bg-background/98' : ''
        }`}>
          <div className="container" style={{ overflow: 'visible' }}>
            <div className="flex items-center gap-4 py-2" style={{ overflow: 'visible' }}>
              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="hover:bg-white/10">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] p-0 glass-dark border-r border-white/10">
                  <div className="p-6 border-b border-white/10">
                    <Link to="/" className="flex items-center gap-3">
                      <img src={jhuriLogo} alt="Jhuri" className="h-10 w-10 object-contain rounded-xl" />
                      <span className="font-bold text-2xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Jhuri</span>
                    </Link>
                  </div>
                  <nav className="p-4">
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          to={`/category/${category.slug}`}
                          className="flex items-center gap-4 p-4 rounded-2xl glass transition-all duration-300 hover:bg-primary/10 hover:border-primary/30"
                        >
                          <span className="font-medium text-foreground">{category.name}</span>
                        </Link>
                      ))}
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>

              {/* Logo - Compact size */}
              <Link to="/" className="flex items-center gap-2 shrink-0 group">
                <img src={jhuriLogo} alt="Jhuri" className="h-9 w-9 object-contain rounded-xl group-hover:scale-110 transition-transform duration-300" />
                <span className="font-bold text-lg hidden sm:block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <span className="text-gradient">Jhu</span>ri
                </span>
              </Link>

              {/* Search Bar with Autocomplete */}
              <SearchAutocomplete 
                className="flex-1 max-w-2xl"
                isCompact={true}
              />

              {/* Action Buttons - Compact size */}
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <Link to="/wishlist">
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300">
                    <Heart className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/cart">
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300">
                    <ShoppingCart className="h-4 w-4" />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-[10px] font-bold shadow-glow">
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/10 transition-all duration-300">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass-card border-white/10 rounded-2xl p-2">
                    {!user ? (
                      <>
                        <DropdownMenuItem asChild className="rounded-xl hover:bg-white/10 cursor-pointer p-3">
                          <Link to="/auth?mode=login" className="flex items-center gap-3">
                            <span>🔐</span> Login
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-xl hover:bg-white/10 cursor-pointer p-3">
                          <Link to="/auth?mode=register" className="flex items-center gap-3">
                            <span>✨</span> Register
                          </Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild className="rounded-xl hover:bg-white/10 cursor-pointer p-3">
                          <Link to="/dashboard" className="flex items-center gap-3">
                            <span>👤</span> My Account
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-xl hover:bg-white/10 cursor-pointer p-3">
                          <Link to="/dashboard/orders" className="flex items-center gap-3">
                            <span>📦</span> My Orders
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-xl hover:bg-white/10 cursor-pointer p-3">
                          <Link to="/dashboard/wishlist" className="flex items-center gap-3">
                            <span>❤️</span> My Wishlist
                          </Link>
                        </DropdownMenuItem>
                        {isApprovedSeller && (
                          <>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem asChild className="rounded-xl hover:bg-primary/10 cursor-pointer p-3">
                              <Link to="/seller/dashboard" className="flex items-center gap-3 text-primary">
                                <span>🏪</span> Seller Dashboard
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}
                        {isAdmin && (
                          <DropdownMenuItem asChild className="rounded-xl hover:bg-primary/10 cursor-pointer p-3">
                            <Link to="/admin" className="flex items-center gap-3 text-primary">
                              <span>⚙️</span> Admin Panel
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem 
                          onClick={handleSignOut}
                          className="rounded-xl hover:bg-destructive/10 cursor-pointer p-3 text-destructive"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Navigation - Hides when scrolled */}
        <nav className={`hidden lg:block glass border-b border-white/5 transition-all duration-500 overflow-hidden ${
          isAtTop ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="container">
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 font-semibold h-14 px-6 rounded-none hover:bg-white/10 transition-all duration-300">
                    <Menu className="h-4 w-4" />
                    All Categories
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 glass-card border-white/10 rounded-2xl p-2">
                  {categories.map((category) => (
                    <DropdownMenuItem key={category.id} asChild className="rounded-xl hover:bg-white/10 cursor-pointer p-3">
                      <Link to={`/category/${category.slug}`} className="flex items-center justify-between">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-muted-foreground text-sm">
                          {category.productCount}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="px-5 py-4 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  {category.name}
                </Link>
              ))}
              
              <Link
                to="/flash-sale"
                className="px-5 py-4 text-sm font-bold text-gradient flex items-center gap-2 animate-pulse"
              >
                🔥 Flash Sale
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Spacer for fixed header */}
      <div className={`transition-all duration-300 ${isAtTop ? 'h-[140px]' : 'h-[52px]'}`} />

      {/* Floating button to scroll to top / show header */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-glow flex items-center justify-center transition-all duration-500 hover:scale-110 ${
          !isAtTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ChevronUp className="h-6 w-6" />
      </button>
    </>
  );
}
