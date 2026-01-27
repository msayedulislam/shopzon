import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useCart } from './useCart';
import { toast } from 'sonner';

interface SavedCartItem {
  productId: string;
  quantity: number;
  productName: string;
  productImage: string;
  price: number;
}

interface SavedCart {
  id: string;
  name: string;
  items: SavedCartItem[];
  is_favorite: boolean;
  created_at: string;
}

interface OrderWithItems {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  items: Array<{
    product_id: string;
    product_name: string;
    product_image: string;
    quantity: number;
    price: number;
  }>;
}

export function useQuickReorder() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const queryClient = useQueryClient();

  // Fetch past orders for reorder
  const { data: pastOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['past-orders-reorder', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          created_at,
          total,
          order_items (
            product_id,
            product_name,
            product_image,
            quantity,
            price
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'delivered')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      return (orders || []).map(order => ({
        ...order,
        items: order.order_items || []
      })) as OrderWithItems[];
    },
    enabled: !!user,
  });

  // Fetch saved carts
  const { data: savedCarts = [], isLoading: cartsLoading } = useQuery({
    queryKey: ['saved-carts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('saved_carts')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(cart => ({
        ...cart,
        items: (Array.isArray(cart.items) ? cart.items : []) as unknown as SavedCartItem[]
      })) as SavedCart[];
    },
    enabled: !!user,
  });

  // Save current cart
  const saveCurrentCart = useMutation({
    mutationFn: async ({ name, items }: { name: string; items: SavedCartItem[] }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('saved_carts')
        .insert({
          user_id: user.id,
          name,
          items: items as unknown as any,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-carts'] });
      toast.success('Cart saved successfully!');
    },
    onError: () => {
      toast.error('Failed to save cart');
    },
  });

  // Reorder from past order
  const reorderFromOrder = async (order: OrderWithItems) => {
    let addedCount = 0;
    
    for (const item of order.items) {
      if (item.product_id) {
        // Fetch current product data
        const { data: product } = await supabase
          .from('products')
          .select('*, product_images(*), categories(*), sellers(*)')
          .eq('id', item.product_id)
          .eq('status', 'approved')
          .single();

        if (product) {
          const displayProduct = {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description || '',
            shortDescription: product.short_description || '',
            price: product.price,
            originalPrice: product.original_price || undefined,
            images: product.product_images?.map((img: any) => img.image_url) || [],
            category: product.categories ? {
              id: product.categories.id,
              name: product.categories.name,
              slug: product.categories.slug,
              icon: product.categories.icon || '',
              productCount: 0,
            } : { id: '', name: '', slug: '', icon: '', productCount: 0 },
            rating: product.rating || 0,
            reviewCount: product.review_count || 0,
            sold: product.sold || 0,
            stock: product.stock || 0,
            discount: product.discount_percent || 0,
            freeDelivery: product.free_delivery || false,
            isFlashSale: product.is_flash_sale || false,
            isFeatured: product.is_featured || false,
            tags: product.tags || [],
            seller: product.sellers ? {
              id: product.sellers.id,
              name: product.sellers.shop_name,
              slug: product.sellers.slug,
              logo: product.sellers.logo_url,
              rating: product.sellers.rating || 0,
              productCount: 0,
              joinedAt: new Date(product.sellers.created_at),
              verified: true,
              level: product.sellers.level || 'bronze',
            } : { id: '', name: '', slug: '', rating: 0, productCount: 0, joinedAt: new Date(), verified: false, level: 'bronze' as const },
            createdAt: new Date(product.created_at),
          };
          addItem(displayProduct, item.quantity);
          addedCount++;
        }
      }
    }
    
    if (addedCount > 0) {
      toast.success(`Added ${addedCount} items to cart`);
    } else {
      toast.error('Some items are no longer available');
    }
  };

  // Reorder from saved cart
  const reorderFromSavedCart = async (cart: SavedCart) => {
    let addedCount = 0;
    
    for (const item of cart.items) {
      if (item.productId) {
        const { data: product } = await supabase
          .from('products')
          .select('*, product_images(*), categories(*), sellers(*)')
          .eq('id', item.productId)
          .eq('status', 'approved')
          .single();

        if (product) {
          const displayProduct = {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description || '',
            shortDescription: product.short_description || '',
            price: product.price,
            originalPrice: product.original_price || undefined,
            images: product.product_images?.map((img: any) => img.image_url) || [],
            category: product.categories ? {
              id: product.categories.id,
              name: product.categories.name,
              slug: product.categories.slug,
              icon: product.categories.icon || '',
              productCount: 0,
            } : { id: '', name: '', slug: '', icon: '', productCount: 0 },
            rating: product.rating || 0,
            reviewCount: product.review_count || 0,
            sold: product.sold || 0,
            stock: product.stock || 0,
            discount: product.discount_percent || 0,
            freeDelivery: product.free_delivery || false,
            isFlashSale: product.is_flash_sale || false,
            isFeatured: product.is_featured || false,
            tags: product.tags || [],
            seller: product.sellers ? {
              id: product.sellers.id,
              name: product.sellers.shop_name,
              slug: product.sellers.slug,
              logo: product.sellers.logo_url,
              rating: product.sellers.rating || 0,
              productCount: 0,
              joinedAt: new Date(product.sellers.created_at),
              verified: true,
              level: product.sellers.level || 'bronze',
            } : { id: '', name: '', slug: '', rating: 0, productCount: 0, joinedAt: new Date(), verified: false, level: 'bronze' as const },
            createdAt: new Date(product.created_at),
          };
          addItem(displayProduct, item.quantity);
          addedCount++;
        }
      }
    }
    
    if (addedCount > 0) {
      toast.success(`Added ${addedCount} items to cart`);
    }
  };

  // Delete saved cart
  const deleteSavedCart = useMutation({
    mutationFn: async (cartId: string) => {
      const { error } = await supabase
        .from('saved_carts')
        .delete()
        .eq('id', cartId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-carts'] });
      toast.success('Cart deleted');
    },
  });

  return {
    pastOrders,
    savedCarts,
    isLoading: ordersLoading || cartsLoading,
    saveCurrentCart,
    reorderFromOrder,
    reorderFromSavedCart,
    deleteSavedCart,
  };
}
