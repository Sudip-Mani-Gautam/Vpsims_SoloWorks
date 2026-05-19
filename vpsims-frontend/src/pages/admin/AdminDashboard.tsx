import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package, Users, DollarSign, AlertTriangle, TrendingUp, FileText,
  Activity, BarChart3, Loader2, CalendarCheck, MapPin, MessageSquare,
  ClipboardList, Receipt, Truck, ChevronRight
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DashboardData {
  totalRevenue: number;
  revenueTrend: string;
  totalInventoryUnits: number;
  inventoryTrend: string;
  activePersonnel: number;
  criticalShortages: number;
  lowStockTrend: string;
  unpaidInvoicesCount: number;
  unpaidInvoicesAmount: number;
  unpaidInvoicesTrend: string;
  financialTrajectory: { month: string; sales: number; profit: number }[];
  sectorStatus: { label: string; status: string; val: number }[];
  recentOperations: { text: string; time: string; type: string }[];
  lowStockItems: { name: string; sku: string; stockQuantity: number }[];
}

const now = new Date();
const greeting =
  now.getHours() < 12 ? "Good morning" :
  now.getHours() < 17 ? "Good afternoon" : "Good evening";
const dateStr = now.toLocaleDateString("en-US", {
  weekday: "long", year: "numeric", month: "long", day: "numeric"
});

const AdminDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get("/dashboard/admin-stats");
        setData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-7 h-7 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  const salesData = data?.financialTrajectory || [];
  const lowStock = data?.lowStockItems || [];

  const stats = {
    sectorStatus: data?.sectorStatus || [],
    items: [
      {
        label: "Total Revenue",
        value: `NPR ${(data?.totalRevenue ?? 0).toLocaleString()}`,
        sub: data?.revenueTrend ? `↑ ${data.revenueTrend}` : "All collected",
        icon: <DollarSign className="w-4 h-4" />,
        color: "text-emerald-600",
        bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800",
      },
      {
        label: "Parts in Stock",
        value: (data?.totalInventoryUnits ?? 0).toLocaleString(),
        sub: `${data?.inventoryTrend ?? ""} units available`,
        icon: <Package className="w-4 h-4" />,
        color: "text-sky-600",
        bg: "bg-sky-50 border-sky-200 dark:bg-sky-950 dark:border-sky-800",
      },
      {
        label: "Active Staff",
        value: (data?.activePersonnel ?? 0).toString(),
        sub: "Currently on duty",
        icon: <Users className="w-4 h-4" />,
        color: "text-blue-600",
        bg: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
      },
      {
        label: "Low Stock Alerts",
        value: (data?.criticalShortages ?? 0).toString(),
        sub: data?.criticalShortages === 0 ? "All stock healthy" : "Items need restocking",
        icon: <AlertTriangle className="w-4 h-4" />,
        color: data?.criticalShortages === 0 ? "text-emerald-600" : "text-red-600",
        bg: data?.criticalShortages === 0
          ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800"
          : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
      },
      {
        label: "Unpaid Invoices",
        value: (data?.unpaidInvoicesCount ?? 0).toString(),
        sub: data?.unpaidInvoicesCount === 0 ? "All invoices paid" : data?.unpaidInvoicesTrend ?? "",
        icon: <FileText className="w-4 h-4" />,
        color: data?.unpaidInvoicesCount === 0 ? "text-emerald-600" : "text-amber-600",
        bg: data?.unpaidInvoicesCount === 0
          ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800"
          : "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800",
      },
    ]
  };

  const modules = [
    { to: "/admin/staff",           icon: <Users className="w-5 h-5" />,         label: "Staff",       color: "text-blue-600",    bg: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800" },
    { to: "/admin/customers",       icon: <Users className="w-5 h-5" />,         label: "Customers",   color: "text-indigo-600",  bg: "bg-indigo-50 border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800" },
    { to: "/admin/vendors",         icon: <Truck className="w-5 h-5" />,          label: "Vendors",     color: "text-violet-600",  bg: "bg-violet-50 border-violet-200 dark:bg-violet-950 dark:border-violet-800" },
    { to: "/admin/inventory",       icon: <Package className="w-5 h-5" />,        label: "Inventory",   color: "text-cyan-600",    bg: "bg-cyan-50 border-cyan-200 dark:bg-cyan-950 dark:border-cyan-800" },
    { to: "/admin/sales-invoices",    icon: <FileText className="w-5 h-5" />,       label: "Sales Inv",    color: "text-amber-600",   bg: "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800" },
    { to: "/admin/purchase-invoices", icon: <Receipt className="w-5 h-5" />,        label: "Purchase Inv", color: "text-rose-600",    bg: "bg-rose-50 border-rose-200 dark:bg-rose-950 dark:border-rose-800" },
    { to: "/admin/bookings",        icon: <CalendarCheck className="w-5 h-5" />,  label: "Bookings",    color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800" },
    { to: "/admin/payments",        icon: <DollarSign className="w-5 h-5" />,     label: "Payments",    color: "text-green-600",   bg: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" },
    { to: "/admin/payment-history", icon: <Receipt className="w-5 h-5" />,        label: "Pay History", color: "text-teal-600",    bg: "bg-teal-50 border-teal-200 dark:bg-teal-950 dark:border-teal-800" },
    { to: "/admin/reports",         icon: <BarChart3 className="w-5 h-5" />,      label: "Reports",     color: "text-indigo-600",  bg: "bg-indigo-50 border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800" },
    { to: "/admin/branches",        icon: <MapPin className="w-5 h-5" />,         label: "Branches",    color: "text-red-600",     bg: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800" },
    { to: "/admin/reviews",         icon: <MessageSquare className="w-5 h-5" />,  label: "Reviews",     color: "text-pink-600",    bg: "bg-pink-50 border-pink-200 dark:bg-pink-950 dark:border-pink-800" },
    { to: "/admin/activity-logs",   icon: <ClipboardList className="w-5 h-5" />,  label: "Logs",        color: "text-slate-600",   bg: "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div>
          <p className="text-[11px] text-muted-foreground font-medium">{dateStr}</p>
          <h1 className="text-xl font-bold text-foreground tracking-tight">{greeting}, Admin 👋</h1>
          <p className="text-xs text-muted-foreground">Here's what's happening across VPSIMS today.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.items.map((s, i) => (
          <Link 
            key={s.label} 
            to={
              s.label === "Total Revenue" ? "/admin/revenue" :
              s.label === "Parts in Stock" ? "/admin/inventory" :
              s.label === "Active Staff" ? "/admin/staff" :
              s.label === "Low Stock Alerts" ? "/admin/reports" :
              "/admin/payment-history"
            }
            className="bg-card border border-border rounded-xl p-3 flex items-center justify-between hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all group"
          >
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <p className="text-lg font-bold text-foreground tracking-tight mt-0.5">{s.value}</p>
              <p className={cn("text-[10px] font-medium", s.color)}>{s.sub}</p>
            </div>
            <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ml-2 group-hover:scale-110 transition-transform", s.bg, s.color)}>
              {s.icon}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-card border shadow-sm rounded-xl">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">Monthly Revenue</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Sales over the past 6 months</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" /> Trending up
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={salesData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                  dy={6}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `NPR ${v.toLocaleString()}`}
                  width={75}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div style={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "10px",
                        padding: "10px 14px",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.12)"
                      }}>
                        <p style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</p>
                        <p style={{ fontSize: "15px", fontWeight: 800, color: "hsl(var(--foreground))" }}>
                          NPR {(payload[0]?.value as number)?.toLocaleString()}
                        </p>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--card))" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border shadow-sm rounded-xl">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-bold text-foreground">Sector Health</CardTitle>
            <p className="text-xs text-muted-foreground">How each part of the business is doing</p>
          </CardHeader>
          <CardContent className="pt-4 space-y-5">
            {(stats.sectorStatus || []).map((s: any) => (
              <Link 
                key={s.label} 
                to={
                  s.label.includes("Warehouse") ? "/admin/inventory" :
                  s.label.includes("Sales") ? "/admin/invoices" :
                  "/admin/vendors"
                }
                className="block space-y-1.5 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-foreground group-hover:text-primary transition-colors">{s.label}</span>
                  <span className={s.val < 50 ? "text-red-500" : s.val < 75 ? "text-amber-500" : "text-emerald-600"}>
                    {s.status}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      s.val < 50 ? "bg-red-500" : s.val < 75 ? "bg-amber-500" : "bg-emerald-500"
                    )}
                    style={{ width: `${s.val}%` }}
                  />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border shadow-sm rounded-xl">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-bold text-foreground">Quick Access</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Jump to any section of the admin panel</p>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {modules.map(({ to, icon, label, color, bg }) => (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-border bg-background hover:bg-muted hover:border-primary/30 hover:shadow-sm transition-all group"
              >
                <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-transform", bg, color)}>
                  {icon}
                </div>
                <span className="text-[11px] font-semibold text-foreground text-center">{label}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border shadow-sm rounded-xl">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">Recent Activity</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Latest actions across the system</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border max-h-72 overflow-y-auto">
              {(data?.recentOperations || []).length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">No recent activity</div>
              ) : (data?.recentOperations || []).map((activity, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
                  <div className={cn(
                    "w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5",
                    activity.type === "financial"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800"
                      : activity.type === "system"
                      ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                      : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                  )}>
                    {activity.type === "financial" ? <DollarSign className="w-3.5 h-3.5" /> :
                     activity.type === "system"    ? <Activity className="w-3.5 h-3.5" /> :
                     <Package className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground leading-snug">{activity.text}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border">
              <Button variant="ghost" size="sm" className="w-full text-primary hover:bg-primary/10 text-xs font-semibold" asChild>
                <Link to="/admin/activity-logs" className="flex items-center justify-center gap-1">
                  View all logs <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border shadow-sm rounded-xl">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">Low Stock Items</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Parts that need restocking soon</p>
              </div>
              {(data?.criticalShortages ?? 0) > 0 ? (
                <span className="bg-red-100 text-red-600 border border-red-200 dark:bg-red-950 dark:border-red-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {data?.criticalShortages} low
                </span>
              ) : (
                <span className="bg-emerald-100 text-emerald-600 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                  All good
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border max-h-72 overflow-y-auto">
              {lowStock.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">No low stock items 🎉</div>
              ) : (lowStock || []).map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-500 dark:bg-red-950 dark:border-red-800">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-base font-bold text-red-500">{item.stockQuantity}</p>
                      <p className="text-[10px] text-muted-foreground">left</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800" asChild>
                      <Link to="/admin/inventory">Restock</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border">
              <Button variant="ghost" size="sm" className="w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950 text-xs font-semibold" asChild>
                <Link to="/admin/inventory" className="flex items-center justify-center gap-1">
                  Manage inventory <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
