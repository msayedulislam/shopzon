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
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader showBack title="Help Center" />
        <div className="p-4">{content}</div>
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
