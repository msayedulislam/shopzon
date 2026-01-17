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