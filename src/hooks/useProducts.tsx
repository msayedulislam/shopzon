import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  original_price: number | null;
  discount_percent: number | null;
  stock: number | null;
  sold: number | null;
  rating: number | null;
  review_count: number | null;
  is_featured: boolean | null;
  is_flash_sale: boolean | null;
  flash_sale_end: string | null;
  free_delivery: boolean | null;
  category: { id: string; name: string; slug: string } | null;
  brand: { id: string; name: string; slug: string; logo_url: string | null } | null;
  seller: { id: string; shop_name: string; slug: string; rating: number | null; status: string | null } | null;
  images: { id: string; image_url: string; sort_order: number | null }[];
}

async function fetchProducts(options?: {
  featured?: boolean;
  flashSale?: boolean;
  freeDelivery?: boolean;
  categorySlug?: string;
  limit?: number;
  sortBy?: 'newest' | 'bestselling' | 'discount' | 'price_asc' | 'price_desc';
}) {
  let query = supabase
    .from('products')
    .select(`
      id, name, slug, description, short_description, price, original_price, 
      discount_percent, stock, sold, rating, review_count, is_featured, 
      is_flash_sale, flash_sale_end, free_delivery,
      category:categories(id, name, slug),
      brand:brands(id, name, slug, logo_url),
      seller:sellers(id, shop_name, slug, rating, status),
      images:product_images(id, image_url, sort_order)
    `)
    .eq('status', 'approved');

  if (options?.featured) {
    query = query.eq('is_featured', true);
  }

  if (options?.flashSale) {
    query = query.eq('is_flash_sale', true);
  }

  if (options?.freeDelivery) {
    query = query.eq('free_delivery', true);
  }

  if (options?.categorySlug) {
    query = query.eq('category.slug', options.categorySlug);
  }

  // Apply sorting
  switch (options?.sortBy) {
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'bestselling':
      query = query.order('sold', { ascending: false });
      break;
    case 'discount':
      query = query.order('discount_percent', { ascending: false });
      break;
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data || []) as ProductData[];
}

async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, icon, image_url, is_active')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export function useProducts(options?: Parameters<typeof fetchProducts>[0]) {
  return useQuery({
    queryKey: ['products', options],
    queryFn: () => fetchProducts(options),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useFeaturedProducts(limit = 8) {
  return useProducts({ featured: true, limit });
}

export function useFlashSaleProducts(limit = 10) {
  return useProducts({ flashSale: true, limit });
}

export function useNewArrivals(limit = 10) {
  return useProducts({ sortBy: 'newest', limit });
}

export function useBestSelling(limit = 10) {
  return useProducts({ sortBy: 'bestselling', limit });
}

export function useDiscountProducts(limit = 10) {
  return useProducts({ sortBy: 'discount', limit });
}

export function useFreeDeliveryProducts(limit = 10) {
  return useProducts({ freeDelivery: true, limit });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Utility function to convert DB product to display format
export function toDisplayProduct(product: ProductData) {
  const sortedImages = [...(product.images || [])].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    shortDescription: product.short_description || '',
    price: product.price,
    originalPrice: product.original_price || undefined,
    discount: product.discount_percent || undefined,
    images: sortedImages.length > 0 
      ? sortedImages.map(img => img.image_url) 
      : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop'],
    category: product.category 
      ? { 
          id: product.category.id, 
          name: product.category.name, 
          slug: product.category.slug,
          icon: '📦',
          productCount: 0,
        } 
      : { id: '', name: 'Uncategorized', slug: 'uncategorized', icon: '📦', productCount: 0 },
    brand: product.brand ? {
      id: product.brand.id,
      name: product.brand.name,
      slug: product.brand.slug,
      logo: product.brand.logo_url || undefined,
    } : undefined,
    rating: product.rating || 0,
    reviewCount: product.review_count || 0,
    stock: product.stock || 0,
    sold: product.sold || 0,
    tags: [],
    isFeatured: product.is_featured || false,
    isFlashSale: product.is_flash_sale || false,
    flashSaleEnd: product.flash_sale_end ? new Date(product.flash_sale_end) : undefined,
    freeDelivery: product.free_delivery || false,
    seller: product.seller ? {
      id: product.seller.id,
      name: product.seller.shop_name,
      slug: product.seller.slug,
      rating: product.seller.rating || 0,
      productCount: 0,
      joinedAt: new Date(),
      verified: product.seller.status === 'active',
      level: 'bronze' as const,
    } : {
      id: '',
      name: 'Shopzon Seller',
      slug: 'shopzon-seller',
      rating: 4.5,
      productCount: 0,
      joinedAt: new Date(),
      verified: true,
      level: 'gold' as const,
    },
    createdAt: new Date(),
  };
}
