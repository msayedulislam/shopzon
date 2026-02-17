-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'seller', 'customer');

-- Create user roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create addresses table
CREATE TABLE public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    area TEXT NOT NULL,
    postal_code TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES public.categories(id),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create brands table
CREATE TABLE public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create seller status enum
CREATE TYPE public.seller_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE public.seller_level AS ENUM ('bronze', 'silver', 'gold');

-- Create sellers table
CREATE TABLE public.sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    shop_name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    description TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    status seller_status DEFAULT 'pending',
    level seller_level DEFAULT 'bronze',
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    rating DECIMAL(3,2) DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    balance DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create product status enum
CREATE TYPE public.product_status AS ENUM ('draft', 'pending', 'approved', 'rejected');

-- Create products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id),
    brand_id UUID REFERENCES public.brands(id),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    short_description TEXT,
    price DECIMAL(12,2) NOT NULL,
    original_price DECIMAL(12,2),
    discount_percent INTEGER DEFAULT 0,
    stock INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    sold INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    status product_status DEFAULT 'pending',
    is_featured BOOLEAN DEFAULT false,
    is_flash_sale BOOLEAN DEFAULT false,
    flash_sale_end TIMESTAMP WITH TIME ZONE,
    free_delivery BOOLEAN DEFAULT false,
    tags TEXT[],
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create product images table
CREATE TABLE public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create product variations table
CREATE TYPE public.variation_type AS ENUM ('size', 'color', 'unit');

CREATE TABLE public.product_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    type variation_type NOT NULL,
    name TEXT NOT NULL,
    value TEXT NOT NULL,
    price_adjustment DECIMAL(12,2) DEFAULT 0,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create order status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE public.payment_method AS ENUM ('cod', 'bkash', 'nagad', 'card');

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status order_status DEFAULT 'pending',
    subtotal DECIMAL(12,2) NOT NULL,
    delivery_charge DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    payment_method payment_method DEFAULT 'cod',
    payment_status payment_status DEFAULT 'pending',
    shipping_name TEXT NOT NULL,
    shipping_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_area TEXT NOT NULL,
    shipping_postal_code TEXT,
    notes TEXT,
    coupon_code TEXT,
    estimated_delivery DATE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    price DECIMAL(12,2) NOT NULL,
    quantity INTEGER NOT NULL,
    variations JSONB,
    commission_rate DECIMAL(5,2),
    commission_amount DECIMAL(12,2),
    seller_amount DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    images TEXT[],
    helpful_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create coupons table
CREATE TABLE public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value DECIMAL(12,2) NOT NULL,
    min_purchase DECIMAL(12,2) DEFAULT 0,
    max_discount DECIMAL(12,2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('sale', 'commission', 'payout', 'refund')),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create wishlist table
CREATE TABLE public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, product_id)
);

-- Create admin audit logs table
CREATE TABLE public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    )
$$;

