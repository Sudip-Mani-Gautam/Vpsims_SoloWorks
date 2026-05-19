import { ReactNode, useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Link, useLocation } from "react-router-dom";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, Users, FileText, ShoppingCart, UserPlus,
  Search, BarChart3, Calendar, Star, History, Bot, Bell, LogOut,
  Wrench, ChevronRight, Truck, CreditCard, Settings, User,
  ClipboardList, CalendarCheck, DollarSign, Receipt, MapPin, MessageSquare,
  Sun, Moon, HelpCircle, LifeBuoy, Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem { label: string; path: string; icon: ReactNode; }

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [supportUnread, setSupportUnread] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showBellMenu, setShowBellMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setShowBellMenu(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUnread = async () => {
    try {
      const res = await api.get('/notification');
      setNotifications(res.data);
      const unread = res.data.filter((n: any) => !n.isRead).length;
      setUnreadCount(unread);

      const supportRes = await api.get('/support/unread-count');
      setSupportUnread(supportRes.data.count);

      if (user.role === 'Admin' || user.role === 'admin' || user.role === 'Staff' || user.role === 'staff') {
        try {
          const bookingRes = await api.get('/booking/pending-count');
          setPendingBookings(bookingRes.data.count);
        } catch { }
      }
    } catch {
      // Fail silently for background poll
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnread();
      const interval = setInterval(fetchUnread, 15000); // Poll every 15s
      const handleForceFetch = () => fetchUnread();
      const handleOptimistic = () => setSupportUnread(prev => Math.max(0, prev - 1));
      
      window.addEventListener('refetchUnread', handleForceFetch);
      window.addEventListener('optimisticSupportRead', handleOptimistic);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('refetchUnread', handleForceFetch);
        window.removeEventListener('optimisticSupportRead', handleOptimistic);
      };
    }
  }, [user]);

  const role = user?.role?.toLowerCase();

  const adminNav: NavItem[] = [
    { label: "Dashboard",         path: "/admin",                    icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Staff Management",  path: "/admin/staff",              icon: <Users className="w-4 h-4" /> },
    { label: "Customers",         path: "/admin/customers",          icon: <UserPlus className="w-4 h-4" /> },
    { label: "Vendors",           path: "/admin/vendors",            icon: <Truck className="w-4 h-4" /> },
    { label: "Inventory",         path: "/admin/inventory",          icon: <Package className="w-4 h-4" /> },
    { label: "Sales & Orders",    path: "/staff/sales",              icon: <ShoppingCart className="w-4 h-4" /> },
    { label: "Sales Invoices",    path: "/admin/sales-invoices",      icon: <FileText className="w-4 h-4" /> },
    { label: "Purchase Invoices", path: "/admin/purchase-invoices",   icon: <Receipt className="w-4 h-4" /> },
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
    { label: "AI Predictions",    path: "/admin/ai-predictions",     icon: <Brain className="w-4 h-4" /> },
    { label: "Settings",          path: "/admin/settings",           icon: <Settings className="w-4 h-4" /> },
  ];

    const staffNav: NavItem[] = [
      { label: "Dashboard",         path: "/staff",          icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: "Customers",         path: "/staff/customers",icon: <UserPlus className="w-4 h-4" /> },
      { label: "Sales & Orders",    path: "/staff/sales",    icon: <ShoppingCart className="w-4 h-4" /> },
      { label: "Credits",           path: "/staff/credits",  icon: <CreditCard className="w-4 h-4" /> },
      { label: "Customer Payments", path: "/staff/payments", icon: <DollarSign className="w-4 h-4" /> },
      { label: "Booking Approval",  path: "/staff/bookings", icon: <CalendarCheck className="w-4 h-4" /> },
      { label: "Search",            path: "/staff/search",   icon: <Search className="w-4 h-4" /> },
      { label: "Sales Invoices",    path: "/staff/sales-invoices", icon: <FileText className="w-4 h-4" /> },
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
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto custom-scrollbar">
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
                {item.label === "Booking Approval" && pendingBookings > 0 && (
                  <span className={`${isCollapsed ? "absolute top-1 right-1" : ""} bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm`}>
                    {pendingBookings}
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

        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className={`flex-1 ${isCollapsed ? "ml-16" : "ml-60"} flex flex-col min-h-screen transition-all duration-300`}>
        {/* Top Header */}
        <header className="h-11 bg-card border-b border-border flex items-center justify-between px-5 sticky top-0 z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10 shrink-0">{role}</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
              <Link to={role === 'admin' ? '/admin' : role === 'staff' ? '/staff' : '/customer'} className="text-[13px] font-medium text-muted-foreground hover:text-primary transition-colors shrink-0">Dashboard</Link>
              {currentPage !== "Dashboard" && (
                <>
                  <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                  <span className="text-[13px] font-bold text-foreground truncate">{currentPage}</span>
                </>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Bell Notification Dropdown */}
              <div className="relative" ref={bellRef}>
                <button
                  onClick={() => { setShowBellMenu(v => !v); setShowUserMenu(false); }}
                  className="relative w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-card">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {showBellMenu && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-[340px] border border-border rounded-xl shadow-2xl z-[100] overflow-hidden ring-1 ring-black/5"
                    style={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', opacity: 1, display: 'block' }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                      <span className="text-[13px] font-bold text-foreground">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>

                    {/* Notification Items (top 9) */}
                    <div 
                      className="max-h-[360px] overflow-y-auto divide-y divide-border/60 !bg-white dark:!bg-slate-950"
                      style={{ background: theme === 'dark' ? '#0f172a' : '#ffffff', opacity: 1 }}
                    >
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center">
                          <Bell className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-[12px] text-muted-foreground">No notifications yet</p>
                        </div>
                      ) : notifications.slice(0, 9).map((n: any) => (
                        <div key={n.id} className="!bg-white dark:!bg-slate-950">
                          <Link
                            to={notificationPath}
                            onClick={() => setShowBellMenu(false)}
                            className={cn(
                              "flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors",
                              !n.isRead ? "bg-primary/[0.05]" : "!bg-white dark:!bg-slate-950"
                            )}
                            style={{ background: !n.isRead ? undefined : (theme === 'dark' ? '#0f172a' : '#ffffff') }}
                          >
                            {!n.isRead && (
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            )}
                            {n.isRead && <span className="mt-1.5 w-1.5 h-1.5 shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-wider text-primary/80 mb-0.5">{n.title}</p>
                              <p className={cn(
                                "text-[12px] leading-snug truncate",
                                !n.isRead ? "font-semibold text-foreground" : "text-muted-foreground"
                              )}>{n.message}</p>
                            </div>
                            <span className="text-[10px] text-muted-foreground/60 shrink-0 mt-0.5 whitespace-nowrap">
                              {(() => {
                                const d = new Date(n.createdAt);
                                const diff = Date.now() - d.getTime();
                                const m = Math.floor(diff / 60000);
                                if (m < 1) return "Now";
                                if (m < 60) return `${m}m`;
                                const h = Math.floor(m / 60);
                                if (h < 24) return `${h}h`;
                                return d.toLocaleDateString();
                              })()}
                            </span>
                          </Link>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border">
                      <Link
                        to={notificationPath}
                        onClick={() => setShowBellMenu(false)}
                        className="flex items-center justify-center gap-1.5 w-full py-2.5 text-[12px] font-bold text-primary hover:bg-muted transition-colors"
                      >
                        {notifications.length > 9 ? `Show all ${notifications.length} notifications` : "View all notifications"}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              <div className="w-px h-6 bg-border mx-1" />
              {/* User Avatar with Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  className="flex items-center gap-2 pl-1 rounded-lg hover:bg-muted px-2 py-1.5 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold ring-2 ring-primary/20">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-foreground leading-none">{user?.name}</p>
                    <p className="text-[11px] text-muted-foreground capitalize mt-0.5">{user?.role}</p>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground/50 transition-transform duration-200 hidden sm:block ${showUserMenu ? "rotate-90" : ""}`} />
                </button>

                {/* Dropdown Panel */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {/* Profile Info */}
                    <div className="px-4 py-3 border-b border-border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                          {user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-foreground">{user?.name}</p>
                          <p className="text-[11px] text-muted-foreground capitalize">{user?.role}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        to={notificationPath}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center justify-between px-4 py-2.5 text-[13px] font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Bell className="w-4 h-4 text-muted-foreground" />
                          Notifications
                        </div>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </Link>
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-border py-1">
                      <button
                        onClick={() => { setShowUserMenu(false); logout(); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

        {/* Page Content */}
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
