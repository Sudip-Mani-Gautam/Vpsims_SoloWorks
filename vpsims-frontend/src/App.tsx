import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import DashboardLayout from "@/components/DashboardLayout";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";

// --- Admin Pages ---
import AdminDashboard from "@/pages/admin/AdminDashboard";
import InventoryManagement from "@/pages/admin/InventoryManagement";
import VendorManagement from "@/pages/admin/VendorManagement";
import ActivityLogs from "@/pages/admin/ActivityLogs";
import AdminNotifications from "@/pages/admin/AdminNotifications";
import AdminReports from "@/pages/admin/AdminReports";
import AdminSettings from "@/pages/admin/AdminSettings";
import BookingApproval from "@/pages/admin/BookingApproval";
import PaymentHistory from "@/pages/admin/PaymentHistory";
import PaymentDetailsManagement from "@/pages/admin/PaymentDetailsManagement";
import PurchaseInvoices from "@/pages/admin/PurchaseInvoices";
import SalesInvoices from "@/pages/admin/SalesInvoices";
import NewSalesInvoice from "@/pages/admin/NewSalesInvoice";
import StaffManagement from "@/pages/admin/StaffManagement";
import BranchManagement from "@/pages/admin/BranchManagement";
import BranchConfiguration from "@/pages/admin/BranchConfiguration";
import ReviewModeration from "@/pages/admin/ReviewModeration";
import PartRequestManagement from "@/pages/admin/PartRequestManagement";
import PartRequestDetails from "@/pages/admin/PartRequestDetails";
import FAQManagement from "@/pages/admin/FAQManagement";
import AdminSupportManagement from "@/pages/admin/AdminSupportManagement";
import SupportTicketDetail from "@/pages/shared/SupportTicketDetail";
import RevenueAnalytics from "@/pages/admin/RevenueAnalytics";
import AdminAIPredictions from "@/pages/admin/AdminAIPredictions";

// --- Staff Pages ---
import SalesPage from "@/pages/staff/SalesPage";
import CreditManagement from "@/pages/staff/CreditManagement";
import CustomerDetailPage from "@/pages/staff/CustomerDetailPage";
import CustomerManagement from "@/pages/staff/CustomerManagement";
import SearchPage from "@/pages/staff/SearchPage";
import StaffDashboard from "@/pages/staff/StaffDashboard";
import StaffInvoices from "@/pages/staff/StaffInvoices";
import StaffReports from "@/pages/staff/StaffReports";
import StaffSupportTickets from "@/pages/staff/StaffSupportTickets";
import TodaysSalesPage from "@/pages/staff/TodaysSalesPage";
import CustomersServedPage from "@/pages/staff/CustomersServedPage";
import InvoicesCreatedPage from "@/pages/staff/InvoicesCreatedPage";
import StaffPaymentView from "@/pages/staff/StaffPaymentView";
import StaffNotifications from "@/pages/staff/StaffNotifications";