-- Create function to get user's seller_id
CREATE OR REPLACE FUNCTION public.get_user_seller_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM public.sellers WHERE user_id = _user_id LIMIT 1
$$;

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for addresses
CREATE POLICY "Users can view own addresses" ON public.addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for categories (public read, admin write)
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for brands (public read, admin write)
CREATE POLICY "Brands are viewable by everyone" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Admins can manage brands" ON public.brands FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for sellers
CREATE POLICY "Active sellers are viewable by everyone" ON public.sellers FOR SELECT USING (status = 'active' OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create seller profile" ON public.sellers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Sellers can update own profile" ON public.sellers FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete sellers" ON public.sellers FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for products
CREATE POLICY "Approved products are viewable by everyone" ON public.products FOR SELECT USING (status = 'approved' OR seller_id = public.get_user_seller_id(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Sellers can create products" ON public.products FOR INSERT WITH CHECK (seller_id = public.get_user_seller_id(auth.uid()));
CREATE POLICY "Sellers can update own products" ON public.products FOR UPDATE USING (seller_id = public.get_user_seller_id(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for product_images
CREATE POLICY "Product images are viewable by everyone" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Sellers can manage own product images" ON public.product_images FOR ALL USING (
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND seller_id = public.get_user_seller_id(auth.uid()))
    OR public.has_role(auth.uid(), 'admin')
);

-- RLS Policies for product_variations
CREATE POLICY "Product variations are viewable by everyone" ON public.product_variations FOR SELECT USING (true);
CREATE POLICY "Sellers can manage own product variations" ON public.product_variations FOR ALL USING (
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND seller_id = public.get_user_seller_id(auth.uid()))
    OR public.has_role(auth.uid(), 'admin')
);

-- RLS Policies for orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for order_items
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
    OR seller_id = public.get_user_seller_id(auth.uid())
    OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can create order items" ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);

-- RLS Policies for reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for coupons
CREATE POLICY "Active coupons are viewable by everyone" ON public.coupons FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for transactions
CREATE POLICY "Sellers can view own transactions" ON public.transactions FOR SELECT USING (seller_id = public.get_user_seller_id(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can create transactions" ON public.transactions FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for wishlists
CREATE POLICY "Users can view own wishlist" ON public.wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for admin_audit_logs
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create audit logs" ON public.admin_audit_logs FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, email, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
        NEW.email,
        NEW.phone
    );
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'customer');
    
    RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON public.sellers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to reduce stock on order
CREATE OR REPLACE FUNCTION public.reduce_product_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    UPDATE public.products 
    SET stock = stock - NEW.quantity,
        sold = sold + NEW.quantity
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_item_created
    AFTER INSERT ON public.order_items
    FOR EACH ROW EXECUTE FUNCTION public.reduce_product_stock();

-- Create function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.order_number = 'BDM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Storage policies for product images
CREATE POLICY "Product images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated users can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete own product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Fix search_path for generate_order_number function
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.order_number = 'BDM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    RETURN NEW;
END;
$$;
-- Create table for static pages that can be edited from admin panel
CREATE TABLE public.static_pages (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slug text NOT NULL UNIQUE,
    title text NOT NULL,
    content text,
    meta_title text,
    meta_description text,
    hero_image text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.static_pages ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view active pages
CREATE POLICY "Active pages are viewable by everyone"
ON public.static_pages
FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

-- Only admins can manage pages
CREATE POLICY "Admins can manage pages"
ON public.static_pages
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_static_pages_updated_at
BEFORE UPDATE ON public.static_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default pages with content
INSERT INTO public.static_pages (slug, title, content, meta_title, meta_description) VALUES
('about-us', 'About Us', 
'# Welcome to BDMart

BDMart is Bangladesh''s leading online marketplace, connecting millions of customers with thousands of trusted sellers across the nation.

## Our Story

Founded in 2020, BDMart emerged from a simple vision: to make quality products accessible to every Bangladeshi household. What started as a small team with big dreams has grown into a thriving ecosystem of sellers, buyers, and partners.

## Our Mission

To democratize e-commerce in Bangladesh by providing a secure, affordable, and user-friendly platform that empowers both buyers and sellers.

## Our Values

**Trust & Transparency**: We believe in honest dealings and clear communication.

**Customer First**: Every decision we make prioritizes our customers'' needs.

**Innovation**: We constantly evolve to serve you better.

**Community**: We support local businesses and artisans across Bangladesh.

## Our Impact

- **50,000+** Products Available
- **10,000+** Verified Sellers
- **1 Million+** Happy Customers
- **64 Districts** Covered', 
'About BDMart - Bangladesh''s Premier Online Marketplace', 
'Learn about BDMart, Bangladesh''s leading online marketplace. Discover our story, mission, and commitment to quality e-commerce.'),

('contact-us', 'Contact Us', 
'# Get in Touch

We''re here to help! Reach out to us through any of the following channels.

## Customer Support

**Phone**: +880 1234-567890
**Email**: support@bdmart.com
**Hours**: Saturday - Thursday, 9:00 AM - 10:00 PM

## Head Office

BDMart Technologies Ltd.
House 45, Road 12, Block D
Banani, Dhaka 1213
Bangladesh

## Business Inquiries

For partnerships and business opportunities:
**Email**: business@bdmart.com

## Seller Support

Want to sell on BDMart?
**Email**: sellers@bdmart.com
**Phone**: +880 1234-567891

## Social Media

Follow us for updates and offers:
- Facebook: @bdmart
- Instagram: @bdmart_bd
- Twitter: @bdmart_official',
'Contact BDMart - Customer Support & Business Inquiries',
'Contact BDMart customer support. Find our phone numbers, email addresses, office location, and social media links.'),

('careers', 'Careers', 
'# Join Our Team

Be part of Bangladesh''s fastest-growing e-commerce company!

## Why Work at BDMart?

**Growth Opportunities**: Fast-track your career in a dynamic environment.

**Learning Culture**: Continuous learning and development programs.

**Great Benefits**: Competitive salary, health insurance, and more.

**Impactful Work**: Shape the future of e-commerce in Bangladesh.

## Current Openings

### Technology
- Senior Software Engineer
- Frontend Developer (React)
- DevOps Engineer
- Data Analyst

### Operations
- Supply Chain Manager
- Warehouse Supervisor
- Delivery Operations Lead

### Marketing
- Digital Marketing Manager
- Content Creator
- SEO Specialist

### Customer Service
- Customer Support Lead
- Quality Assurance Specialist

## How to Apply

Send your resume to careers@bdmart.com with the job title as the subject line.

We look forward to hearing from you!',
'Careers at BDMart - Join Our Growing Team',
'Explore career opportunities at BDMart. Join Bangladesh''s leading e-commerce platform and grow with us.'),

('blog', 'Blog', 
'# BDMart Blog

Stay updated with the latest news, tips, and trends.

## Featured Articles

### Shopping Tips
- How to Get the Best Deals on BDMart
- Guide to Using Coupons and Promo Codes
- Tips for Safe Online Shopping

### Seller Success Stories
- From Home Business to BDMart Star Seller
- How Local Artisans Are Finding Global Customers

### Product Guides
- Top 10 Electronics Under à§³10,000
- Best Fashion Picks for This Season
- Home Decor Ideas on a Budget

### Industry News
- E-commerce Trends in Bangladesh 2024
- The Rise of Mobile Shopping
- Sustainable Shopping: Making Conscious Choices

## Subscribe to Our Newsletter

Get the latest articles delivered to your inbox!',
'BDMart Blog - Shopping Tips, News & Updates',
'Read the BDMart blog for shopping tips, seller stories, product guides, and e-commerce news from Bangladesh.'),

('faqs', 'FAQs', 
'# Frequently Asked Questions

Find answers to common questions about shopping on BDMart.

## Ordering

**Q: How do I place an order?**
A: Browse products, add items to your cart, proceed to checkout, enter your delivery address, and confirm your order.

**Q: Can I modify my order after placing it?**
A: You can modify or cancel your order within 1 hour of placing it. Contact customer support for assistance.

**Q: What payment methods are accepted?**
A: We accept bKash, Nagad, Cash on Delivery, Visa, and MasterCard.

## Delivery

**Q: What are the delivery charges?**
A: Delivery charges vary by location. Dhaka: à§³60, Other cities: à§³120. Free delivery on orders above à§³2000.

**Q: How long does delivery take?**
A: Dhaka: 1-3 days, Other areas: 3-7 days.

**Q: Can I track my order?**
A: Yes! Use your order number to track your delivery on our Track Order page.

## Returns & Refunds

**Q: What is the return policy?**
A: Most items can be returned within 7 days of delivery if unused and in original packaging.

**Q: How do I request a refund?**
A: Submit a return request through your account or contact customer support.

**Q: How long do refunds take?**
A: Refunds are processed within 5-7 business days after we receive the returned item.

## Account

**Q: How do I create an account?**
A: Click ''Sign Up'' and enter your email, phone number, and create a password.

**Q: I forgot my password. How do I reset it?**
A: Click ''Forgot Password'' on the login page and follow the instructions sent to your email.',
'BDMart FAQs - Frequently Asked Questions',
'Find answers to frequently asked questions about ordering, delivery, returns, and more on BDMart.'),

('privacy-policy', 'Privacy Policy', 
'# Privacy Policy

Last updated: January 2024

BDMart Technologies Ltd. ("we", "our", or "us") respects your privacy and is committed to protecting your personal data.

## Information We Collect

**Personal Information**: Name, email, phone number, delivery address, payment information.

**Usage Data**: IP address, browser type, pages visited, time spent on pages.

**Device Information**: Device type, operating system, unique device identifiers.

## How We Use Your Information

- Process and fulfill your orders
- Send order confirmations and updates
- Provide customer support
- Improve our services and user experience
- Send promotional communications (with your consent)
- Detect and prevent fraud

## Data Sharing

We may share your information with:
- Delivery partners to fulfill orders
- Payment processors to complete transactions
- Service providers who assist our operations
- Legal authorities when required by law

## Data Security

We implement industry-standard security measures to protect your data, including encryption, secure servers, and regular security audits.

## Your Rights

You have the right to:
- Access your personal data
- Correct inaccurate data
- Delete your account and data
- Opt-out of marketing communications

## Contact Us

For privacy-related inquiries:
Email: privacy@bdmart.com',
'Privacy Policy - BDMart',
'Read BDMart''s privacy policy to understand how we collect, use, and protect your personal information.'),

('terms-conditions', 'Terms & Conditions', 
'# Terms & Conditions

Last updated: January 2024

Welcome to BDMart. By using our website and services, you agree to these terms.

## Account Terms

- You must be at least 18 years old to create an account
- You are responsible for maintaining account security
- One account per person; multiple accounts may be terminated
- Provide accurate and complete information

## Ordering & Payments

- All prices are in Bangladeshi Taka (à§³)
- Prices may change without notice
- We reserve the right to cancel orders
- Payment must be made through approved methods

## Delivery

- Delivery times are estimates, not guarantees
- You must provide accurate delivery information
- Someone must be available to receive the delivery
- Delivery charges apply based on location

## Returns & Refunds

- Items must be returned within 7 days
- Products must be unused and in original packaging
- Some items are non-returnable (see Return Policy)
- Refunds processed within 5-7 business days

## Prohibited Activities

- Fraudulent transactions
- Reselling without authorization
- Misuse of promotional offers
- Harassment of staff or sellers

## Limitation of Liability

BDMart is not liable for:
- Indirect or consequential damages
- Loss of profits or data
- Third-party actions

## Changes to Terms

We may update these terms at any time. Continued use constitutes acceptance.

## Contact

For questions: legal@bdmart.com',
'Terms & Conditions - BDMart',
'Read the terms and conditions for using BDMart, including account terms, ordering, delivery, and return policies.'),

('track-order', 'Track Order', 
'# Track Your Order

Enter your order details to see the current status of your delivery.

## How to Track

1. Enter your Order Number (e.g., BDM-20240115-12345)
2. Enter your Phone Number used during checkout
3. Click "Track Order"

## Order Statuses

**Pending**: Your order has been placed and is being processed.

**Confirmed**: Your order has been confirmed and is being prepared.

**Processing**: Your order is being packed at our warehouse.

**Shipped**: Your order is on its way to the delivery hub.

**Out for Delivery**: Your order is with our delivery partner and will arrive today.

**Delivered**: Your order has been successfully delivered.

## Need Help?

Can''t find your order? Contact our support team:
- Phone: +880 1234-567890
- Email: support@bdmart.com

## Delivery Partners

We work with trusted delivery partners across Bangladesh to ensure your packages arrive safely and on time.',
'Track Your Order - BDMart',
'Track your BDMart order status in real-time. Enter your order number to see delivery updates.'),

('returns-exchanges', 'Returns & Exchanges', 
'# Returns & Exchanges

We want you to be completely satisfied with your purchase.

## Return Policy

**Return Window**: 7 days from delivery date

**Eligible Items**: Most products in unused condition with original packaging

**Non-Returnable Items**:
- Perishable goods
- Intimate apparel
- Customized products
- Digital downloads
- Items marked "Final Sale"

## How to Return

1. Log in to your account
2. Go to "My Orders"
3. Select the order and click "Return Item"
4. Choose return reason
5. Schedule pickup or drop at collection point

## Exchange Policy

Want a different size or color? Request an exchange instead of a return:

1. Initiate return request
2. Select "Exchange" option
3. Choose new variant
4. We''ll ship the replacement when we receive your return

## Refund Process

**Timeline**: 5-7 business days after return approval

**Refund Methods**:
- Original payment method (bKash, Nagad, Card)
- BDMart Wallet (instant)

## Return Shipping

- Free for defective/damaged items
- Customer pays for change of mind returns
- Pickup available in select cities

## Quality Check

All returns are inspected before refund approval. Items must be:
- Unused and unworn
- With all tags attached
- In original packaging',
'Returns & Exchanges Policy - BDMart',
'Learn about BDMart''s return and exchange policy. Easy returns within 7 days of delivery.'),

('refund-policy', 'Refund Policy', 
'# Refund Policy

Understanding how refunds work at BDMart.

## When Are You Eligible?

**Full Refund**:
- Item not delivered
- Wrong item received
- Defective or damaged product
- Order cancelled before shipping

**Partial Refund**:
- Item partially used/damaged by customer
- Missing components (refund for missing parts)

## Refund Methods

**bKash/Nagad**: 3-5 business days
**Credit/Debit Card**: 5-7 business days
**BDMart Wallet**: Instant credit

## Refund Process

1. **Request Submitted**: You initiate return/refund
2. **Pickup Scheduled**: We arrange item collection
3. **Quality Check**: Item inspected at warehouse
4. **Refund Approved**: Amount credited to original payment method
5. **Confirmation**: SMS/Email notification sent

## Non-Refundable Items

- Gift cards
- Downloadable products
- Services rendered
- Items returned after 7 days
- Used or damaged items (customer fault)

## Promo & Coupon Refunds

- Coupon value is non-refundable
- Only actual paid amount is refunded
- Promotional items follow specific rules

## Dispute Resolution

Not satisfied with refund decision?

1. Email: refunds@bdmart.com
2. Include order number and issue description
3. Our team will review within 48 hours',
'Refund Policy - BDMart',
'Understand BDMart''s refund policy including eligibility, process, and timeline for getting your money back.'),

('shipping-info', 'Shipping Info', 
'# Shipping Information

Everything you need to know about BDMart deliveries.

## Delivery Coverage

We deliver to all 64 districts of Bangladesh!

### Delivery Times

**Dhaka City**: 1-2 business days
**Dhaka Suburbs**: 2-3 business days
**Divisional Cities**: 3-5 business days
**Other Areas**: 5-7 business days

*Note: Times may vary during peak seasons and holidays.*

## Shipping Charges

| Order Value | Dhaka | Outside Dhaka |
|-------------|-------|---------------|
| Below à§³1,000 | à§³60 | à§³120 |
| à§³1,000 - à§³1,999 | à§³40 | à§³80 |
| à§³2,000+ | FREE | FREE |

## Express Delivery

Need it faster? Select Express Delivery at checkout:
- **Dhaka**: Same day / Next day (additional à§³100)
- **Major Cities**: 1-2 days (additional à§³150)

## Tracking Your Order

Track your shipment in real-time:
1. Go to Track Order page
2. Enter your order number
3. View live status updates

## Delivery Partners

We work with trusted partners:
- Pathao
- Steadfast
- RedX
- Sundarban Courier

## Delivery Instructions

Add special instructions during checkout:
- Gate code
- Landmark details
- Preferred time window
- Call before delivery',
'Shipping Information - BDMart',
'Find BDMart shipping rates, delivery times, and coverage areas. We deliver to all 64 districts of Bangladesh.'),

('seller-policy', 'Seller Policy', 
'# Seller Policy

Guidelines for selling on BDMart.

## Becoming a Seller

**Requirements**:
- Valid NID or Trade License
- Active mobile number
- Bank account or bKash/Nagad
- Product photos and descriptions

## Commission Structure

| Seller Level | Commission Rate |
|--------------|-----------------|
| Bronze (New) | 10% |
| Silver | 8% |
| Gold | 6% |

*Commission is deducted from each sale.*

## Product Guidelines

**Allowed**:
- Electronics & Accessories
- Fashion & Apparel
- Home & Living
- Health & Beauty
- Sports & Outdoors
- Books & Stationery

**Prohibited**:
- Counterfeit products
- Illegal items
- Weapons
- Adult content
- Hazardous materials

## Order Fulfillment

- Process orders within 24 hours
- Ship within 2 business days
- Provide tracking information
- Package items securely

## Quality Standards

- Accurate product descriptions
- High-quality images
- Genuine products only
- Responsive customer service

## Payment Settlement

- Weekly settlements
- Minimum withdrawal: à§³500
- Bank transfer or mobile wallet

## Policy Violations

Violations may result in:
- Warning
- Listing removal
- Account suspension
- Permanent ban',
'Seller Policy - BDMart',
'Read the seller policy for BDMart marketplace. Learn about commission rates, product guidelines, and seller requirements.'),

('payment-methods', 'Payment Methods', 
'# Payment Methods

Choose from multiple secure payment options.

## Mobile Wallets

### bKash
Bangladesh''s most popular mobile payment service.
- Instant payment confirmation
- No additional charges
- Available 24/7

### Nagad
Fast and secure mobile financial service.
- Quick checkout
- Wide accessibility
- Real-time processing

## Cards

### Visa & MasterCard
Credit and debit cards accepted.
- 3D Secure authentication
- Encrypted transactions
- EMI available on select cards

## Cash on Delivery (COD)

Pay when you receive your order.
- Available nationwide
- No advance payment needed
- Inspect before paying
- COD charge: à§³10

## BDMart Wallet

Use your BDMart Wallet balance.
- Instant checkout
- Earn cashback
- Store refunds
- Gift card redemption

## Payment Security

Your payments are protected by:
- SSL Encryption
- PCI DSS Compliance
- Fraud Detection Systems
- Secure Payment Gateways

## Payment Issues?

**Payment Failed?**
- Check internet connection
- Verify card/account balance
- Try different payment method

**Overcharged?**
- Contact support immediately
- Provide transaction details
- Refund within 48 hours',
'Payment Methods - BDMart',
'Explore payment options at BDMart including bKash, Nagad, cards, and cash on delivery.'),

('help-center', 'Help Center', 
'# Help Center

Welcome to BDMart Help Center. How can we assist you today?

## Popular Topics

### ðŸ›’ Orders & Checkout
- How to place an order
- Applying coupon codes
- Order cancellation
- Bulk ordering

### ðŸ“¦ Delivery & Shipping
- Delivery times
- Shipping charges
- Track my order
- Change delivery address

### ðŸ”„ Returns & Refunds
- Return policy
- How to return items
- Refund status
- Exchange process

### ðŸ‘¤ Account & Profile
- Create an account
- Update profile
- Reset password
- Delete account

### ðŸ’³ Payments
- Payment methods
- Payment failed
- Refund timeline
- Gift cards

### ðŸª For Sellers
- Become a seller
- Seller dashboard
- Product listing
- Payment settlement

## Contact Support

### Live Chat
Available 9 AM - 10 PM (Sat-Thu)
Click the chat icon at bottom right

### Phone
+880 1234-567890
9 AM - 10 PM (Sat-Thu)

### Email
support@bdmart.com
Response within 24 hours

### Social Media
- Facebook: @bdmart
- Instagram: @bdmart_bd

## Self-Service Tools

- Track Order
- Return Request
- Download Invoice
- Update Address',
'Help Center - BDMart Customer Support',
'Get help with your BDMart orders, delivery, returns, payments, and account. Contact our support team.');
-- Create table for contact form inquiries
CREATE TABLE public.contact_inquiries (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    subject text,
    message text NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied', 'archived')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact inquiry
CREATE POLICY "Anyone can create contact inquiries"
ON public.contact_inquiries
FOR INSERT
WITH CHECK (true);

-- Only admins can view and manage inquiries
CREATE POLICY "Admins can manage contact inquiries"
ON public.contact_inquiries
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_contact_inquiries_updated_at
BEFORE UPDATE ON public.contact_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create blog_posts table
CREATE TABLE public.blog_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT,
    featured_image TEXT,
    author_id UUID REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    meta_title TEXT,
    meta_description TEXT,
    tags TEXT[],
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Published posts are viewable by everyone"
ON public.blog_posts FOR SELECT
USING (status = 'published' OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage blog posts"
ON public.blog_posts FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Enable realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Enable realtime for sellers table
ALTER PUBLICATION supabase_realtime ADD TABLE public.sellers;

-- Enable realtime for products table
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
-- Admin settings/configuration table
CREATE TABLE public.admin_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text UNIQUE NOT NULL,
    value jsonb NOT NULL DEFAULT '{}',
    category text NOT NULL DEFAULT 'general',
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Admin permissions table
CREATE TABLE public.admin_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    permissions jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Seller trust scores and governance
CREATE TABLE public.seller_governance (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id uuid REFERENCES public.sellers(id) ON DELETE CASCADE NOT NULL,
    trust_score integer DEFAULT 100,
    warning_count integer DEFAULT 0,
    strike_count integer DEFAULT 0,
    last_warning_at timestamptz,
    last_strike_at timestamptz,
    suspension_reason text,
    suspended_at timestamptz,
    reactivated_at timestamptz,
    cancellation_rate numeric DEFAULT 0,
    fulfillment_rate numeric DEFAULT 100,
    avg_shipping_time_hours integer DEFAULT 24,
    sla_violation_count integer DEFAULT 0,
    allowed_categories uuid[] DEFAULT '{}',
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Seller actions log (warnings, strikes, communications)
CREATE TABLE public.seller_action_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id uuid REFERENCES public.sellers(id) ON DELETE CASCADE NOT NULL,
    admin_id uuid,
    action_type text NOT NULL,
    reason text,
    details jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- Seller payouts
CREATE TABLE public.seller_payouts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id uuid REFERENCES public.sellers(id) ON DELETE CASCADE NOT NULL,
    amount numeric NOT NULL,
    status text DEFAULT 'pending',
    payment_method text,
    payment_reference text,
    approved_by uuid,
    approved_at timestamptz,
    processed_at timestamptz,
    notes text,
    created_at timestamptz DEFAULT now()
);

-- Order internal notes
CREATE TABLE public.order_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    admin_id uuid,
    note text NOT NULL,
    is_internal boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Order edit history
CREATE TABLE public.order_edit_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    admin_id uuid,
    field_changed text NOT NULL,
    old_value text,
    new_value text,
    reason text,
    created_at timestamptz DEFAULT now()
);

-- Product edit history
CREATE TABLE public.product_edit_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    admin_id uuid,
    seller_id uuid,
    changes jsonb NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Courier companies
CREATE TABLE public.couriers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    code text UNIQUE NOT NULL,
    logo_url text,
    api_endpoint text,
    api_key_encrypted text,
    is_active boolean DEFAULT true,
    supports_cod boolean DEFAULT true,
    base_rate numeric DEFAULT 0,
    weight_rate numeric DEFAULT 0,
    zones jsonb DEFAULT '{}',
    sla_hours integer DEFAULT 72,
    created_at timestamptz DEFAULT now()
);

-- Courier performance
CREATE TABLE public.courier_performance (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    courier_id uuid REFERENCES public.couriers(id) ON DELETE CASCADE NOT NULL,
    date date NOT NULL,
    total_deliveries integer DEFAULT 0,
    successful_deliveries integer DEFAULT 0,
    failed_deliveries integer DEFAULT 0,
    avg_delivery_hours numeric DEFAULT 0,
    sla_violations integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Order courier assignments
CREATE TABLE public.order_courier (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    courier_id uuid REFERENCES public.couriers(id),
    tracking_number text,
    status text DEFAULT 'pending',
    assigned_at timestamptz DEFAULT now(),
    picked_up_at timestamptz,
    delivered_at timestamptz,
    failed_attempts integer DEFAULT 0,
    last_failed_reason text,
    created_at timestamptz DEFAULT now()
);

-- Campaigns
CREATE TABLE public.campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    type text NOT NULL,
    status text DEFAULT 'draft',
    start_date timestamptz,
    end_date timestamptz,
    target_audience jsonb DEFAULT '{}',
    discount_config jsonb DEFAULT '{}',
    products uuid[] DEFAULT '{}',
    categories uuid[] DEFAULT '{}',
    sellers uuid[] DEFAULT '{}',
    budget numeric,
    spent numeric DEFAULT 0,
    impressions integer DEFAULT 0,
    conversions integer DEFAULT 0,
    created_by uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Fraud detection
CREATE TABLE public.fraud_alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES public.orders(id),
    user_id uuid,
    alert_type text NOT NULL,
    severity text DEFAULT 'medium',
    score numeric DEFAULT 0,
    indicators jsonb DEFAULT '{}',
    status text DEFAULT 'pending',
    reviewed_by uuid,
    reviewed_at timestamptz,
    action_taken text,
    notes text,
    created_at timestamptz DEFAULT now()
);

-- AI suggestions
CREATE TABLE public.ai_suggestions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type text NOT NULL,
    entity_id uuid,
    entity_type text,
    suggestion jsonb NOT NULL,
    confidence numeric DEFAULT 0,
    status text DEFAULT 'pending',
    approved_by uuid,
    approved_at timestamptz,
    rejected_reason text,
    created_at timestamptz DEFAULT now()
);

-- System health logs
CREATE TABLE public.system_health (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    component text NOT NULL,
    status text NOT NULL,
    response_time_ms integer,
    error_count integer DEFAULT 0,
    details jsonb DEFAULT '{}',
    checked_at timestamptz DEFAULT now()
);

-- Refunds
CREATE TABLE public.refunds (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    amount numeric NOT NULL,
    reason text NOT NULL,
    refund_method text NOT NULL,
    status text DEFAULT 'pending',
    wallet_credited boolean DEFAULT false,
    processed_by uuid,
    processed_at timestamptz,
    notes text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_governance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_edit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_edit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courier_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_courier ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_settings
CREATE POLICY "Admins can manage settings" ON public.admin_settings FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Settings viewable by authenticated" ON public.admin_settings FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policies for admin_permissions
CREATE POLICY "Admins can manage permissions" ON public.admin_permissions FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for seller_governance
CREATE POLICY "Admins can manage seller governance" ON public.seller_governance FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Sellers can view own governance" ON public.seller_governance FOR SELECT USING (seller_id = get_user_seller_id(auth.uid()));

-- RLS Policies for seller_action_logs
CREATE POLICY "Admins can manage seller action logs" ON public.seller_action_logs FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Sellers can view own action logs" ON public.seller_action_logs FOR SELECT USING (seller_id = get_user_seller_id(auth.uid()));

-- RLS Policies for seller_payouts
CREATE POLICY "Admins can manage payouts" ON public.seller_payouts FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Sellers can view own payouts" ON public.seller_payouts FOR SELECT USING (seller_id = get_user_seller_id(auth.uid()));

-- RLS Policies for order_notes
CREATE POLICY "Admins can manage order notes" ON public.order_notes FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for order_edit_history
CREATE POLICY "Admins can manage order edit history" ON public.order_edit_history FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for product_edit_history
CREATE POLICY "Admins can view product edit history" ON public.product_edit_history FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Sellers can view own product history" ON public.product_edit_history FOR SELECT USING (seller_id = get_user_seller_id(auth.uid()));
CREATE POLICY "System can create product history" ON public.product_edit_history FOR INSERT WITH CHECK (true);

-- RLS Policies for couriers
CREATE POLICY "Admins can manage couriers" ON public.couriers FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Couriers viewable by authenticated" ON public.couriers FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policies for courier_performance
CREATE POLICY "Admins can manage courier performance" ON public.courier_performance FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for order_courier
CREATE POLICY "Admins can manage order courier" ON public.order_courier FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own order courier" ON public.order_courier FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_courier.order_id AND orders.user_id = auth.uid()));

-- RLS Policies for campaigns
CREATE POLICY "Admins can manage campaigns" ON public.campaigns FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Active campaigns viewable" ON public.campaigns FOR SELECT USING (status = 'active' OR has_role(auth.uid(), 'admin'));

-- RLS Policies for fraud_alerts
CREATE POLICY "Admins can manage fraud alerts" ON public.fraud_alerts FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for ai_suggestions
CREATE POLICY "Admins can manage AI suggestions" ON public.ai_suggestions FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for system_health
CREATE POLICY "Admins can manage system health" ON public.system_health FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for refunds
CREATE POLICY "Admins can manage refunds" ON public.refunds FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own refunds" ON public.refunds FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = refunds.order_id AND orders.user_id = auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_seller_governance_seller ON public.seller_governance(seller_id);
CREATE INDEX idx_seller_action_logs_seller ON public.seller_action_logs(seller_id);
CREATE INDEX idx_seller_payouts_seller ON public.seller_payouts(seller_id);
CREATE INDEX idx_seller_payouts_status ON public.seller_payouts(status);
CREATE INDEX idx_order_notes_order ON public.order_notes(order_id);
CREATE INDEX idx_order_edit_history_order ON public.order_edit_history(order_id);
CREATE INDEX idx_product_edit_history_product ON public.product_edit_history(product_id);
CREATE INDEX idx_fraud_alerts_order ON public.fraud_alerts(order_id);
CREATE INDEX idx_fraud_alerts_status ON public.fraud_alerts(status);
CREATE INDEX idx_refunds_order ON public.refunds(order_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);

-- Add triggers for updated_at
CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON public.admin_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_permissions_updated_at BEFORE UPDATE ON public.admin_permissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_seller_governance_updated_at BEFORE UPDATE ON public.seller_governance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Fix permissive RLS policy for product_edit_history
DROP POLICY IF EXISTS "System can create product history" ON public.product_edit_history;
CREATE POLICY "Authenticated users can create product history" ON public.product_edit_history 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
-- Create customer wallets table
CREATE TABLE public.wallets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    balance NUMERIC DEFAULT 0 NOT NULL CHECK (balance >= 0),
    total_credited NUMERIC DEFAULT 0 NOT NULL,
    total_spent NUMERIC DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wallet transactions table
CREATE TABLE public.wallet_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'refund', 'purchase')),
    amount NUMERIC NOT NULL,
    reference_type TEXT, -- 'refund', 'order', 'admin_credit'
    reference_id UUID,
    description TEXT,
    balance_after NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Wallet RLS policies - users can view their own wallet
CREATE POLICY "Users can view their own wallet"
ON public.wallets
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all wallets
CREATE POLICY "Admins can view all wallets"
ON public.wallets
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update wallets
CREATE POLICY "Admins can update wallets"
ON public.wallets
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- System can insert wallets (through functions)
CREATE POLICY "System can insert wallets"
ON public.wallets
FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Wallet transactions RLS
CREATE POLICY "Users can view their own transactions"
ON public.wallet_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
ON public.wallet_transactions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert transactions"
ON public.wallet_transactions
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function to credit wallet (for refunds)
CREATE OR REPLACE FUNCTION public.credit_wallet(
    p_user_id UUID,
    p_amount NUMERIC,
    p_reference_type TEXT,
    p_reference_id UUID,
    p_description TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_wallet_id UUID;
    v_new_balance NUMERIC;
BEGIN
    -- Get or create wallet
    SELECT id INTO v_wallet_id FROM wallets WHERE user_id = p_user_id;
    
    IF v_wallet_id IS NULL THEN
        INSERT INTO wallets (user_id, balance, total_credited)
        VALUES (p_user_id, p_amount, p_amount)
        RETURNING id INTO v_wallet_id;
        v_new_balance := p_amount;
    ELSE
        UPDATE wallets 
        SET balance = balance + p_amount,
            total_credited = total_credited + p_amount,
            updated_at = now()
        WHERE id = v_wallet_id
        RETURNING balance INTO v_new_balance;
    END IF;
    
    -- Record transaction
    INSERT INTO wallet_transactions (wallet_id, user_id, type, amount, reference_type, reference_id, description, balance_after)
    VALUES (v_wallet_id, p_user_id, 'credit', p_amount, p_reference_type, p_reference_id, p_description, v_new_balance);
    
    RETURN TRUE;
END;
$$;

-- Function to debit wallet (for purchases)
CREATE OR REPLACE FUNCTION public.debit_wallet(
    p_user_id UUID,
    p_amount NUMERIC,
    p_reference_type TEXT,
    p_reference_id UUID,
    p_description TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_wallet_id UUID;
    v_current_balance NUMERIC;
    v_new_balance NUMERIC;
BEGIN
    -- Get wallet and balance
    SELECT id, balance INTO v_wallet_id, v_current_balance FROM wallets WHERE user_id = p_user_id;
    
    IF v_wallet_id IS NULL OR v_current_balance < p_amount THEN
        RETURN FALSE;
    END IF;
    
    -- Update balance
    UPDATE wallets 
    SET balance = balance - p_amount,
        total_spent = total_spent + p_amount,
        updated_at = now()
    WHERE id = v_wallet_id
    RETURNING balance INTO v_new_balance;
    
    -- Record transaction
    INSERT INTO wallet_transactions (wallet_id, user_id, type, amount, reference_type, reference_id, description, balance_after)
    VALUES (v_wallet_id, p_user_id, 'debit', -p_amount, p_reference_type, p_reference_id, p_description, v_new_balance);
    
    RETURN TRUE;
END;
$$;

-- Fix fraud_alerts RLS - drop overly permissive policy if exists and create proper ones
DROP POLICY IF EXISTS "Allow all operations on fraud_alerts" ON public.fraud_alerts;
DROP POLICY IF EXISTS "Admins can manage fraud alerts" ON public.fraud_alerts;

CREATE POLICY "Admins can view fraud alerts"
ON public.fraud_alerts
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert fraud alerts"
ON public.fraud_alerts
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update fraud alerts"
ON public.fraud_alerts
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete fraud alerts"
ON public.fraud_alerts
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for wallet updated_at
CREATE TRIGGER update_wallets_updated_at
BEFORE UPDATE ON public.wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Allow sellers to delete their own products
DROP POLICY IF EXISTS "Sellers can delete own products" ON public.products;
CREATE POLICY "Sellers can delete own products" ON public.products 
FOR DELETE USING (seller_id = get_user_seller_id(auth.uid()));

-- Add cascade delete for product images when product is deleted
-- Drop and recreate the foreign key with cascade
ALTER TABLE public.product_images DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;
ALTER TABLE public.product_images 
ADD CONSTRAINT product_images_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Add cascade delete for product variations when product is deleted
ALTER TABLE public.product_variations DROP CONSTRAINT IF EXISTS product_variations_product_id_fkey;
ALTER TABLE public.product_variations 
ADD CONSTRAINT product_variations_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Calculate and store commission when order items are inserted
CREATE OR REPLACE FUNCTION public.calculate_order_item_commission()
RETURNS TRIGGER AS $$
DECLARE
  seller_commission_rate numeric;
BEGIN
  -- Get seller's commission rate
  SELECT COALESCE(commission_rate, 10) INTO seller_commission_rate
  FROM public.sellers
  WHERE id = NEW.seller_id;
  
  -- Calculate commission and seller amounts
  NEW.commission_rate := seller_commission_rate;
  NEW.commission_amount := (NEW.price * NEW.quantity * seller_commission_rate / 100);
  NEW.seller_amount := (NEW.price * NEW.quantity) - NEW.commission_amount;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for commission calculation
DROP TRIGGER IF EXISTS calculate_commission_trigger ON public.order_items;
CREATE TRIGGER calculate_commission_trigger
BEFORE INSERT ON public.order_items
FOR EACH ROW
WHEN (NEW.seller_id IS NOT NULL)
EXECUTE FUNCTION public.calculate_order_item_commission();

-- Function to deduct stock when order is placed
CREATE OR REPLACE FUNCTION public.deduct_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Deduct stock from product
  UPDATE public.products
  SET stock = GREATEST(0, stock - NEW.quantity),
      sold = COALESCE(sold, 0) + NEW.quantity
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for stock deduction
DROP TRIGGER IF EXISTS deduct_stock_trigger ON public.order_items;
CREATE TRIGGER deduct_stock_trigger
AFTER INSERT ON public.order_items
FOR EACH ROW
WHEN (NEW.product_id IS NOT NULL)
EXECUTE FUNCTION public.deduct_product_stock();

-- Create promotional banners table
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position TEXT NOT NULL DEFAULT 'hero',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create search history table
CREATE TABLE public.search_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  query TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create seller reviews table
CREATE TABLE public.seller_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(seller_id, user_id, order_id)
);

-- Enable RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_reviews ENABLE ROW LEVEL SECURITY;

-- Banner policies
CREATE POLICY "Active banners are viewable by everyone" ON public.banners
  FOR SELECT USING (is_active = true AND (start_date IS NULL OR start_date <= now()) AND (end_date IS NULL OR end_date >= now()));

CREATE POLICY "Admins can manage banners" ON public.banners
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Search history policies
CREATE POLICY "Users can view own search history" ON public.search_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create search history" ON public.search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own search history" ON public.search_history
  FOR DELETE USING (auth.uid() = user_id);

-- Seller review policies
CREATE POLICY "Seller reviews are viewable by everyone" ON public.seller_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create seller reviews" ON public.seller_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own seller reviews" ON public.seller_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own seller reviews" ON public.seller_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update seller rating
CREATE OR REPLACE FUNCTION public.update_seller_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.sellers
  SET rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM public.seller_reviews
    WHERE seller_id = COALESCE(NEW.seller_id, OLD.seller_id)
  )
  WHERE id = COALESCE(NEW.seller_id, OLD.seller_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to update seller rating
CREATE TRIGGER update_seller_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.seller_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_seller_rating();

-- Create index for search history
CREATE INDEX idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX idx_search_history_query ON public.search_history(query);

-- Create index for seller reviews
CREATE INDEX idx_seller_reviews_seller_id ON public.seller_reviews(seller_id);
-- Create site_settings table for global theme configuration
CREATE TABLE public.site_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}',
    category TEXT NOT NULL DEFAULT 'general',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create page_content table for editable page content
CREATE TABLE public.page_content (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    page_slug TEXT NOT NULL,
    section_id TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(page_slug, section_id)
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- RLS policies for site_settings (admin only for write, public for read)
CREATE POLICY "Anyone can read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for page_content (admin only for write, public for read)
CREATE POLICY "Anyone can read page content" ON public.page_content FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage page content" ON public.page_content FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_page_content_updated_at BEFORE UPDATE ON public.page_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default theme settings
INSERT INTO public.site_settings (key, value, category, description) VALUES
('theme_colors', '{"primary": "0 84% 60%", "secondary": "0 0% 96%", "accent": "0 84% 60%", "background": "0 0% 100%", "foreground": "0 0% 3.9%"}', 'theme', 'Global color palette'),
('typography', '{"headingFont": "Outfit", "bodyFont": "Space Grotesk", "baseFontSize": "16px"}', 'theme', 'Typography settings'),
('branding', '{"siteName": "Jhuri", "tagline": "Your Fashion Destination", "logoUrl": "", "faviconUrl": ""}', 'branding', 'Site branding'),
('header', '{"showTopBar": true, "topBarText": "Free shipping on orders over à§³2000!", "showSearch": true, "showCart": true}', 'layout', 'Header settings'),
('footer', '{"copyrightText": "Â© 2024 Jhuri. All rights reserved.", "showSocialLinks": true, "socialLinks": {}}', 'layout', 'Footer settings'),
('homepage_hero', '{"title": "New Collection", "subtitle": "Discover the latest trends", "buttonText": "Shop Now", "buttonLink": "/products", "backgroundImage": ""}', 'content', 'Homepage hero section');

-- Insert default page content
INSERT INTO public.page_content (page_slug, section_id, content, sort_order) VALUES
('home', 'hero', '{"type": "hero", "title": "New Collection", "subtitle": "Discover the latest trends in fashion", "buttonText": "Shop Now", "buttonLink": "/products", "backgroundImage": ""}', 1),
('home', 'features', '{"type": "features", "items": [{"icon": "Truck", "title": "Free Delivery", "description": "On orders over à§³2000"}, {"icon": "Shield", "title": "Secure Payment", "description": "100% protected"}, {"icon": "RotateCcw", "title": "Easy Returns", "description": "7 days return policy"}]}', 2),
('home', 'promo_banner', '{"type": "promo", "title": "Flash Sale!", "subtitle": "Up to 50% off on selected items", "buttonText": "View Deals", "buttonLink": "/products?sale=true"}', 3);
-- Product Q&A table for customer questions
CREATE TABLE public.product_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  question text NOT NULL,
  is_answered boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.product_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES public.product_questions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  seller_id uuid REFERENCES public.sellers(id),
  answer text NOT NULL,
  is_seller_answer boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Price drop alerts / wishlist price tracking
CREATE TABLE public.price_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  target_price numeric,
  original_price numeric NOT NULL,
  is_notified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Quick reorder from past purchases
CREATE TABLE public.saved_carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'My Cart',
  items jsonb NOT NULL DEFAULT '[]',
  is_favorite boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Return requests for self-service returns
CREATE TABLE public.return_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  refund_amount numeric,
  images text[],
  admin_notes text,
  processed_by uuid,
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Delivery time slots
CREATE TABLE public.delivery_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  max_orders integer DEFAULT 50,
  current_orders integer DEFAULT 0,
  extra_charge numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  available_days integer[] DEFAULT '{1,2,3,4,5,6,0}',
  created_at timestamp with time zone DEFAULT now()
);

-- Scheduled admin actions
CREATE TABLE public.scheduled_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  scheduled_for timestamp with time zone NOT NULL,
  payload jsonb DEFAULT '{}',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'cancelled', 'failed')),
  executed_at timestamp with time zone,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Inventory alerts configuration
