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
('header', '{"showTopBar": true, "topBarText": "Free shipping on orders over ৳2000!", "showSearch": true, "showCart": true}', 'layout', 'Header settings'),
('footer', '{"copyrightText": "© 2024 Jhuri. All rights reserved.", "showSocialLinks": true, "socialLinks": {}}', 'layout', 'Footer settings'),
('homepage_hero', '{"title": "New Collection", "subtitle": "Discover the latest trends", "buttonText": "Shop Now", "buttonLink": "/products", "backgroundImage": ""}', 'content', 'Homepage hero section');

-- Insert default page content
INSERT INTO public.page_content (page_slug, section_id, content, sort_order) VALUES
('home', 'hero', '{"type": "hero", "title": "New Collection", "subtitle": "Discover the latest trends in fashion", "buttonText": "Shop Now", "buttonLink": "/products", "backgroundImage": ""}', 1),
('home', 'features', '{"type": "features", "items": [{"icon": "Truck", "title": "Free Delivery", "description": "On orders over ৳2000"}, {"icon": "Shield", "title": "Secure Payment", "description": "100% protected"}, {"icon": "RotateCcw", "title": "Easy Returns", "description": "7 days return policy"}]}', 2),
('home', 'promo_banner', '{"type": "promo", "title": "Flash Sale!", "subtitle": "Up to 50% off on selected items", "buttonText": "View Deals", "buttonLink": "/products?sale=true"}', 3);