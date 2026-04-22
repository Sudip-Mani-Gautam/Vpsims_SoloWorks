import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, DollarSign, AlertTriangle, TrendingUp, FileText, Activity, BarChart3, ArrowUpRight, Loader2, CalendarCheck, MapPin, MessageSquare, ClipboardList, Settings, Receipt, Truck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const AdminDashboard = () => {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/admin-stats');
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading dashboard data…</p>
      </div>
    );
  }

  const salesData = data?.financialTrajectory || [];

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Operational overview of VPSIMS</p>
        </div>
        <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg border border-border">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Real-time</span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Revenue"
          value={`NPR ${(data?.totalRevenue ?? 0).toLocaleString()}`}
          icon={<DollarSign className="w-4 h-4" />}
          trend={data?.revenueTrend ?? ''}
          trendUp
          variant="success"
        />
        <StatCard
          title="Parts in Stock"
          value={(data?.totalInventoryUnits ?? 0).toLocaleString()}
          icon={<Package className="w-4 h-4" />}
          trend={data?.inventoryTrend ?? ''}
          trendUp
          variant="info"
        />
        <StatCard
          title="Active Staff"
          value={(data?.activePersonnel ?? 0).toString()}
          icon={<Users className="w-4 h-4" />}
          variant="primary"
        />
        <StatCard
          title="Low Stock Alerts"
          value={(data?.criticalShortages ?? 0).toString()}
          icon={<AlertTriangle className="w-4 h-4" />}
          trend={data?.lowStockTrend ?? ''}
          trendUp={false}
          variant="destructive"
        />
        <StatCard
          title="Unpaid Invoices"
          value={(data?.unpaidInvoicesCount ?? 0).toString()}
          icon={<FileText className="w-4 h-4" />}
          trend={data?.unpaidInvoicesTrend ?? ''}
          trendUp={false}
          variant="warning"
        />
      </div>

      {/* ── Chart + Distribution + Command Hub ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart */}
        <Card className="lg:col-span-2 card-standard">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-subheading flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Financial Trajectory
              </CardTitle>
              <Badge variant="outline" className="badge-success text-xs font-semibold">Strategic Growth</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                  itemStyle={{ fontSize: '12px', fontWeight: '600' }}
                  cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-5">
          {/* Logistical Distribution */}
          <Card className="card-standard">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-overline flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-primary" /> Logistical Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {(data?.sectorStatus || []).map((s) => (
                <div key={s.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className={s.val < 50 ? "text-red-600" : "text-emerald-600"}>{s.status}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", s.val < 50 ? "bg-red-500" : "bg-primary")}
                      style={{ width: `${s.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* ── Full Quick Actions Grid (2 rows) ── */}
      <Card className="card-standard">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-subheading flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-primary" /> Quick Navigation
          </CardTitle>
          <p className="text-caption mt-0.5">Jump to any admin module instantly</p>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { to: "/admin/staff",           icon: <Users className="w-5 h-5" />,         label: "Staff",          color: "text-blue-600",   bg: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800" },
              { to: "/admin/vendors",         icon: <Truck className="w-5 h-5" />,          label: "Vendors",        color: "text-violet-600", bg: "bg-violet-50 border-violet-200 dark:bg-violet-950 dark:border-violet-800" },
              { to: "/admin/inventory",       icon: <Package className="w-5 h-5" />,        label: "Inventory",      color: "text-cyan-600",   bg: "bg-cyan-50 border-cyan-200 dark:bg-cyan-950 dark:border-cyan-800" },
              { to: "/admin/invoices",        icon: <FileText className="w-5 h-5" />,       label: "Invoices",       color: "text-amber-600",  bg: "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800" },
              { to: "/admin/bookings",        icon: <CalendarCheck className="w-5 h-5" />,  label: "Bookings",       color: "text-emerald-600",bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800" },
              { to: "/admin/payments",        icon: <DollarSign className="w-5 h-5" />,     label: "Payments",       color: "text-green-600",  bg: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" },
              { to: "/admin/payment-history", icon: <Receipt className="w-5 h-5" />,         label: "Pay History",    color: "text-teal-600",   bg: "bg-teal-50 border-teal-200 dark:bg-teal-950 dark:border-teal-800" },
              { to: "/admin/reports",         icon: <BarChart3 className="w-5 h-5" />,      label: "Reports",        color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800" },
              { to: "/admin/branches",        icon: <MapPin className="w-5 h-5" />,         label: "Branches",       color: "text-red-600",    bg: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800" },
              { to: "/admin/reviews",         icon: <MessageSquare className="w-5 h-5" />,  label: "Reviews",        color: "text-pink-600",   bg: "bg-pink-50 border-pink-200 dark:bg-pink-950 dark:border-pink-800" },
              { to: "/admin/activity-logs",   icon: <ClipboardList className="w-5 h-5" />,  label: "Activity",       color: "text-slate-600",  bg: "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700" },
              { to: "/admin/settings",        icon: <Settings className="w-5 h-5" />,        label: "Settings",       color: "text-gray-600",   bg: "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700" },
            ].map(({ to, icon, label, color, bg }) => (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center gap-2 p-3.5 rounded-xl border bg-background hover:bg-muted hover:border-primary/40 hover:shadow-sm transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${bg} ${color}`}>
                  {icon}
                </div>
                <span className="text-[11px] font-semibold text-foreground text-center leading-tight tracking-wide">{label}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Ops Ledger + Critical Shortages ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Operations */}
        <Card className="card-standard">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-subheading flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Recent Operations
              </CardTitle>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border max-h-80 overflow-y-auto custom-scrollbar">
              {(data?.recentOperations || []).map((activity, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0",
                    activity.type === 'financial' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800' :
                    activity.type === 'system'    ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:border-blue-800' :
                    'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                  )}>
                    {activity.type === 'financial' ? <DollarSign className="w-3.5 h-3.5" /> :
                     activity.type === 'system'    ? <Activity className="w-3.5 h-3.5" /> :
                     <Package className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{activity.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border">
              <Button variant="ghost" size="sm" className="w-full text-primary hover:text-primary hover:bg-primary/10 text-xs font-semibold" asChild>
                <Link to="/admin/activity-logs">View All Logs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Critical Shortages */}
        <Card className="card-standard">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-subheading flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" /> Critical Shortages
              </CardTitle>
              <Badge variant="destructive" className="text-xs font-bold">{data?.criticalShortages ?? 0} Critical</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border max-h-80 overflow-y-auto custom-scrollbar">
              {(data?.lowStockItems?.length ? data.lowStockItems : []).map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600 dark:bg-red-950 dark:border-red-800">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-base font-bold text-red-600">{item.stockQuantity}</p>
                      <p className="text-[10px] text-muted-foreground">units</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950" asChild>
                      <Link to="/admin/inventory">Restock</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border">
              <Button variant="ghost" size="sm" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 text-xs font-semibold" asChild>
                <Link to="/admin/inventory">View Inventory</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Branch Network ── */}
      <Card className="card-standard">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-subheading flex items-center gap-2">
            <span className="text-primary">📍</span> Global Branch Network
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72 flex items-center justify-center bg-muted/30">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
              <p className="text-subheading">Map Integration Pending</p>
              <p className="text-caption mt-1">Connect a Google Maps API key to enable branch visualization</p>
            </div>
            <Button size="sm" className="bg-primary text-white">Configure Map API</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
