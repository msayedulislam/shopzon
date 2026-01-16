import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './PageTransition';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Pages
import Index from '@/pages/Index';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import OrderSuccessPage from '@/pages/OrderSuccessPage';
import AuthPage from '@/pages/AuthPage';
import NotFound from '@/pages/NotFound';

// User Dashboard
import UserDashboard from '@/pages/dashboard/UserDashboard';
import ProfilePage from '@/pages/dashboard/ProfilePage';
import OrdersPage from '@/pages/dashboard/OrdersPage';
import WishlistPage from '@/pages/dashboard/WishlistPage';
import AddressesPage from '@/pages/dashboard/AddressesPage';

// Seller
import SellerRegisterPage from '@/pages/seller/SellerRegisterPage';
import SellerDashboard from '@/pages/seller/SellerDashboard';
import SellerOverview from '@/pages/seller/SellerOverview';
import SellerProducts from '@/pages/seller/SellerProducts';

// Admin
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminOverview from '@/pages/admin/AdminOverview';
import AdminSellers from '@/pages/admin/AdminSellers';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminPages from '@/pages/admin/AdminPages';
import AdminBlog from '@/pages/admin/AdminBlog';
import AdminInquiries from '@/pages/admin/AdminInquiries';

// Static Pages
import StaticPage from '@/pages/StaticPage';

// Blog
import BlogPage from '@/pages/BlogPage';
import BlogPostPage from '@/pages/BlogPostPage';

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/products" element={<PageTransition><ProductsPage /></PageTransition>} />
        <Route path="/category/:slug" element={<PageTransition><ProductsPage /></PageTransition>} />
        <Route path="/product/:slug" element={<PageTransition><ProductDetailPage /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><CartPage /></PageTransition>} />
        <Route path="/flash-sale" element={<PageTransition><ProductsPage /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><AuthPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><AuthPage /></PageTransition>} />

        {/* Protected Routes */}
        <Route path="/checkout" element={<ProtectedRoute><PageTransition><CheckoutPage /></PageTransition></ProtectedRoute>} />
        <Route path="/order-success" element={<ProtectedRoute><PageTransition><OrderSuccessPage /></PageTransition></ProtectedRoute>} />

        {/* User Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><PageTransition><UserDashboard /></PageTransition></ProtectedRoute>}>
          <Route index element={<ProfilePage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="addresses" element={<AddressesPage />} />
        </Route>

        {/* Seller Routes */}
        <Route path="/seller/register" element={<ProtectedRoute><PageTransition><SellerRegisterPage /></PageTransition></ProtectedRoute>} />
        <Route path="/seller/dashboard" element={<ProtectedRoute requiredRole="seller"><PageTransition><SellerDashboard /></PageTransition></ProtectedRoute>}>
          <Route index element={<SellerOverview />} />
          <Route path="products" element={<SellerProducts />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<PageTransition><AdminLoginPage /></PageTransition>} />
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>}>
          <Route index element={<AdminOverview />} />
          <Route path="sellers" element={<AdminSellers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="inquiries" element={<AdminInquiries />} />
        </Route>

        {/* Static Pages */}
        <Route path="/about-us" element={<PageTransition><StaticPage /></PageTransition>} />
        <Route path="/contact-us" element={<PageTransition><StaticPage /></PageTransition>} />
        <Route path="/careers" element={<PageTransition><StaticPage /></PageTransition>} />
        <Route path="/blog" element={<PageTransition><BlogPage /></PageTransition>} />
        <Route path="/blog/:slug" element={<PageTransition><BlogPostPage /></PageTransition>} />
        <Route path="/faqs" element={<PageTransition><StaticPage /></PageTransition>} />
        <Route path="/privacy-policy" element={<PageTransition><StaticPage /></PageTransition>} />
        <Route path="/terms-conditions" element={<PageTransition><StaticPage /></PageTransition>} />
        <Route path="/track-order" element={<PageTransition><StaticPage /></PageTransition>} />
        <Route path="/returns-exchanges" element={<PageTransition><StaticPage /></PageTransition>} />
        <Route path="/refund-policy" element={<PageTransition><StaticPage /></PageTransition>} />
        <Route path="/shipping-info" element={<PageTransition><StaticPage /></PageTransition>} />
        <Route path="/seller-policy" element={<PageTransition><StaticPage /></PageTransition>} />
        <Route path="/payment-methods" element={<PageTransition><StaticPage /></PageTransition>} />
        <Route path="/help-center" element={<PageTransition><StaticPage /></PageTransition>} />

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}
