import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Link, useLocation } from "react-router-dom";
import api from "@/lib/api";
import {
  LayoutDashboard, Package, Users, FileText, ShoppingCart, UserPlus,
  Search, BarChart3, Calendar, Star, History, Bot, Bell, LogOut,
  Wrench, ChevronRight, Truck, CreditCard, Settings, User,
  ClipboardList, CalendarCheck, DollarSign, Receipt, MapPin, MessageSquare,
  Sun, Moon, HelpCircle, LifeBuoy
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem { label: string; path: string; icon: ReactNode; }

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [supportUnread, setSupportUnread] = useState(0);

  const fetchUnread = async () => {
    try {
      const res = await api.get('/notification');
      const unread = res.data.filter((n: any) => !n.isRead).length;
      setUnreadCount(unread);

      const supportRes = await api.get('/support/unread-count');
      setSupportUnread(supportRes.data.count);
    } catch {
      // Fail silently for background poll
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnread();
      const interval = setInterval(fetchUnread, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const role = user?.role?.toLowerCase();

  const adminNav: NavItem[] = [
    { label: "Dashboard",         path: "/admin",                    icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Staff Management",  path: "/admin/staff",              icon: <Users className="w-4 h-4" /> },
    { label: "Customers",         path: "/admin/customers",          icon: <UserPlus className="w-4 h-4" /> },
    { label: "Vendors",           path: "/admin/vendors",            icon: <Truck className="w-4 h-4" /> },
    { label: "Inventory",         path: "/admin/inventory",          icon: <Package className="w-4 h-4" /> },
    { label: "Purchase Invoices", path: "/admin/invoices",           icon: <FileText className="w-4 h-4" /> },
    { label: "Booking Approval",  path: "/admin/bookings",           icon: <CalendarCheck className="w-4 h-4" /> },
    { label: "Payments",          path: "/admin/payments",           icon: <DollarSign className="w-4 h-4" /> },
    { label: "Payment History",   path: "/admin/payment-history",    icon: <Receipt className="w-4 h-4" /> },
    { label: "Reports",           path: "/admin/reports",            icon: <BarChart3 className="w-4 h-4" /> },
    { label: "Part Requests",      path: "/admin/part-requests",      icon: <Package className="w-4 h-4" /> },
    { label: "Branches",          path: "/admin/branches",           icon: <MapPin className="w-4 h-4" /> },
    { label: "Review Moderation", path: "/admin/reviews",            icon: <MessageSquare className="w-4 h-4" /> },
    { label: "Activity Logs",     path: "/admin/activity-logs",      icon: <ClipboardList className="w-4 h-4" /> },
    { label: "FAQ Management",    path: "/admin/faq",                icon: <HelpCircle className="w-4 h-4" /> },
    { label: "Help Desk",         path: "/admin/support",            icon: <LifeBuoy className="w-4 h-4" /> },
    { label: "Settings",          path: "/admin/settings",           icon: <Settings className="w-4 h-4" /> },
  ];

    const staffNav: NavItem[] = [
      { label: "Dashboard",         path: "/staff",          icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: "Customers",         path: "/staff/customers",icon: <UserPlus className="w-4 h-4" /> },
      { label: "Sales",             path: "/staff/sales",    icon: <ShoppingCart className="w-4 h-4" /> },
      { label: "Credits",           path: "/staff/credits",  icon: <CreditCard className="w-4 h-4" /> },
      { label: "Customer Payments", path: "/staff/payments", icon: <DollarSign className="w-4 h-4" /> },
      { label: "Booking Approval",  path: "/staff/bookings", icon: <CalendarCheck className="w-4 h-4" /> },
      { label: "Search",            path: "/staff/search",   icon: <Search className="w-4 h-4" /> },
      { label: "Invoices",          path: "/staff/invoices", icon: <FileText className="w-4 h-4" /> },
      { label: "Reports",           path: "/staff/reports",  icon: <BarChart3 className="w-4 h-4" /> },
      { label: "FAQ Management",    path: "/staff/faq",      icon: <HelpCircle className="w-4 h-4" /> },
      { label: "Help Desk",         path: "/staff/support",  icon: <LifeBuoy className="w-4 h-4" /> },
    ];

  const customerNav: NavItem[] = [
    { label: "Dashboard",         path: "/customer",                  icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "My Profile",        path: "/customer/profile",          icon: <User className="w-4 h-4" /> },
    { label: "Book Appointment",  path: "/customer/appointments",     icon: <Calendar className="w-4 h-4" /> },
    { label: "Request Parts",     path: "/customer/request-parts",    icon: <Package className="w-4 h-4" /> },
    { label: "Reviews",           path: "/customer/reviews",          icon: <Star className="w-4 h-4" /> },
    { label: "History",           path: "/customer/history",          icon: <History className="w-4 h-4" /> },
    { label: "Payments",          path: "/customer/payments",         icon: <DollarSign className="w-4 h-4" /> },
    { label: "AI Predictions",    path: "/customer/predictions",      icon: <Bot className="w-4 h-4" /> },
    { label: "Notifications",     path: "/customer/notifications",    icon: <Bell className="w-4 h-4" /> },
    { label: "Knowledge Base",    path: "/customer/faq",              icon: <HelpCircle className="w-4 h-4" /> },
    { label: "Support",           path: "/customer/support",          icon: <LifeBuoy className="w-4 h-4" /> },
    { label: "About Us",          path: "/customer/about",            icon: <Wrench className="w-4 h-4" /> },
  ];

  const navItems = role === "admin" ? adminNav : role === "staff" ? staffNav : customerNav;

  const notificationPath = role === "admin"
    ? "/admin/notifications"
    : role === "staff"
    ? "/staff/notifications"
    : "/customer/notifications";

  const currentPage = navItems.find(n => n.path === location.pathname)?.label ?? "Dashboard";

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Sidebar ── */}
      <aside className={`${isCollapsed ? "w-16" : "w-60"} sidebar-bg flex flex-col fixed h-full z-20 border-r border-[hsl(var(--sidebar-border))] transition-all duration-300`}>
        {/* Brand */}
        <div className={`h-14 flex items-center ${isCollapsed ? "justify-center" : "gap-2.5 px-4"} border-b border-[hsl(var(--sidebar-border))] relative`}>
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/20">
            <img src="/icon.png" alt="VPSIMS" className="w-full h-full object-cover" />
          </div>
          {!isCollapsed && <span className="font-heading font-bold text-white text-base tracking-tight">VPSIMS</span>}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`absolute ${isCollapsed ? "-right-3" : "-right-3"} top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white border-2 border-[hsl(var(--sidebar-border))] z-30 hover:scale-110 transition-all`}
          >
            <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${isCollapsed ? "" : "rotate-180"}`} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : ""}
                className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-3"} py-2 rounded-lg text-[13px] font-medium transition-all ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-white"
                }`}
              >
                {item.icon}
                {!isCollapsed && <span className="flex-1">{item.label}</span>}
                {item.label === "Notifications" && unreadCount > 0 && (
                  <span className={`${isCollapsed ? "absolute top-1 right-1" : ""} bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm`}>
                    {unreadCount}
                  </span>
                )}
                {(item.label === "Help Desk" || item.label === "Support") && supportUnread > 0 && (
                  <span className={`${isCollapsed ? "absolute top-1 right-1" : ""} bg-primary text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm`}>
                    {supportUnread}
                  </span>
                )}
                {!isCollapsed && isActive && item.label !== "Notifications" && <ChevronRight className="w-3 h-3 opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* User + Controls */}
        <div className="p-3 border-t border-[hsl(var(--sidebar-border))] space-y-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={isCollapsed ? (theme === "light" ? "Dark Mode" : "Light Mode") : ""}
            className={`w-full flex items-center ${isCollapsed ? "justify-center" : "gap-2.5 px-3"} py-2 rounded-lg text-[13px] font-medium text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-white transition-all`}
          >
            {theme === "light" ? (
              <><Moon className="w-4 h-4" />{!isCollapsed && <span>Dark Mode</span>}</>
            ) : (
              <><Sun className="w-4 h-4" />{!isCollapsed && <span>Light Mode</span>}</>
            )}
          </button>

          {/* User */}
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2.5 px-3"} py-2 relative group`}>
            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white truncate leading-none">{user?.name}</p>
                <p className="text-[11px] text-[hsl(var(--sidebar-foreground))] capitalize mt-0.5">{user?.role}</p>
              </div>
            )}
            {!isCollapsed && (
              <button
                onClick={logout}
                className="p-1 rounded-md text-[hsl(var(--sidebar-foreground))] hover:text-white hover:bg-[hsl(var(--sidebar-hover))] transition-all"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-[11px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {user?.name} ({user?.role})
              </div>
            )}
          </div>
          {isCollapsed && (
             <button
                onClick={logout}
                className="w-full flex items-center justify-center py-2 rounded-lg text-[hsl(var(--sidebar-foreground))] hover:text-white hover:bg-[hsl(var(--sidebar-hover))] transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
          )}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className={`flex-1 ${isCollapsed ? "ml-16" : "ml-60"} flex flex-col min-h-screen transition-all duration-300`}>
        {/* Top Header — Admin & Staff only */}
        {role !== "customer" && (
          <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground capitalize">{role}</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">{currentPage}</span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Link
                to={notificationPath}
                className="relative w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                title="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-card ring-0">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              <div className="w-px h-6 bg-border mx-1" />
              <div className="flex items-center gap-2 pl-1">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-foreground leading-none">{user?.name}</p>
                  <p className="text-[11px] text-muted-foreground capitalize mt-0.5">{user?.role}</p>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
