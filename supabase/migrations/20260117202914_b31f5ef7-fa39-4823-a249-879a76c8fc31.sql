
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