// --- Customer Pages ---
import AboutPage from "@/pages/customer/AboutPage";
import AppointmentPage from "@/pages/customer/AppointmentPage";
import CustomerDashboard from "@/pages/customer/CustomerDashboard";
import HistoryPage from "@/pages/customer/HistoryPage";
import NotificationsPage from "@/pages/customer/NotificationsPage";
import FAQPage from "@/pages/customer/FAQPage";
import CustomerSupportPage from "@/pages/customer/CustomerSupportPage";
import CustomerPaymentPage from "@/pages/customer/CustomerPaymentPage";
import PaymentSuccessPage from "@/pages/customer/PaymentSuccessPage";
import PredictionsPage from "@/pages/customer/PredictionsPage";
import ProfilePage from "@/pages/customer/ProfilePage";
import RequestPartsPage from "@/pages/customer/RequestPartsPage";
import ReviewsPage from "@/pages/customer/ReviewsPage";
import OperatingProcedures from "@/pages/legal/OperatingProcedures";
import SecurityProtocols from "@/pages/legal/SecurityProtocols";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Public Legal Routes (accessible without login)
  if (location.pathname.startsWith('/legal')) {
    return (
      <Routes>
        <Route path="/legal/procedures" element={<OperatingProcedures />} />
        <Route path="/legal/security" element={<SecurityProtocols />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (!isAuthenticated) return <LoginPage />;

  const role = user?.role?.toLowerCase();
  const homeRoute = role === "admin" ? "/admin" : role === "staff" ? "/staff" : "/customer";

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to={homeRoute} replace />} />
        
        {/* Shared / Redirects */}
        <Route path="/dashboard" element={<Navigate to={homeRoute} replace />} />
        
        {/* --- Admin Sector --- */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/staff" element={<StaffManagement />} />
        <Route path="/admin/customers" element={<CustomerManagement />} />
        <Route path="/admin/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/admin/vendors" element={<VendorManagement />} />
        <Route path="/admin/inventory" element={<InventoryManagement />} />
        <Route path="/admin/sales-invoices">
          <Route index element={<SalesInvoices />} />
          <Route path="new" element={<NewSalesInvoice />} />
        </Route>
        <Route path="/admin/purchase-invoices" element={<PurchaseInvoices />} />
        <Route path="/admin/bookings" element={<BookingApproval />} />
        <Route path="/admin/payments" element={<PaymentDetailsManagement />} />
        <Route path="/admin/payment-history" element={<PaymentHistory />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/ai-predictions" element={<AdminAIPredictions />} />
        <Route path="/admin/revenue" element={<RevenueAnalytics />} />
        
        {/* Branches */}
        <Route path="/admin/branches">
          <Route index element={<BranchManagement />} />
          <Route path=":id" element={<BranchConfiguration />} />
        </Route>
        
        <Route path="/admin/reviews" element={<ReviewModeration />} />
        <Route path="/admin/part-requests" element={<PartRequestManagement />} />
        <Route path="/admin/part-requests/:id" element={<PartRequestDetails />} />
        <Route path="/admin/activity-logs" element={<ActivityLogs />} />
        <Route path="/admin/faq" element={<FAQManagement />} />
        <Route path="/admin/support" element={<AdminSupportManagement />} />
        <Route path="/admin/support/:id" element={<SupportTicketDetail />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        
        {/* --- Staff Sector --- */}
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/staff/todays-sales" element={<TodaysSalesPage />} />
        <Route path="/staff/customers-served" element={<CustomersServedPage />} />
        <Route path="/staff/invoices-created" element={<InvoicesCreatedPage />} />
        <Route path="/staff/customers" element={<CustomerManagement />} />
        <Route path="/staff/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/staff/sales" element={<SalesPage />} />
        <Route path="/staff/credits" element={<CreditManagement />} />
        <Route path="/staff/bookings" element={<BookingApproval />} /> {/* Reusing admin components if applicable, but we have staff components. Wait, template uses /admin/bookings for admin. I'll use it since there wasn't a StaffBooking Approval */}
        <Route path="/staff/search" element={<SearchPage />} />
        <Route path="/staff/sales-invoices">
          <Route index element={<StaffInvoices />} />
          <Route path="new" element={<NewSalesInvoice />} />
        </Route>
        <Route path="/staff/reports" element={<StaffReports />} />
        <Route path="/staff/support" element={<StaffSupportTickets />} />
        <Route path="/staff/faq" element={<FAQManagement />} />
        <Route path="/staff/support/:id" element={<SupportTicketDetail />} />
        <Route path="/staff/payments" element={<StaffPaymentView />} />
        <Route path="/staff/notifications" element={<StaffNotifications />} />
        
        {/* --- Customer Sector --- */}
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/customer/profile" element={<ProfilePage />} />
        <Route path="/customer/appointments" element={<AppointmentPage />} />
        <Route path="/customer/request-parts" element={<RequestPartsPage />} />
        <Route path="/customer/reviews" element={<ReviewsPage />} />
        <Route path="/customer/history" element={<HistoryPage />} />
        <Route path="/customer/payments" element={<CustomerPaymentPage />} />
        <Route path="/customer/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/customer/predictions" element={<PredictionsPage />} />
        <Route path="/customer/notifications" element={<NotificationsPage />} />
        <Route path="/customer/faq" element={<FAQPage />} />
        <Route path="/customer/support" element={<CustomerSupportPage />} />
        <Route path="/customer/support/:id" element={<SupportTicketDetail />} />
        <Route path="/customer/about" element={<AboutPage />} />

        {/* Legacy Mapping for Smooth Transition */}
        <Route path="/parts" element={<Navigate to="/admin/inventory" replace />} />
        <Route path="/suppliers" element={<Navigate to="/admin/vendors" replace />} />
        <Route path="/orders" element={<Navigate to="/staff/sales" replace />} />
        
        {/* Module Under Construction / Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DashboardLayout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="bottom-right" richColors closeButton />
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
