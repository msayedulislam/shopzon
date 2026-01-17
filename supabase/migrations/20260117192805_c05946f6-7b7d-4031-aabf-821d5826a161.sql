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