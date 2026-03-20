import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/storefront/HomePage.jsx';
import ShopPage from '../pages/storefront/ShopPage.jsx';
import ProductDetailPage from '../pages/storefront/ProductDetailPage.jsx';
import CartPage from '../pages/storefront/CartPage.jsx';
import CheckoutPage from '../pages/storefront/CheckoutPage.jsx';
import DashboardPage from '../pages/admin/DashboardPage.jsx';
import ProductsPage from '../pages/admin/ProductsPage.jsx';
import OrdersPage from '../pages/admin/OrdersPage.jsx';
import CMSPage from '../pages/admin/CMSPage.jsx';
import CategoriesPage from '../pages/admin/CategoriesPage.jsx';
import IndustriesPage from '../pages/admin/IndustriesPage.jsx';
import MainLayout from '../components/layout/MainLayout.jsx';
import AdminLayout from '../components/layout/AdminLayout.jsx';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="industries" element={<IndustriesPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="cms" element={<CMSPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRouter;

