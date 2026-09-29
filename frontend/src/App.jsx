import { Routes, Route } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Compare from './pages/Compare';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSelect from './pages/PaymentSelect';
import OrderTracking from './pages/OrderTracking';
import About from './pages/About';
import Contact from './pages/Contact';
import Offers from './pages/Offers';
import NotFound from './pages/NotFound';

import AdminLogin from './pages/admin/Login';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/DashboardHome';
import AdminProducts from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';
import AdminCategoryAttributes from './pages/admin/CategoryAttributes';
import AdminOrders from './pages/admin/Orders';
import AdminPaymentRequests from './pages/admin/PaymentRequests';
import AdminPaymentMethods from './pages/admin/PaymentMethods';
import AdminCoupons from './pages/admin/Coupons';
import AdminReviews from './pages/admin/Reviews';
import AdminSettings from './pages/admin/Settings';
import AdminAdmins from './pages/admin/Admins';
import AdminAuditLog from './pages/admin/AuditLog';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment/:orderId" element={<PaymentSelect />} />
        <Route path="/track-order" element={<OrderTracking />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/offers" element={<Offers />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="category-attributes" element={<AdminCategoryAttributes />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="payment-requests" element={<AdminPaymentRequests />} />
        <Route path="payment-methods" element={<AdminPaymentMethods />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="admins" element={<AdminAdmins />} />
        <Route path="audit-log" element={<AdminAuditLog />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
