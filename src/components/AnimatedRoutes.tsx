import { Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, memo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './PageTransition';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Optimized loading spinner
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>
));
LoadingSpinner.displayName = 'LoadingSpinner';

// Critical pages - loaded immediately
import Index from '@/pages/Index';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import AuthPage from '@/pages/AuthPage';
import CartPage from '@/pages/CartPage';

// Lazy load less critical pages
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('@/pages/OrderSuccessPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const WishlistPage = lazy(() => import('@/pages/WishlistPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const SellerStorePage = lazy(() => import('@/pages/SellerStorePage'));
const HelpPage = lazy(() => import('@/pages/HelpPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const StaticPage = lazy(() => import('@/pages/StaticPage'));
const BlogPage = lazy(() => import('@/pages/BlogPage'));
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage'));

// User Dashboard - lazy loaded
const UserDashboard = lazy(() => import('@/pages/dashboard/UserDashboard'));
const DashboardOverview = lazy(() => import('@/pages/dashboard/DashboardOverview'));
const ProfilePage = lazy(() => import('@/pages/dashboard/ProfilePage'));
const OrdersPage = lazy(() => import('@/pages/dashboard/OrdersPage'));
const DashboardWishlistPage = lazy(() => import('@/pages/dashboard/WishlistPage'));
const AddressesPage = lazy(() => import('@/pages/dashboard/AddressesPage'));
const DashboardWalletPage = lazy(() => import('@/pages/dashboard/WalletPage'));
const CouponsPage = lazy(() => import('@/pages/dashboard/CouponsPage'));
const PaymentsPage = lazy(() => import('@/pages/dashboard/PaymentsPage'));
const SettingsPage = lazy(() => import('@/pages/dashboard/SettingsPage'));
const SecurityPage = lazy(() => import('@/pages/dashboard/SecurityPage'));

// Seller - lazy loaded
const SellerRegisterPage = lazy(() => import('@/pages/seller/SellerRegisterPage'));
const SellerDashboard = lazy(() => import('@/pages/seller/SellerDashboard'));
const SellerOverview = lazy(() => import('@/pages/seller/SellerOverview'));
const SellerProducts = lazy(() => import('@/pages/seller/SellerProducts'));
const SellerOrders = lazy(() => import('@/pages/seller/SellerOrders'));
const SellerEarnings = lazy(() => import('@/pages/seller/SellerEarnings'));
const SellerSettings = lazy(() => import('@/pages/seller/SellerSettings'));

// Admin - all lazy loaded for faster initial load
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'));
const AdminOverview = lazy(() => import('@/pages/admin/AdminOverview'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminSellers = lazy(() => import('@/pages/admin/AdminSellers'));
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders'));
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'));
const AdminBrands = lazy(() => import('@/pages/admin/AdminBrands'));
const AdminCoupons = lazy(() => import('@/pages/admin/AdminCoupons'));
const AdminPages = lazy(() => import('@/pages/admin/AdminPages'));
const AdminBlog = lazy(() => import('@/pages/admin/AdminBlog'));
const AdminInquiries = lazy(() => import('@/pages/admin/AdminInquiries'));
const AdminLogs = lazy(() => import('@/pages/admin/AdminLogs'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));
const AdminFinance = lazy(() => import('@/pages/admin/AdminFinance'));
const AdminSellerGovernance = lazy(() => import('@/pages/admin/AdminSellerGovernance'));
const AdminFraudDetection = lazy(() => import('@/pages/admin/AdminFraudDetection'));
const AdminCouriers = lazy(() => import('@/pages/admin/AdminCouriers'));
const AdminCampaigns = lazy(() => import('@/pages/admin/AdminCampaigns'));
const AdminSystemHealth = lazy(() => import('@/pages/admin/AdminSystemHealth'));
const AdminAdvancedOrders = lazy(() => import('@/pages/admin/AdminAdvancedOrders'));
const AdminAISuggestions = lazy(() => import('@/pages/admin/AdminAISuggestions'));
const AdminRefunds = lazy(() => import('@/pages/admin/AdminRefunds'));
const AdminWallets = lazy(() => import('@/pages/admin/AdminWallets'));
const AdminBanners = lazy(() => import('@/pages/admin/AdminBanners'));
const AdminOrdersEnhanced = lazy(() => import('@/pages/admin/AdminOrdersEnhanced'));
const AdminProductsEnhanced = lazy(() => import('@/pages/admin/AdminProductsEnhanced'));
const AdminUsersEnhanced = lazy(() => import('@/pages/admin/AdminUsersEnhanced'));
const AdminCategoriesEnhanced = lazy(() => import('@/pages/admin/AdminCategoriesEnhanced'));
const AdminCouponsEnhanced = lazy(() => import('@/pages/admin/AdminCouponsEnhanced'));
const AdminBrandsEnhanced = lazy(() => import('@/pages/admin/AdminBrandsEnhanced'));
const AdminActivityDashboard = lazy(() => import('@/pages/admin/AdminActivityDashboard'));
const AdminProfiles = lazy(() => import('@/pages/admin/AdminProfiles'));
const AdminReports = lazy(() => import('@/pages/admin/AdminReports'));
const AdminNotifications = lazy(() => import('@/pages/admin/AdminNotifications'));
const AdminCMS = lazy(() => import('@/pages/admin/AdminCMS'));
const AdminBackup = lazy(() => import('@/pages/admin/AdminBackup'));
const AdminRolePresets = lazy(() => import('@/pages/admin/AdminRolePresets'));
const AdminMasterData = lazy(() => import('@/pages/admin/AdminMasterData'));
const AdminInventoryAlerts = lazy(() => import('@/pages/admin/AdminInventoryAlerts'));
const AdminCustomerInsights = lazy(() => import('@/pages/admin/AdminCustomerInsights'));
const AdminScheduledActions = lazy(() => import('@/pages/admin/AdminScheduledActions'));
const AdminExportTools = lazy(() => import('@/pages/admin/AdminExportTools'));
const AdminReturnRequests = lazy(() => import('@/pages/admin/AdminReturnRequests'));

// Wrapper for lazy components
const LazyRoute = memo(({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>
    <PageTransition>{children}</PageTransition>
  </Suspense>
));
LazyRoute.displayName = 'LazyRoute';

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Critical Routes - No lazy loading */}
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/products" element={<PageTransition><ProductsPage /></PageTransition>} />
        <Route path="/product/:slug" element={<PageTransition><ProductDetailPage /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><CartPage /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><AuthPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><AuthPage /></PageTransition>} />

        {/* Lazy loaded public routes */}
        <Route path="/categories" element={<LazyRoute><CategoriesPage /></LazyRoute>} />
        <Route path="/category/:slug" element={<PageTransition><ProductsPage /></PageTransition>} />
        <Route path="/flash-sale" element={<PageTransition><ProductsPage /></PageTransition>} />
        <Route path="/forgot-password" element={<LazyRoute><ForgotPasswordPage /></LazyRoute>} />
        <Route path="/wishlist" element={<LazyRoute><WishlistPage /></LazyRoute>} />
        <Route path="/notifications" element={<LazyRoute><NotificationsPage /></LazyRoute>} />
        <Route path="/store/:slug" element={<LazyRoute><SellerStorePage /></LazyRoute>} />
        <Route path="/help" element={<LazyRoute><HelpPage /></LazyRoute>} />
        <Route path="/search" element={<LazyRoute><SearchPage /></LazyRoute>} />

        {/* Protected Routes */}
        <Route path="/checkout" element={<ProtectedRoute><LazyRoute><CheckoutPage /></LazyRoute></ProtectedRoute>} />
        <Route path="/order-success" element={<ProtectedRoute><LazyRoute><OrderSuccessPage /></LazyRoute></ProtectedRoute>} />

        {/* User Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><LazyRoute><UserDashboard /></LazyRoute></ProtectedRoute>}>
          <Route index element={<Suspense fallback={<LoadingSpinner />}><DashboardOverview /></Suspense>} />
          <Route path="profile" element={<Suspense fallback={<LoadingSpinner />}><ProfilePage /></Suspense>} />
          <Route path="orders" element={<Suspense fallback={<LoadingSpinner />}><OrdersPage /></Suspense>} />
          <Route path="wallet" element={<Suspense fallback={<LoadingSpinner />}><DashboardWalletPage /></Suspense>} />
          <Route path="wishlist" element={<Suspense fallback={<LoadingSpinner />}><DashboardWishlistPage /></Suspense>} />
          <Route path="addresses" element={<Suspense fallback={<LoadingSpinner />}><AddressesPage /></Suspense>} />
          <Route path="coupons" element={<Suspense fallback={<LoadingSpinner />}><CouponsPage /></Suspense>} />
          <Route path="payments" element={<Suspense fallback={<LoadingSpinner />}><PaymentsPage /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<LoadingSpinner />}><SettingsPage /></Suspense>} />
          <Route path="security" element={<Suspense fallback={<LoadingSpinner />}><SecurityPage /></Suspense>} />
        </Route>

        {/* Seller Routes */}
        <Route path="/seller/register" element={<ProtectedRoute><LazyRoute><SellerRegisterPage /></LazyRoute></ProtectedRoute>} />
        <Route path="/seller/dashboard" element={<ProtectedRoute requiredRole="seller"><LazyRoute><SellerDashboard /></LazyRoute></ProtectedRoute>}>
          <Route index element={<Suspense fallback={<LoadingSpinner />}><SellerOverview /></Suspense>} />
          <Route path="products" element={<Suspense fallback={<LoadingSpinner />}><SellerProducts /></Suspense>} />
          <Route path="orders" element={<Suspense fallback={<LoadingSpinner />}><SellerOrders /></Suspense>} />
          <Route path="earnings" element={<Suspense fallback={<LoadingSpinner />}><SellerEarnings /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<LoadingSpinner />}><SellerSettings /></Suspense>} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<LazyRoute><AdminLoginPage /></LazyRoute>} />
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><LazyRoute><AdminDashboard /></LazyRoute></ProtectedRoute>}>
          <Route index element={<Suspense fallback={<LoadingSpinner />}><AdminOverview /></Suspense>} />
          <Route path="menu" element={<></>} />
          <Route path="users" element={<Suspense fallback={<LoadingSpinner />}><AdminUsersEnhanced /></Suspense>} />
          <Route path="sellers" element={<Suspense fallback={<LoadingSpinner />}><AdminSellers /></Suspense>} />
          <Route path="products" element={<Suspense fallback={<LoadingSpinner />}><AdminProductsEnhanced /></Suspense>} />
          <Route path="orders" element={<Suspense fallback={<LoadingSpinner />}><AdminOrdersEnhanced /></Suspense>} />
          <Route path="advanced-orders" element={<Suspense fallback={<LoadingSpinner />}><AdminAdvancedOrders /></Suspense>} />
          <Route path="products-basic" element={<Suspense fallback={<LoadingSpinner />}><AdminProducts /></Suspense>} />
          <Route path="orders-basic" element={<Suspense fallback={<LoadingSpinner />}><AdminOrders /></Suspense>} />
          <Route path="users-basic" element={<Suspense fallback={<LoadingSpinner />}><AdminUsers /></Suspense>} />
          <Route path="categories" element={<Suspense fallback={<LoadingSpinner />}><AdminCategoriesEnhanced /></Suspense>} />
          <Route path="brands" element={<Suspense fallback={<LoadingSpinner />}><AdminBrandsEnhanced /></Suspense>} />
          <Route path="coupons" element={<Suspense fallback={<LoadingSpinner />}><AdminCouponsEnhanced /></Suspense>} />
          <Route path="categories-basic" element={<Suspense fallback={<LoadingSpinner />}><AdminCategories /></Suspense>} />
          <Route path="brands-basic" element={<Suspense fallback={<LoadingSpinner />}><AdminBrands /></Suspense>} />
          <Route path="coupons-basic" element={<Suspense fallback={<LoadingSpinner />}><AdminCoupons /></Suspense>} />
          <Route path="pages" element={<Suspense fallback={<LoadingSpinner />}><AdminPages /></Suspense>} />
          <Route path="blog" element={<Suspense fallback={<LoadingSpinner />}><AdminBlog /></Suspense>} />
          <Route path="inquiries" element={<Suspense fallback={<LoadingSpinner />}><AdminInquiries /></Suspense>} />
          <Route path="logs" element={<Suspense fallback={<LoadingSpinner />}><AdminLogs /></Suspense>} />
          <Route path="activity" element={<Suspense fallback={<LoadingSpinner />}><AdminActivityDashboard /></Suspense>} />
          <Route path="profiles" element={<Suspense fallback={<LoadingSpinner />}><AdminProfiles /></Suspense>} />
          <Route path="reports" element={<Suspense fallback={<LoadingSpinner />}><AdminReports /></Suspense>} />
          <Route path="notifications" element={<Suspense fallback={<LoadingSpinner />}><AdminNotifications /></Suspense>} />
          <Route path="finance" element={<Suspense fallback={<LoadingSpinner />}><AdminFinance /></Suspense>} />
          <Route path="seller-governance" element={<Suspense fallback={<LoadingSpinner />}><AdminSellerGovernance /></Suspense>} />
          <Route path="fraud" element={<Suspense fallback={<LoadingSpinner />}><AdminFraudDetection /></Suspense>} />
          <Route path="couriers" element={<Suspense fallback={<LoadingSpinner />}><AdminCouriers /></Suspense>} />
          <Route path="campaigns" element={<Suspense fallback={<LoadingSpinner />}><AdminCampaigns /></Suspense>} />
          <Route path="system-health" element={<Suspense fallback={<LoadingSpinner />}><AdminSystemHealth /></Suspense>} />
          <Route path="ai-suggestions" element={<Suspense fallback={<LoadingSpinner />}><AdminAISuggestions /></Suspense>} />
          <Route path="refunds" element={<Suspense fallback={<LoadingSpinner />}><AdminRefunds /></Suspense>} />
          <Route path="wallets" element={<Suspense fallback={<LoadingSpinner />}><AdminWallets /></Suspense>} />
          <Route path="banners" element={<Suspense fallback={<LoadingSpinner />}><AdminBanners /></Suspense>} />
          <Route path="backup" element={<Suspense fallback={<LoadingSpinner />}><AdminBackup /></Suspense>} />
          <Route path="role-presets" element={<Suspense fallback={<LoadingSpinner />}><AdminRolePresets /></Suspense>} />
          <Route path="master-data" element={<Suspense fallback={<LoadingSpinner />}><AdminMasterData /></Suspense>} />
          <Route path="inventory-alerts" element={<Suspense fallback={<LoadingSpinner />}><AdminInventoryAlerts /></Suspense>} />
          <Route path="customer-insights" element={<Suspense fallback={<LoadingSpinner />}><AdminCustomerInsights /></Suspense>} />
          <Route path="scheduled-actions" element={<Suspense fallback={<LoadingSpinner />}><AdminScheduledActions /></Suspense>} />
          <Route path="export-tools" element={<Suspense fallback={<LoadingSpinner />}><AdminExportTools /></Suspense>} />
          <Route path="return-requests" element={<Suspense fallback={<LoadingSpinner />}><AdminReturnRequests /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<LoadingSpinner />}><AdminSettings /></Suspense>} />
          <Route path="cms" element={<Suspense fallback={<LoadingSpinner />}><AdminCMS /></Suspense>} />
        </Route>

        {/* Static Pages */}
        <Route path="/about-us" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/contact-us" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/careers" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/blog" element={<LazyRoute><BlogPage /></LazyRoute>} />
        <Route path="/blog/:slug" element={<LazyRoute><BlogPostPage /></LazyRoute>} />
        <Route path="/faqs" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/privacy-policy" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/terms-conditions" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/track-order" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/returns-exchanges" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/refund-policy" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/shipping-info" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/seller-policy" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/payment-methods" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/help-center" element={<LazyRoute><StaticPage /></LazyRoute>} />

        <Route path="*" element={<LazyRoute><NotFound /></LazyRoute>} />
      </Routes>
    </AnimatePresence>
  );
}
