export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  category: Category;
  brand?: Brand;
  rating: number;
  reviewCount: number;
  stock: number;
  sold: number;
  variations?: ProductVariation[];
  tags: string[];
  isFeatured: boolean;
  isFlashSale: boolean;
  flashSaleEnd?: Date;
  freeDelivery: boolean;
  seller: Seller;
  createdAt: Date;
}

export interface ProductVariation {
  id: string;
  type: 'size' | 'color' | 'unit';
  name: string;
  value: string;
  priceAdjustment?: number;
  stock: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image?: string;
  parentId?: string;
  productCount: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
}

export interface Seller {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  rating: number;
  productCount: number;
  joinedAt: Date;
  verified: boolean;
  level: 'bronze' | 'silver' | 'gold';
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariations?: ProductVariation[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  addresses: Address[];
  wallet: number;
  createdAt: Date;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  area: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  status: OrderStatus;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingAddress: Address;
  createdAt: Date;
  estimatedDelivery: Date;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: Date;
  helpful: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: Date;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link: string;
  position: 'hero' | 'sidebar' | 'bottom';
  order: number;
  isActive: boolean;
}

export interface FlashSale {
  id: string;
  name: string;
  products: Product[];
  startTime: Date;
  endTime: Date;
  isActive: boolean;
}
