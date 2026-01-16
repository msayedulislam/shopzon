import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, MapPin, Phone, ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { categories } from '@/data/mockData';
import { useCart } from '@/hooks/useCart';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground py-2.5 relative overflow-hidden">
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

      {/* Main Header */}
      <div className="glass-strong border-b border-white/5">
        <div className="container py-4">
          <div className="flex items-center gap-4">
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
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-glow">
                      <span className="text-primary-foreground font-bold text-2xl">B</span>
                    </div>
                    <span className="font-bold text-2xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>BDMart</span>
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
                        <span className="text-3xl">{category.icon}</span>
                        <span className="font-medium text-foreground">{category.name}</span>
                      </Link>
                    ))}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-glow group-hover:shadow-accent transition-shadow duration-500">
                <span className="text-primary-foreground font-bold text-2xl">B</span>
              </div>
              <span className="font-bold text-2xl hidden sm:block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <span className="text-gradient">BD</span>Mart
              </span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="search"
                  placeholder="Search products, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-14 rounded-2xl glass border-white/10 focus:border-primary/50 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground transition-all duration-300"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="relative h-12 w-12 rounded-2xl hover:bg-white/10 transition-all duration-300">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative h-12 w-12 rounded-2xl hover:bg-white/10 transition-all duration-300">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs font-bold shadow-glow">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-white/10 transition-all duration-300">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-card border-white/10 rounded-2xl p-2">
                  <DropdownMenuItem asChild className="rounded-xl hover:bg-white/10 cursor-pointer p-3">
                    <Link to="/login" className="flex items-center gap-3">
                      <span>🔐</span> Login
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl hover:bg-white/10 cursor-pointer p-3">
                    <Link to="/register" className="flex items-center gap-3">
                      <span>✨</span> Register
                    </Link>
                  </DropdownMenuItem>
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
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Navigation */}
      <nav className="hidden lg:block glass border-b border-white/5">
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
              <DropdownMenuContent align="start" className="w-72 glass-card border-white/10 rounded-2xl p-2">
                {categories.map((category) => (
                  <DropdownMenuItem key={category.id} asChild className="rounded-xl hover:bg-white/10 cursor-pointer p-3">
                    <Link to={`/category/${category.slug}`} className="flex items-center gap-4">
                      <span className="text-2xl">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                      <span className="ml-auto text-muted-foreground text-sm">
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
  );
}