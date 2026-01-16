import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Home, FileText, Phone, Mail, MapPin, Clock, Users, Package, Truck, CreditCard, HelpCircle, Shield, BookOpen, Briefcase, MessageSquare, Search, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface StaticPageData {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  meta_title: string | null;
  meta_description: string | null;
  hero_image: string | null;
}

const pageIcons: Record<string, React.ReactNode> = {
  'about-us': <Users className="h-8 w-8" />,
  'contact-us': <Phone className="h-8 w-8" />,
  'careers': <Briefcase className="h-8 w-8" />,
  'blog': <BookOpen className="h-8 w-8" />,
  'faqs': <HelpCircle className="h-8 w-8" />,
  'privacy-policy': <Shield className="h-8 w-8" />,
  'terms-conditions': <FileText className="h-8 w-8" />,
  'track-order': <Search className="h-8 w-8" />,
  'returns-exchanges': <Package className="h-8 w-8" />,
  'refund-policy': <CreditCard className="h-8 w-8" />,
  'shipping-info': <Truck className="h-8 w-8" />,
  'seller-policy': <Users className="h-8 w-8" />,
  'payment-methods': <CreditCard className="h-8 w-8" />,
  'help-center': <MessageSquare className="h-8 w-8" />,
};

const pageColors: Record<string, string> = {
  'about-us': 'from-blue-500 to-indigo-600',
  'contact-us': 'from-emerald-500 to-teal-600',
  'careers': 'from-purple-500 to-violet-600',
  'blog': 'from-orange-500 to-amber-600',
  'faqs': 'from-cyan-500 to-blue-600',
  'privacy-policy': 'from-slate-500 to-gray-600',
  'terms-conditions': 'from-slate-600 to-zinc-700',
  'track-order': 'from-green-500 to-emerald-600',
  'returns-exchanges': 'from-rose-500 to-pink-600',
  'refund-policy': 'from-amber-500 to-orange-600',
  'shipping-info': 'from-sky-500 to-blue-600',
  'seller-policy': 'from-indigo-500 to-purple-600',
  'payment-methods': 'from-teal-500 to-cyan-600',
  'help-center': 'from-violet-500 to-purple-600',
};