CREATE TABLE public.inventory_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL UNIQUE,
  low_stock_threshold integer DEFAULT 10,
  out_of_stock_notified boolean DEFAULT false,
  low_stock_notified boolean DEFAULT false,
  auto_reorder boolean DEFAULT false,
  reorder_quantity integer DEFAULT 50,
  last_alert_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Customer insights / analytics
CREATE TABLE public.customer_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  total_orders integer DEFAULT 0,
  total_spent numeric DEFAULT 0,
  avg_order_value numeric DEFAULT 0,
  first_order_at timestamp with time zone,
  last_order_at timestamp with time zone,
  favorite_categories uuid[],
  favorite_brands uuid[],
  customer_segment text DEFAULT 'new',
  lifetime_value numeric DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.product_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_questions
CREATE POLICY "Questions viewable by everyone" ON public.product_questions FOR SELECT USING (true);
CREATE POLICY "Users can ask questions" ON public.product_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own questions" ON public.product_questions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for product_answers
CREATE POLICY "Answers viewable by everyone" ON public.product_answers FOR SELECT USING (true);
CREATE POLICY "Users can answer questions" ON public.product_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own answers" ON public.product_answers FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for price_alerts
CREATE POLICY "Users can manage own alerts" ON public.price_alerts FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for saved_carts
CREATE POLICY "Users can manage own carts" ON public.saved_carts FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for return_requests
CREATE POLICY "Users can view own returns" ON public.return_requests FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create returns" ON public.return_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage returns" ON public.return_requests FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for delivery_slots
CREATE POLICY "Slots viewable by everyone" ON public.delivery_slots FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage slots" ON public.delivery_slots FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for scheduled_actions
CREATE POLICY "Admins can manage scheduled actions" ON public.scheduled_actions FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for inventory_alerts
CREATE POLICY "Admins and sellers can view alerts" ON public.inventory_alerts FOR SELECT USING (
  has_role(auth.uid(), 'admin') OR 
  EXISTS (SELECT 1 FROM products WHERE products.id = inventory_alerts.product_id AND products.seller_id = get_user_seller_id(auth.uid()))
);
CREATE POLICY "Admins can manage alerts" ON public.inventory_alerts FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for customer_insights
CREATE POLICY "Admins can view insights" ON public.customer_insights FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage insights" ON public.customer_insights FOR ALL USING (has_role(auth.uid(), 'admin'));
-- MASTER SETUP SCRIPT FOR SHOPZON SUPABASE PROJECT
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/yqyvetwuijuiqrgixjqn/sql)

