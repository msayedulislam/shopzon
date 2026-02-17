import { useState } from 'react';
import { GovalyHeader } from '@/components/layout/GovalyHeader';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, Package, CreditCard, Truck, RotateCcw, ShieldCheck, MessageCircle, Phone, Mail, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';

const helpCategories = [
  { icon: Package, label: 'Orders', description: 'Track, cancel, or modify orders', link: '/help-center' },
  { icon: Truck, label: 'Shipping', description: 'Delivery times and tracking', link: '/shipping-info' },
  { icon: RotateCcw, label: 'Returns', description: 'Return policy and process', link: '/returns-exchanges' },
  { icon: CreditCard, label: 'Payments', description: 'Payment methods and issues', link: '/payment-methods' },
  { icon: ShieldCheck, label: 'Account', description: 'Security and settings', link: '/dashboard/security' },
  { icon: MessageCircle, label: 'Contact', description: 'Get in touch with us', link: '/contact-us' },
];

const faqs = [
  {
    question: 'How do I track my order?',
    answer: 'You can track your order by going to Dashboard > My Orders and clicking on the order. You\'ll see real-time tracking information including estimated delivery time.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept bKash, Nagad, Credit/Debit Cards, and Cash on Delivery (COD). You can save your preferred payment method in Dashboard > Payments.'
  },
  {
    question: 'How do I return a product?',
    answer: 'To return a product, go to Dashboard > My Orders, select the order, and click "Request Return". Returns must be initiated within 7 days of delivery.'
  },
  {
    question: 'How long does delivery take?',
    answer: 'Delivery typically takes 2-5 business days depending on your location. Dhaka city orders are usually delivered within 1-2 days.'
  },
  {
    question: 'How do I use a coupon code?',
    answer: 'During checkout, enter your coupon code in the "Coupon Code" field and click Apply. The discount will be automatically applied to your order.'
  },
  {
    question: 'Can I change my delivery address?',
    answer: 'You can change your delivery address before your order is shipped. Go to Dashboard > My Orders and click "Edit" on the pending order.'
  },
  {
    question: 'How do I become a seller?',
    answer: 'To become a seller, click on "Become a Seller" in your dashboard or visit /seller/register. You\'ll need to provide business information and wait for approval.'
  },
  {
    question: 'What is the wallet feature?',
    answer: 'Your wallet stores credits from refunds and promotional offers. You can use wallet balance during checkout to pay for orders.'
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();

  const filteredFaqs = faqs.filter(
    faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const content = (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center py-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl">
        <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">How can we help?</h1>
        <p className="text-muted-foreground mb-6">Search our help center or browse categories</p>
        <div className="max-w-md mx-auto px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {helpCategories.map((cat) => (
            <Link key={cat.label} to={cat.link}>
              <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <cat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium">{cat.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{cat.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <Card>
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b last:border-0">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                    <span className="text-left font-medium">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {filteredFaqs.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No results found for "{searchQuery}"
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contact */}
      <Card className="bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-lg">Still need help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Our support team is here to help you</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/contact-us">
                <Mail className="h-4 w-4 mr-2" />
                Email Us
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href="tel:+8801XXXXXXXXX">
                <Phone className="h-4 w-4 mr-2" />
                Call Us
              </a>
            </Button>
            <Button asChild>
              <Link to="/contact-us">
                <MessageCircle className="h-4 w-4 mr-2" />
                Live Chat
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] dark:bg-background pb-20">
        <MobileHeader showBack title="Help Center" />
        <div className="p-4 space-y-6">
          {/* Search Section */}
          <div className="bg-white dark:bg-card p-6 rounded-3xl shadow-sm border border-border/5">
            <h1 className="text-xl font-black mb-1 uppercase tracking-tighter italic">How can we help?</h1>
            <p className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest">Search our help center</p>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" strokeWidth={3} />
              <Input
                placeholder="Type your question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 rounded-2xl bg-secondary/30 border-none focus-visible:ring-primary shadow-inner"
              />
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 gap-3">
            {helpCategories.map((cat) => (
              <Link key={cat.label} to={cat.link}>
                <div className="bg-white dark:bg-card p-4 rounded-3xl border border-border/5 shadow-sm active:scale-95 transition-all text-center">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 mx-auto">
                    <cat.icon className="h-5 w-5 text-primary" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-tighter">{cat.label}</h3>
                  <p className="text-[9px] font-bold text-muted-foreground mt-1 leading-tight">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="bg-white dark:bg-card rounded-3xl border border-border/5 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border/10">
              <h2 className="text-[13px] font-black uppercase tracking-widest italic">Frequent Questions</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.slice(0, 5).map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/10 last:border-0 px-2">
                  <AccordionTrigger className="px-4 py-4 hover:no-underline text-[11px] font-bold uppercase tracking-tight text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-xs font-semibold text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Support Buttons */}
          <div className="grid grid-cols-1 gap-3">
            <Button asChild className="h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20">
              <Link to="/contact-us">
                <MessageCircle className="h-5 w-5 mr-3" strokeWidth={3} />
                Start Live Chat
              </Link>
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button asChild variant="outline" className="h-12 rounded-2xl border-primary/20 text-primary font-black uppercase tracking-tighter text-[10px]">
                <a href="tel:+8801XXXXXXXXX">
                  <Phone className="h-4 w-4 mr-2" />
                  Phone Call
                </a>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-2xl border-primary/20 text-primary font-black uppercase tracking-tighter text-[10px]">
                <Link to="/contact-us">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <GovalyHeader />
      <main className="flex-1 container py-8">{content}</main>
      <Footer />
    </div>
  );
}
