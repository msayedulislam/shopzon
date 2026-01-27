import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface PriceAlert {
  id: string;
  product_id: string;
  target_price: number | null;
  original_price: number;
  is_notified: boolean;
  created_at: string;
  product?: {
    id: string;
    name: string;
    price: number;
    slug: string;
    product_images: { image_url: string }[];
  };
}

export function usePriceAlerts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's price alerts
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['price-alerts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('price_alerts')
        .select(`
          *,
          product:products (
            id,
            name,
            price,
            slug,
            product_images (image_url)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PriceAlert[];
    },
    enabled: !!user,
  });

  // Check if alert exists for product
  const hasAlert = (productId: string) => {
    return alerts.some(alert => alert.product_id === productId);
  };

  // Create price alert
  const createAlert = useMutation({
    mutationFn: async ({ productId, targetPrice, originalPrice }: {
      productId: string;
      targetPrice?: number;
      originalPrice: number;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('price_alerts')
        .upsert({
          user_id: user.id,
          product_id: productId,
          target_price: targetPrice || null,
          original_price: originalPrice,
        }, {
          onConflict: 'user_id,product_id',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
      toast.success('Price alert set! We\'ll notify you when the price drops.');
    },
    onError: () => {
      toast.error('Failed to set price alert');
    },
  });

  // Remove price alert
  const removeAlert = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
      toast.success('Price alert removed');
    },
  });

  // Get alerts with price drops
  const alertsWithDrops = alerts.filter(alert => {
    if (!alert.product) return false;
    return alert.product.price < alert.original_price;
  });

  return {
    alerts,
    alertsWithDrops,
    isLoading,
    hasAlert,
    createAlert,
    removeAlert,
  };
}