-- 1. INITIALIZE SCHEMA (Based on migrations)
-- [Combined schema lines 1-2209 from migrations go here, but for brevity in this tool call, 
-- I will assume the user has the combined_schema.sql or I will include essential parts]

-- PROMOTION OF ADMIN USER
-- User: developersayedul@gmail.com
-- ID: 98e569fa-ec49-4686-ade3-ea62ba048a4a

-- Since the trigger on_auth_user_created might not have run if the table didn't exist when the user signed up,
-- we check and manually insert the profile and roles.

DO $$
BEGIN
    -- Ensure user_roles table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        RAISE NOTICE 'Please run the full schema script first.';
    END IF;

    -- Update/Insert Admin Role
    INSERT INTO public.user_roles (user_id, role)
    VALUES ('98e569fa-ec49-4686-ade3-ea62ba048a4a', 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Ensure profile exists
    INSERT INTO public.profiles (user_id, email, full_name)
    VALUES ('98e569fa-ec49-4686-ade3-ea62ba048a4a', 'developersayedul@gmail.com', 'Admin User')
    ON CONFLICT (user_id) DO NOTHING;
END $$;

-- INITIAL DATA SEED (Mock Data)

-- Categories
INSERT INTO public.categories (name, slug, icon) VALUES
('Electronics', 'electronics', 'ðŸ“±'),
('Fashion', 'fashion', 'ðŸ‘—'),
('Home & Living', 'home-living', 'ðŸ '),
('Beauty', 'beauty', 'ðŸ’„'),
('Sports', 'sports', 'âš½'),
('Groceries', 'groceries', 'ðŸ›’'),
('Books', 'books', 'ðŸ“š'),
('Toys', 'toys', 'ðŸ§¸')
ON CONFLICT (slug) DO NOTHING;

-- Default Brands
INSERT INTO public.brands (name, slug) VALUES
('Samsung', 'samsung'),
('Apple', 'apple'),
('Sony', 'sony'),
('Nike', 'nike'),
('L''Oreal', 'loreal')
ON CONFLICT (slug) DO NOTHING;

-- For products, we need a seller. We'll use the admin user as a seller too for now.
INSERT INTO public.sellers (id, user_id, shop_name, slug, status, level, verified)
VALUES ('98e569fa-ec49-4686-ade3-ea62ba048a4a', '98e569fa-ec49-4686-ade3-ea62ba048a4a', 'Jhuri Official', 'jhuri-official', 'active', 'gold', true)
ON CONFLICT (id) DO NOTHING;

-- Sample Products
DO $$
DECLARE
    elec_id UUID;
    s_brand_id UUID;
    a_brand_id UUID;
BEGIN
    SELECT id INTO elec_id FROM public.categories WHERE slug = 'electronics';
    SELECT id INTO s_brand_id FROM public.brands WHERE slug = 'samsung';
    SELECT id INTO a_brand_id FROM public.brands WHERE slug = 'apple';

    -- Samsung Galaxy S24 Ultra
    INSERT INTO public.products (name, slug, description, price, original_price, discount_percent, seller_id, category_id, brand_id, status, is_featured, stock)
    VALUES ('Samsung Galaxy S24 Ultra 5G', 'samsung-galaxy-s24-ultra-5g', 'Experience the future with Samsung Galaxy S24 Ultra featuring cutting-edge AI capabilities.', 159999, 179999, 11, '98e569fa-ec49-4686-ade3-ea62ba048a4a', elec_id, s_brand_id, 'approved', true, 50)
    ON CONFLICT (slug) DO NOTHING;

    -- Apple MacBook Air M3
    INSERT INTO public.products (name, slug, description, price, original_price, discount_percent, seller_id, category_id, brand_id, status, is_featured, stock)
    VALUES ('Apple MacBook Air M3 2024', 'apple-macbook-air-m3-2024', 'Incredibly thin and light laptop with the powerful M3 chip.', 149999, 159999, 6, '98e569fa-ec49-4686-ade3-ea62ba048a4a', elec_id, a_brand_id, 'approved', true, 30)
    ON CONFLICT (slug) DO NOTHING;
END $$;
