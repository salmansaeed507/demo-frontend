import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";


import AuthBootstrap from "./auth/AuthBootstrap";
import RequireAuth from "./auth/RequireAuth";
import HomePage from "./pages/HomePage";
import HubLoginPage from "./pages/HubLoginPage";
import CustomerSupportLayout from "./customer-support/CustomerSupportLayout";
import AdminLayout from "./customer-support/AdminLayout";
import SupportHomePage from "./customer-support/SupportHomePage";
import CartPage from "./customer-support/pages/CartPage";
import CheckoutPage from "./customer-support/pages/CheckoutPage";
import OrderConfirmationPage from "./customer-support/pages/OrderConfirmationPage";
import OrdersPanel from "./customer-support/admin/OrdersPanel";
import ProductsPanel from "./customer-support/admin/ProductsPanel";
import RagPanel from "./customer-support/admin/RagPanel";
import TicketsPanel from "./customer-support/admin/TicketsPanel";
import {
  GenericNotFoundPage,
  GadgetGroveNotFoundPage,
} from "./pages/NotFoundPage";
import { apiGatewayClient } from "./api/client";

import { HttpAgent } from "@copilotkit/react-core/v2";

const agent = new HttpAgent({
  url: "http://localhost:5070/support/agent",
});

function App() {
  return (
    <CopilotKitProvider
      agents__unsafe_dev_only={{ default: agent }}
      headers={() => {
        const token = apiGatewayClient.getAuthToken();
        return { Authorization: `Bearer ${token}` }
      }}
    >
      <BrowserRouter>
        <AuthBootstrap />
        <Routes>
          <Route path="/login" element={<HubLoginPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/gadget-grove" element={<CustomerSupportLayout />}>
              <Route index element={<SupportHomePage />} />
              <Route path="cart" element={<CartPage />} />            <Route path="checkout" element={<CheckoutPage />} />
              <Route
                path="order-confirmation"
                element={<OrderConfirmationPage />}
              />
              <Route path="login" element={<Navigate to="/gadget-grove" replace />} />
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="knowledge" replace />} />
                <Route path="knowledge" element={<RagPanel />} />
                <Route path="tickets" element={<TicketsPanel />} />
                <Route path="orders" element={<OrdersPanel />} />
                <Route path="products" element={<ProductsPanel />} />
              </Route>
              <Route path="*" element={<GadgetGroveNotFoundPage />} />
            </Route>
            <Route path="*" element={<GenericNotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CopilotKitProvider>
  );
}

export default App;