export default function StaticPage() {
  const location = useLocation();
  const slug = location.pathname.substring(1); // Remove leading slash
  const [page, setPage] = useState<StaticPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderNumber, setOrderNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    async function fetchPage() {
      if (!slug) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('static_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching page:', error);
      }
      setPage(data);
      setLoading(false);
    }

    fetchPage();
  }, [slug]);

  useEffect(() => {
    if (page?.meta_title) {
      document.title = page.meta_title;
    }
  }, [page]);

  const renderMarkdown = (content: string) => {
    // Simple markdown parser
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let inList = false;
    let listItems: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    lines.forEach((line, index) => {
      // Handle tables
      if (line.startsWith('|') && line.endsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        const cells = line.split('|').filter(cell => cell.trim() !== '' && !cell.includes('---'));
        if (cells.length > 0 && !line.includes('---')) {
          tableRows.push(cells.map(c => c.trim()));
        }
        return;
      } else if (inTable) {
        inTable = false;
        if (tableRows.length > 0) {
          elements.push(
            <div key={`table-${index}`} className="overflow-x-auto my-6">
              <table className="min-w-full divide-y divide-border rounded-lg overflow-hidden">
                <thead className="bg-muted">
                  <tr>
                    {tableRows[0].map((cell, i) => (
                      <th key={i} className="px-4 py-3 text-left text-sm font-semibold text-foreground">{cell}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tableRows.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-muted/50 transition-colors">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-3 text-sm text-muted-foreground">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        tableRows = [];
      }

      // Handle list items
      if (line.startsWith('- ')) {
        if (!inList) {
          inList = true;
          listItems = [];
        }
        listItems.push(line.substring(2));
        return;
      } else if (inList && line.trim() !== '') {
        inList = false;
        elements.push(
          <ul key={`list-${index}`} className="my-4 space-y-2">
            {listItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-muted-foreground">
                <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>{formatText(item)}</span>
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }

      // H1
      if (line.startsWith('# ')) {
        return; // Skip H1 as we show it in hero
      }
      // H2
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-2xl font-bold text-foreground mt-10 mb-4 flex items-center gap-3">
            <div className="w-1 h-8 bg-primary rounded-full" />
            {line.substring(3)}
          </h2>
        );
        return;
      }
      // H3
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-xl font-semibold text-foreground mt-6 mb-3">{line.substring(4)}</h3>
        );
        return;
      }
      // Empty line
      if (line.trim() === '') {
        return;
      }
      // Q&A format
      if (line.startsWith('**Q:')) {
        elements.push(
          <div key={index} className="bg-muted/50 rounded-xl p-4 mt-4 border border-border">
            <p className="font-semibold text-foreground">{formatText(line)}</p>
          </div>
        );
        return;
      }
      if (line.startsWith('A:')) {
        elements.push(
          <p key={index} className="text-muted-foreground pl-4 mb-4">{formatText(line)}</p>
        );
        return;
      }
      // Regular paragraph
      elements.push(
        <p key={index} className="text-muted-foreground leading-relaxed my-3">{formatText(line)}</p>
      );
    });

    // Handle remaining list items
    if (listItems.length > 0) {
      elements.push(
        <ul key="list-end" className="my-4 space-y-2">
          {listItems.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-muted-foreground">
              <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span>{formatText(item)}</span>
            </li>
          ))}
        </ul>
      );
    }

    return elements;
  };

  const formatText = (text: string) => {
    // Handle bold text
    return text.split(/\*\*(.*?)\*\*/).map((part, i) => 
      i % 2 === 1 ? <strong key={i} className="text-foreground font-semibold">{part}</strong> : part
    );
  };

  const gradientColor = slug ? pageColors[slug] || 'from-primary to-primary/80' : 'from-primary to-primary/80';
  const icon = slug ? pageIcons[slug] : <FileText className="h-8 w-8" />;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20">
          <Skeleton className="h-12 w-2/3 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Page Not Found</h1>
            <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
            <Link to="/">
              <Button className="gap-2">
                <Home className="h-4 w-4" />
                Go to Homepage
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const pageTitle = page.content?.split('\n').find(line => line.startsWith('# '))?.substring(2) || page.title;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${gradientColor} py-16 md:py-24`}>
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,white)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-black/10 rounded-full blur-3xl" />
        
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-white/70 text-sm mb-6">
              <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
                <Home className="h-4 w-4" />
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white">{page.title}</span>
            </nav>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                {icon}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {pageTitle}
                </h1>
                {page.meta_description && (
                  <p className="text-white/80 mt-2 max-w-2xl">{page.meta_description}</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 md:py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            {/* Track Order Form */}
            {slug === 'track-order' && (
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8 shadow-lg">
                <h2 className="text-xl font-bold text-foreground mb-6">Track Your Order</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Order Number</label>
                    <Input 
                      placeholder="e.g., BDM-20240115-12345"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                    <Input 
                      placeholder="e.g., 01712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>
                <Button className="w-full md:w-auto mt-6 h-12 px-8" size="lg">
                  <Search className="h-4 w-4 mr-2" />
                  Track Order
                </Button>
              </div>
            )}

            {/* Contact Cards */}
            {slug === 'contact-us' && (
              <div className="grid gap-4 sm:grid-cols-3 mb-8">
                <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Call Us</h3>
                  <p className="text-muted-foreground text-sm">+880 1234-567890</p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Email Us</h3>
                  <p className="text-muted-foreground text-sm">support@bdmart.com</p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Working Hours</h3>
                  <p className="text-muted-foreground text-sm">Sat-Thu, 9AM-10PM</p>
                </div>
              </div>
            )}

            {/* About Stats */}
            {slug === 'about-us' && (
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-8">
                {[
                  { label: 'Products', value: '50,000+' },
                  { label: 'Sellers', value: '10,000+' },
                  { label: 'Customers', value: '1M+' },
                  { label: 'Districts', value: '64' },
                ].map((stat, i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                    <p className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.value}</p>
                    <p className="text-muted-foreground text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Main Content */}
            <div className="prose prose-lg max-w-none">
              {page.content && renderMarkdown(page.content)}
            </div>

            {/* Back to Home */}
            <div className="mt-12 pt-8 border-t border-border">
              <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline">
                <ArrowLeft className="h-4 w-4" />
                Back to Homepage
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}