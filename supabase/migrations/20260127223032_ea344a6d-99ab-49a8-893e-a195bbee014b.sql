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