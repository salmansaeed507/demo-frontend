import { Navigate } from "react-router-dom";

/** Dashboard default tab is Tickets (matches Support Dashboard reference). */
export default function AdminOverviewPage() {
  return <Navigate to="/customer-support/admin/tickets" replace />;
}
