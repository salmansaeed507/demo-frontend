import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CustomerSupportLayout from "./customer-support/CustomerSupportLayout";
import AdminLayout from "./customer-support/AdminLayout";
import SupportHomePage from "./customer-support/SupportHomePage";
import LoginPage from "./customer-support/pages/LoginPage";
import ChatPage from "./customer-support/pages/ChatPage";
import ProductDetailPage from "./customer-support/pages/ProductDetailPage";
import CartPage from "./customer-support/pages/CartPage";
import CheckoutPage from "./customer-support/pages/CheckoutPage";
import OrderConfirmationPage from "./customer-support/pages/OrderConfirmationPage";
import AdminOverviewPage from "./customer-support/pages/admin/AdminOverviewPage";
import ConversationsPage from "./customer-support/pages/admin/ConversationsPage";
import TicketsPage from "./customer-support/pages/admin/TicketsPage";
import KnowledgeBasePage from "./customer-support/pages/admin/KnowledgeBasePage";
import AnalyticsPage from "./customer-support/pages/admin/AnalyticsPage";
import {
  GenericNotFoundPage,
  ShopPilotNotFoundPage,
} from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
          <Route path="login" element={<LoginPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="conversations" element={<ConversationsPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="knowledge-base" element={<KnowledgeBasePage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route
              path="*"
              element={<ShopPilotNotFoundPage withShell={false} />}
            />
          </Route>
          <Route path="*" element={<ShopPilotNotFoundPage />} />
        </Route>
        <Route path="*" element={<GenericNotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
