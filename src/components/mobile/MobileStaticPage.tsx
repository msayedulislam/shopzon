import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, FileText, Users, HelpCircle, Shield, Package, Truck, CreditCard, Briefcase, MessageSquare, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileBottomNav } from './MobileBottomNav';
import { supabase } from '@/integrations/supabase/client';
import { TrackOrderForm } from '@/components/TrackOrderForm';

interface StaticPageData {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

const pageIcons: Record<string, React.ReactNode> = {
  'about-us': <Users className="h-6 w-6" />,
  'contact-us': <Phone className="h-6 w-6" />,
  'careers': <Briefcase className="h-6 w-6" />,
  'faqs': <HelpCircle className="h-6 w-6" />,
  'privacy-policy': <Shield className="h-6 w-6" />,
  'terms-conditions': <FileText className="h-6 w-6" />,
  'track-order': <Search className="h-6 w-6" />,
  'returns-exchanges': <Package className="h-6 w-6" />,
  'refund-policy': <CreditCard className="h-6 w-6" />,
  'shipping-info': <Truck className="h-6 w-6" />,
  'help-center': <MessageSquare className="h-6 w-6" />,
};

const pageColors: Record<string, string> = {
  'about-us': 'bg-blue-500',
  'contact-us': 'bg-emerald-500',
  'careers': 'bg-purple-500',
  'faqs': 'bg-cyan-500',
  'privacy-policy': 'bg-slate-500',
  'terms-conditions': 'bg-zinc-600',
  'track-order': 'bg-green-500',
  'returns-exchanges': 'bg-rose-500',
  'refund-policy': 'bg-amber-500',
  'shipping-info': 'bg-sky-500',
  'help-center': 'bg-violet-500',
};

export function MobileStaticPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const slug = location.pathname.substring(1);
  const [page, setPage] = useState<StaticPageData | null>(null);
  const [loading, setLoading] = useState(true);

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

      setPage(data);
      setLoading(false);
    }

    fetchPage();
  }, [slug]);

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];

    lines.forEach((line, index) => {
      if (line.startsWith('# ')) return; // Skip H1
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-lg font-bold mt-6 mb-3 text-foreground">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-base font-semibold mt-4 mb-2 text-foreground">
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={index} className="text-sm text-muted-foreground ml-4 mb-1">
            {line.substring(2)}
          </li>
        );
      } else if (line.trim() !== '') {
        elements.push(
          <p key={index} className="text-sm text-muted-foreground mb-2 leading-relaxed">
            {line}
          </p>
        );
      }
    });

    return elements;
  };

  const icon = pageIcons[slug] || <FileText className="h-6 w-6" />;
  const colorClass = pageColors[slug] || 'bg-primary';

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary/30 dark:bg-background pb-20">
        <header className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border/50 safe-area-top">
          <div className="flex items-center gap-3 h-14 px-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <div className="h-5 w-32 bg-secondary rounded animate-pulse" />
          </div>
        </header>
        <div className="p-4 space-y-4">
          <div className="h-6 w-3/4 bg-secondary rounded animate-pulse" />
          <div className="h-4 w-full bg-secondary rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-secondary rounded animate-pulse" />
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-secondary/30 dark:bg-background pb-20">
        <header className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border/50 safe-area-top">
          <div className="flex items-center gap-3 h-14 px-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-base font-semibold">Page Not Found</h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
            <FileText className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="font-semibold mb-2">Page not found</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            The page you're looking for doesn't exist
          </p>
          <Link to="/" className="px-8 py-2.5 bg-primary text-white rounded-full font-medium">
            Go Home
          </Link>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 dark:bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border/50 safe-area-top">
        <div className="flex items-center gap-3 h-14 px-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-base font-semibold">{page.title}</h1>
        </div>
      </header>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${colorClass} p-6 text-white`}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h2 className="text-xl font-bold">{page.title}</h2>
            {page.meta_description && (
              <p className="text-white/80 text-sm mt-1 line-clamp-2">
                {page.meta_description}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="p-4">
        {slug === 'track-order' && (
          <div className="bg-white dark:bg-card rounded-2xl border border-border/50 p-4 mb-4">
            <TrackOrderForm />
          </div>
        )}

        {slug === 'contact-us' && (
          <div className="space-y-3 mb-6">
            <div className="bg-white dark:bg-card rounded-2xl border border-border/50 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Call Us</p>
                <p className="text-xs text-muted-foreground">+880 1234-567890</p>
              </div>
            </div>
            <div className="bg-white dark:bg-card rounded-2xl border border-border/50 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Email Us</p>
                <p className="text-xs text-muted-foreground">support@jhuri.com</p>
              </div>
            </div>
            <div className="bg-white dark:bg-card rounded-2xl border border-border/50 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Visit Us</p>
                <p className="text-xs text-muted-foreground">Dhaka, Bangladesh</p>
              </div>
            </div>
          </div>
        )}

        {page.content && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-card rounded-2xl border border-border/50 p-4"
          >
            {renderContent(page.content)}
          </motion.div>
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
}
