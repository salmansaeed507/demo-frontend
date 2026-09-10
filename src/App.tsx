import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import RequireAuth from "./auth/RequireAuth";
import HomePage from "./pages/HomePage";
import HubLoginPage from "./pages/HubLoginPage";
import CustomerSupportLayout from "./customer-support/CustomerSupportLayout";
import AdminLayout from "./customer-support/AdminLayout";
import SupportHomePage from "./customer-support/SupportHomePage";
import SupportLoginPage from "./customer-support/pages/LoginPage";
import ProductDetailPage from "./customer-support/pages/ProductDetailPage";
import CartPage from "./customer-support/pages/CartPage";
import CheckoutPage from "./customer-support/pages/CheckoutPage";
import OrderConfirmationPage from "./customer-support/pages/OrderConfirmationPage";
import {
  GenericNotFoundPage,
  ShopPilotNotFoundPage,
} from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
              <Route path="login" element={<SupportLoginPage />} />
              <Route path="admin" element={<AdminLayout />} />
              <Route path="*" element={<ShopPilotNotFoundPage />} />
            </Route>
            <Route path="*" element={<GenericNotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
