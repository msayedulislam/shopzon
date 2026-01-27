import { Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const AdminBackup = lazy(() => import('@/pages/admin/AdminBackup'));
const AdminRolePresets = lazy(() => import('@/pages/admin/AdminRolePresets'));
const AdminMasterData = lazy(() => import('@/pages/admin/AdminMasterData'));
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './PageTransition';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Pages
import Index from '@/pages/Index';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CategoriesPage from '@/pages/CategoriesPage';
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
import DashboardWalletPage from '@/pages/dashboard/WalletPage';
import CouponsPage from '@/pages/dashboard/CouponsPage';
import PaymentsPage from '@/pages/dashboard/PaymentsPage';
import SettingsPage from '@/pages/dashboard/SettingsPage';
import SecurityPage from '@/pages/dashboard/SecurityPage';
import HelpPage from '@/pages/HelpPage';

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
import AdminWallets from '@/pages/admin/AdminWallets';
import AdminBanners from '@/pages/admin/AdminBanners';
import AdminOrdersEnhanced from '@/pages/admin/AdminOrdersEnhanced';
import AdminProductsEnhanced from '@/pages/admin/AdminProductsEnhanced';
import AdminUsersEnhanced from '@/pages/admin/AdminUsersEnhanced';
import AdminCategoriesEnhanced from '@/pages/admin/AdminCategoriesEnhanced';
import AdminCouponsEnhanced from '@/pages/admin/AdminCouponsEnhanced';
import AdminBrandsEnhanced from '@/pages/admin/AdminBrandsEnhanced';
import AdminActivityDashboard from '@/pages/admin/AdminActivityDashboard';
import AdminProfiles from '@/pages/admin/AdminProfiles';
import AdminReports from '@/pages/admin/AdminReports';
import AdminNotifications from '@/pages/admin/AdminNotifications';

import StaticPage from '@/pages/StaticPage';

// Blog
import BlogPage from '@/pages/BlogPage';
import BlogPostPage from '@/pages/BlogPostPage';

// Wishlist
import WishlistPage from '@/pages/WishlistPage';

// Notifications
import NotificationsPage from '@/pages/NotificationsPage';

// Seller Store
import SellerStorePage from '@/pages/SellerStorePage';

// Search
import SearchPage from '@/pages/SearchPage';

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/products" element={<PageTransition><ProductsPage /></PageTransition>} />
        <Route path="/categories" element={<PageTransition><CategoriesPage /></PageTransition>} />
        <Route path="/category/:slug" element={<PageTransition><ProductsPage /></PageTransition>} />
        <Route path="/product/:slug" element={<PageTransition><ProductDetailPage /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><CartPage /></PageTransition>} />
        <Route path="/flash-sale" element={<PageTransition><ProductsPage /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><AuthPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><AuthPage /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
        <Route path="/wishlist" element={<PageTransition><WishlistPage /></PageTransition>} />
        <Route path="/notifications" element={<PageTransition><NotificationsPage /></PageTransition>} />
        <Route path="/store/:slug" element={<PageTransition><SellerStorePage /></PageTransition>} />
        <Route path="/help" element={<PageTransition><HelpPage /></PageTransition>} />
        <Route path="/search" element={<PageTransition><SearchPage /></PageTransition>} />

        {/* Protected Routes */}
        <Route path="/checkout" element={<ProtectedRoute><PageTransition><CheckoutPage /></PageTransition></ProtectedRoute>} />
        <Route path="/order-success" element={<ProtectedRoute><PageTransition><OrderSuccessPage /></PageTransition></ProtectedRoute>} />

        {/* User Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><PageTransition><UserDashboard /></PageTransition></ProtectedRoute>}>
          <Route index element={<DashboardOverview />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="wallet" element={<DashboardWalletPage />} />
          <Route path="wishlist" element={<DashboardWishlistPage />} />
          <Route path="addresses" element={<AddressesPage />} />
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="security" element={<SecurityPage />} />
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
          <Route path="users" element={<AdminUsersEnhanced />} />
          <Route path="sellers" element={<AdminSellers />} />
          <Route path="products" element={<AdminProductsEnhanced />} />
          <Route path="orders" element={<AdminOrdersEnhanced />} />
          <Route path="advanced-orders" element={<AdminAdvancedOrders />} />
          <Route path="products-basic" element={<AdminProducts />} />
          <Route path="orders-basic" element={<AdminOrders />} />
          <Route path="users-basic" element={<AdminUsers />} />
          <Route path="categories" element={<AdminCategoriesEnhanced />} />
          <Route path="brands" element={<AdminBrandsEnhanced />} />
          <Route path="coupons" element={<AdminCouponsEnhanced />} />
          <Route path="categories-basic" element={<AdminCategories />} />
          <Route path="brands-basic" element={<AdminBrands />} />
          <Route path="coupons-basic" element={<AdminCoupons />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="activity" element={<AdminActivityDashboard />} />
          <Route path="profiles" element={<AdminProfiles />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="finance" element={<AdminFinance />} />
          <Route path="seller-governance" element={<AdminSellerGovernance />} />
          <Route path="fraud" element={<AdminFraudDetection />} />
          <Route path="couriers" element={<AdminCouriers />} />
          <Route path="campaigns" element={<AdminCampaigns />} />
          <Route path="system-health" element={<AdminSystemHealth />} />
          <Route path="ai-suggestions" element={<AdminAISuggestions />} />
          <Route path="refunds" element={<AdminRefunds />} />
          <Route path="wallets" element={<AdminWallets />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="backup" element={<Suspense fallback={<div className="flex items-center justify-center py-16"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>}><AdminBackup /></Suspense>} />
          <Route path="role-presets" element={<Suspense fallback={<div className="flex items-center justify-center py-16"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>}><AdminRolePresets /></Suspense>} />
          <Route path="master-data" element={<Suspense fallback={<div className="flex items-center justify-center py-16"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>}><AdminMasterData /></Suspense>} />
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
