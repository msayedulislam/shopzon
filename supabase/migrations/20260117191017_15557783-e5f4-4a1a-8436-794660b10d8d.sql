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