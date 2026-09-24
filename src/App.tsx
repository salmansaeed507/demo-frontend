import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthBootstrap from "./auth/AuthBootstrap";
import RequireAuth from "./auth/RequireAuth";
import HomePage from "./pages/HomePage";
import HubLoginPage from "./pages/HubLoginPage";
import CustomerSupportLayout from "./customer-support/CustomerSupportLayout";
import AdminLayout from "./customer-support/AdminLayout";
import SupportHomePage from "./customer-support/SupportHomePage";
import ProductDetailPage from "./customer-support/pages/ProductDetailPage";
import CartPage from "./customer-support/pages/CartPage";
import CheckoutPage from "./customer-support/pages/CheckoutPage";
import OrderConfirmationPage from "./customer-support/pages/OrderConfirmationPage";
import OrdersPanel from "./customer-support/admin/OrdersPanel";
import ProductsPanel from "./customer-support/admin/ProductsPanel";
import RagPanel from "./customer-support/admin/RagPanel";
import TicketsPanel from "./customer-support/admin/TicketsPanel";
import {
  GenericNotFoundPage,
  ShopPilotNotFoundPage,
} from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <AuthBootstrap />
      <Routes>
        <Route path="/login" element={<HubLoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shoppilot-ai" element={<CustomerSupportLayout />}>
            <Route index element={<SupportHomePage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route
              path="order-confirmation"
              element={<OrderConfirmationPage />}
            />
            <Route path="login" element={<Navigate to="/shoppilot-ai" replace />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="knowledge" replace />} />
              <Route path="knowledge" element={<RagPanel />} />
              <Route path="tickets" element={<TicketsPanel />} />
              <Route path="orders" element={<OrdersPanel />} />
              <Route path="products" element={<ProductsPanel />} />
            </Route>
            <Route path="*" element={<ShopPilotNotFoundPage />} />
          </Route>
          <Route path="*" element={<GenericNotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
