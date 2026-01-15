import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Newsletter Section */}
      <div className="bg-primary">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-display font-bold text-primary-foreground">
                Subscribe to Our Newsletter
              </h3>
              <p className="text-primary-foreground/80 text-sm mt-1">
                Get exclusive offers and updates delivered to your inbox
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 w-full md:w-80"
              />
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground shrink-0">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Contact */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">B</span>
              </div>
              <span className="font-display font-bold text-xl">BDMart</span>
            </Link>
            <p className="text-background/70 text-sm mb-4">
              Bangladesh's trusted online marketplace for quality products at the best prices.
            </p>
            <div className="space-y-2 text-sm">
              <a href="tel:+8801234567890" className="flex items-center gap-2 text-background/70 hover:text-background">
                <Phone className="h-4 w-4" />
                +880 1234-567890
              </a>
              <a href="mailto:support@bdmart.com" className="flex items-center gap-2 text-background/70 hover:text-background">
                <Mail className="h-4 w-4" />
                support@bdmart.com
              </a>
              <p className="flex items-center gap-2 text-background/70">
                <MapPin className="h-4 w-4" />
                Dhaka, Bangladesh
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-background/70 hover:text-background transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-background/70 hover:text-background transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-background/70 hover:text-background transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-background/70 hover:text-background transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-background/70 hover:text-background transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/track-order" className="text-background/70 hover:text-background transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-background/70 hover:text-background transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-background/70 hover:text-background transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/payment-methods" className="text-background/70 hover:text-background transition-colors">
                  Payment Methods
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-background/70 hover:text-background transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Policies</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy-policy" className="text-background/70 hover:text-background transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-background/70 hover:text-background transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-background/70 hover:text-background transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/seller-policy" className="text-background/70 hover:text-background transition-colors">
                  Seller Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods & Social */}
        <div className="mt-12 pt-8 border-t border-background/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-background/70">Payment Partners:</span>
              <div className="flex items-center gap-2">
                <div className="h-8 px-3 bg-background/10 rounded flex items-center justify-center text-xs font-medium">
                  bKash
                </div>
                <div className="h-8 px-3 bg-background/10 rounded flex items-center justify-center text-xs font-medium">
                  Nagad
                </div>
                <div className="h-8 px-3 bg-background/10 rounded flex items-center justify-center text-xs font-medium">
                  VISA
                </div>
                <div className="h-8 px-3 bg-background/10 rounded flex items-center justify-center text-xs font-medium">
                  MasterCard
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-background/70">Follow Us:</span>
              <div className="flex items-center gap-2">
                <a href="#" className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-sm text-background/50">
          <p>© 2024 BDMart. All rights reserved. Made with ❤️ in Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
