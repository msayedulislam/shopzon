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
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import NotFound from '@/pages/NotFound';

// User Dashboard
import UserDashboard from '@/pages/dashboard/UserDashboard';
import DashboardOverview from '@/pages/dashboard/DashboardOverview';
import ProfilePage from '@/pages/dashboard/ProfilePage';
import OrdersPage from '@/pages/dashboard/OrdersPage';
import DashboardWishlistPage from '@/pages/dashboard/WishlistPage';
import AddressesPage from '@/pages/dashboard/AddressesPage';

// Seller
import SellerRegisterPage from '@/pages/seller/SellerRegisterPage';
import SellerDashboard from '@/pages/seller/SellerDashboard';
import SellerOverview from '@/pages/seller/SellerOverview';
import SellerProducts from '@/pages/seller/SellerProducts';
import SellerOrders from '@/pages/seller/SellerOrders';
import SellerEarnings from '@/pages/seller/SellerEarnings';
import SellerSettings from '@/pages/seller/SellerSettings';

// Admin
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminOverview from '@/pages/admin/AdminOverview';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminSellers from '@/pages/admin/AdminSellers';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminBrands from '@/pages/admin/AdminBrands';
import AdminCoupons from '@/pages/admin/AdminCoupons';
import AdminPages from '@/pages/admin/AdminPages';
import AdminBlog from '@/pages/admin/AdminBlog';
import AdminInquiries from '@/pages/admin/AdminInquiries';
import AdminLogs from '@/pages/admin/AdminLogs';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminFinance from '@/pages/admin/AdminFinance';
import AdminSellerGovernance from '@/pages/admin/AdminSellerGovernance';
import AdminFraudDetection from '@/pages/admin/AdminFraudDetection';
import AdminCouriers from '@/pages/admin/AdminCouriers';
import AdminCampaigns from '@/pages/admin/AdminCampaigns';
import AdminSystemHealth from '@/pages/admin/AdminSystemHealth';
import AdminAdvancedOrders from '@/pages/admin/AdminAdvancedOrders';
import AdminAISuggestions from '@/pages/admin/AdminAISuggestions';
import AdminRefunds from '@/pages/admin/AdminRefunds';

import StaticPage from '@/pages/StaticPage';

// Blog
import BlogPage from '@/pages/BlogPage';
import BlogPostPage from '@/pages/BlogPostPage';

// Wishlist
import WishlistPage from '@/pages/WishlistPage';

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
        <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
        <Route path="/wishlist" element={<PageTransition><WishlistPage /></PageTransition>} />

        {/* Protected Routes */}
        <Route path="/checkout" element={<ProtectedRoute><PageTransition><CheckoutPage /></PageTransition></ProtectedRoute>} />
        <Route path="/order-success" element={<ProtectedRoute><PageTransition><OrderSuccessPage /></PageTransition></ProtectedRoute>} />

        {/* User Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><PageTransition><UserDashboard /></PageTransition></ProtectedRoute>}>
          <Route index element={<DashboardOverview />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="wishlist" element={<DashboardWishlistPage />} />
          <Route path="addresses" element={<AddressesPage />} />
        </Route>

        {/* Seller Routes */}
        <Route path="/seller/register" element={<ProtectedRoute><PageTransition><SellerRegisterPage /></PageTransition></ProtectedRoute>} />
        <Route path="/seller/dashboard" element={<ProtectedRoute requiredRole="seller"><PageTransition><SellerDashboard /></PageTransition></ProtectedRoute>}>
          <Route index element={<SellerOverview />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="earnings" element={<SellerEarnings />} />
          <Route path="settings" element={<SellerSettings />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<PageTransition><AdminLoginPage /></PageTransition>} />
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>}>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="sellers" element={<AdminSellers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="advanced-orders" element={<AdminAdvancedOrders />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="brands" element={<AdminBrands />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="finance" element={<AdminFinance />} />
          <Route path="seller-governance" element={<AdminSellerGovernance />} />
          <Route path="fraud-detection" element={<AdminFraudDetection />} />
          <Route path="couriers" element={<AdminCouriers />} />
          <Route path="campaigns" element={<AdminCampaigns />} />
          <Route path="system-health" element={<AdminSystemHealth />} />
          <Route path="ai-suggestions" element={<AdminAISuggestions />} />
          <Route path="refunds" element={<AdminRefunds />} />
          <Route path="settings" element={<AdminSettings />} />
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
