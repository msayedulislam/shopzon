import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Heart, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Newsletter Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

        <div className="container relative py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Subscribe to Our Newsletter
              </h3>
              <p className="text-primary-foreground/80">
                Get exclusive offers and updates delivered to your inbox
              </p>
            </div>
            <div className="flex w-full lg:w-auto gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-14 rounded-2xl bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/60 w-full lg:w-96 focus:border-white/40"
              />
              <Button className="h-14 px-8 rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shrink-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                Subscribe
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-background border-t border-white/5">
        <div className="container py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand & Contact */}
            <div>
              <Link to="/" className="flex items-center gap-3 mb-6 group">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-glow group-hover:shadow-accent transition-shadow duration-500">
                  <span className="text-primary-foreground font-black text-2xl tracking-tighter italic">G</span>
                </div>
                <span className="font-bold text-2xl uppercase italic tracking-tighter">
                  <span className="text-primary">GOV</span>ALY
                </span>
              </Link>
              <p className="text-sm font-semibold text-muted-foreground mb-6 leading-relaxed">
                Govaly: Bangladesh's premium online marketplace for high-density quality products at unbeatable prices.
              </p>
              <div className="space-y-3">
                <a href="tel:+8801234567890" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors duration-300">
                  <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                    <Phone className="h-4 w-4" />
                  </div>
                  +880 1234-567890
                </a>
                <a href="mailto:support@govaly.com.bd" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors duration-300">
                  <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                    <Mail className="h-4 w-4" />
                  </div>
                  support@govaly.com.bd
                </a>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                    <MapPin className="h-4 w-4" />
                  </div>
                  Dhaka, Bangladesh
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-foreground">Quick Links</h4>
              <ul className="space-y-3">
                {['About Us', 'Contact Us', 'Careers', 'Blog', 'FAQs'].map((item) => (
                  <li key={item}>
                    <Link
                      to={`/${item.toLowerCase().replace(' ', '-')}`}
                      className="text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-foreground">Customer Service</h4>
              <ul className="space-y-3">
                {['Track Order', 'Returns & Exchanges', 'Shipping Info', 'Payment Methods', 'Help Center'].map((item) => (
                  <li key={item}>
                    <Link
                      to={`/${item.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                      className="text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Policies */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-foreground">Policies</h4>
              <ul className="space-y-3">
                {['Privacy Policy', 'Terms & Conditions', 'Refund Policy', 'Seller Policy'].map((item) => (
                  <li key={item}>
                    <Link
                      to={`/${item.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                      className="text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Payment Methods & Social */}
          <div className="mt-16 pt-8 border-t border-white/5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm text-muted-foreground">Payment Partners:</span>
                <div className="flex items-center gap-3">
                  {['bKash', 'Nagad', 'VISA', 'MasterCard'].map((partner) => (
                    <div key={partner} className="h-10 px-4 glass rounded-xl flex items-center justify-center text-xs font-bold text-foreground">
                      {partner}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Follow Us:</span>
                <div className="flex items-center gap-3">
                  {[
                    { icon: Facebook, href: '#' },
                    { icon: Instagram, href: '#' },
                    { icon: Twitter, href: '#' },
                    { icon: Youtube, href: '#' },
                  ].map(({ icon: Icon, href }, index) => (
                    <a
                      key={index}
                      href={href}
                      className="h-11 w-11 rounded-xl glass flex items-center justify-center hover:bg-primary/20 hover:border-primary/30 transition-all duration-300 group"
                    >
                      <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-10 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <p className="flex items-center justify-center gap-2">
              © 2026 GOVALY. All rights reserved. Developed BY GOVALY TECH
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
