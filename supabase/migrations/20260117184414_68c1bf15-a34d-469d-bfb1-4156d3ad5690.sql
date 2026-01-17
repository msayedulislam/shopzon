-- Fix permissive RLS policy for product_edit_history
DROP POLICY IF EXISTS "System can create product history" ON public.product_edit_history;
CREATE POLICY "Authenticated users can create product history" ON public.product_edit_history 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);