-- Enable realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Enable realtime for sellers table
ALTER PUBLICATION supabase_realtime ADD TABLE public.sellers;

-- Enable realtime for products table
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;