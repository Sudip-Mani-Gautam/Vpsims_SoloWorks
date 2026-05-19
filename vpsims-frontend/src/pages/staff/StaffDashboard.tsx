import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart, Users, FileText, Search,
  ChevronRight, PlusCircle, UserPlus,
  CreditCard, PackageSearch, Zap, BarChart3,
  Loader2, TrendingUp, Clock, CalendarCheck,
  ArrowUpRight, ArrowDownRight, Wrench
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface OrderItem { partId: number; partName: string; quantity: number; unitPrice: number; }
interface Order {
  id: number; userId: number; customerName: string; customerEmail: string;
  customerPhone: string; totalAmount: number; status: string; paymentStatus: string;
  amountPaid: number; dueDate: string | null; createdAt: string; items: OrderItem[];
}

const QuickAction = ({ icon: Icon, label, description, to, gradient }: {
  icon: any; label: string; description: string; to: string; gradient: string;
}) => (
  <Link to={to} className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4 flex items-center gap-3.5 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
    <div className={`w-11 h-11 rounded-xl ${gradient} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-200`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[12px] font-black text-foreground uppercase tracking-wider leading-tight">{label}</p>
      <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{description}</p>
    </div>
    <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-200">
      <ArrowUpRight className="w-3.5 h-3.5" />
    </div>
  </Link>
);

const PulseCard = ({ label, value, sub, icon: Icon, color, to }: {
  label: string; value: string; sub?: string; icon: any; color: string; to?: string;
}) => {
  const content = (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4 flex flex-col gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200",
      to && "cursor-pointer hover:border-primary/40"
    )}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
        <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-black text-foreground leading-none">{value}</p>
        {sub && <p className="text-[10px] font-semibold text-muted-foreground mt-1 flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-emerald-500" /> {sub}
        </p>}
      </div>
      <div className={`absolute bottom-0 right-0 w-20 h-20 rounded-full ${color} opacity-5 translate-x-6 translate-y-6`} />
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
};

const StaffDashboard = () => {
  const { user } = useAuth();

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["staff-dashboard-orders"],
    queryFn: async () => { const { data } = await api.get("/order"); return data; },
    refetchInterval: 60000,
  });

  const { data: bookings = [] } = useQuery<any[]>({
    queryKey: ["staff-dashboard-bookings"],
    queryFn: async () => { const { data } = await api.get("/booking"); return data; },
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const todaysOrders = orders.filter((o) => o.createdAt.startsWith(todayStr));
  const todaysSalesTotal = todaysOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const servedCount = new Set(todaysOrders.map((o) => o.userId)).size;
  const invoicesCount = todaysOrders.length;
  const pendingBookings = bookings.filter(b => b.status === "Pending").length;

  const recentSales = orders.slice(0, 6).map((o) => ({
    customer: o.customerName || "Walk-in Customer",
    parts: o.items.map((i) => i.partName).join(", ") || "Direct Sale",
    amount: o.totalAmount,
    status: o.paymentStatus,
    date: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const dayOrders = orders.filter((o) => o.createdAt.startsWith(dateStr));
    return { day: days[d.getDay()], sales: dayOrders.reduce((s, o) => s + o.totalAmount, 0), orders: dayOrders.length };
  });

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="space-y-6 pb-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-1">{greeting}, {user?.name?.split(" ")[0] || "Staff"}</p>
          <h1 className="text-3xl font-heading font-black tracking-tight text-foreground leading-none">Operations Hub</h1>
          <p className="text-[11px] font-semibold text-muted-foreground mt-1">VPSIMS Distribution Control · Staff Workspace</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Live</span>
          </div>
          <div className="flex items-center gap-2 bg-muted/40 border border-border/50 px-3.5 py-2 rounded-full">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-[11px] font-bold text-muted-foreground">{now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
        </div>
      ) : (
        <>
          {/* ── Quick Actions ── */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">Quick Operations</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <QuickAction to="/staff/sales" icon={PlusCircle} label="New Sale" description="Process transaction" gradient="bg-gradient-to-br from-blue-500 to-blue-700" />
              <QuickAction to="/staff/customers" icon={UserPlus} label="Register" description="Add customer" gradient="bg-gradient-to-br from-indigo-500 to-purple-700" />
              <QuickAction to="/staff/search" icon={PackageSearch} label="Catalog" description="Inventory lookup" gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
              <QuickAction to="/staff/credits" icon={CreditCard} label="Payment" description="Mark paid" gradient="bg-gradient-to-br from-emerald-500 to-teal-700" />
            </div>
          </section>

          {/* ── Pulse Stats ── */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-primary" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">Today's Pulse</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <PulseCard to="/staff/todays-sales" label="Today's Sales" value={`Rs. ${todaysSalesTotal.toLocaleString()}`} sub={`${todaysOrders.length} transactions`} icon={ShoppingCart} color="bg-blue-500" />
              <PulseCard to="/staff/customers-served" label="Customers Served" value={servedCount.toString()} sub="Unique customers" icon={Users} color="bg-purple-500" />
              <PulseCard to="/staff/invoices-created" label="Invoices" value={invoicesCount.toString()} sub="Created today" icon={FileText} color="bg-indigo-500" />
              <PulseCard to="/staff/bookings" label="Pending Bookings" value={pendingBookings.toString()} sub="Awaiting approval" icon={CalendarCheck} color={pendingBookings > 0 ? "bg-amber-500" : "bg-emerald-500"} />
            </div>
          </section>

          {/* ── Charts + Activity ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Weekly Chart */}
            <Card className="lg:col-span-3 rounded-2xl border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-border/40 py-4 px-5 flex flex-row items-center justify-between">
                <CardTitle className="text-[11px] font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5 text-primary" /> Weekly Performance
                </CardTitle>
                <span className="text-[10px] font-bold text-muted-foreground">Last 7 days</span>
              </CardHeader>
              <CardContent className="pt-5 pb-3 px-3">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                    <Tooltip
                      formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, "Sales"]}
                      contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', fontSize: '11px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                      cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 2' }}
                    />
                    <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#salesGrad)" dot={{ r: 3, fill: 'hsl(var(--primary))', strokeWidth: 0 }} activeDot={{ r: 5, fill: 'hsl(var(--primary))' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="lg:col-span-2 rounded-2xl border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-border/40 py-4 px-5 flex flex-row items-center justify-between">
                <CardTitle className="text-[11px] font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-primary" /> Recent Activity
                </CardTitle>
                <Link to="/staff/sales-invoices" className="text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-0.5">
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                  {recentSales.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground italic">No recent activities recorded.</div>
                  ) : (
                    recentSales.map((sale, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-black text-primary">{sale.customer[0].toUpperCase()}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-black text-foreground truncate">{sale.customer}</p>
                          <p className="text-[10px] font-semibold text-muted-foreground truncate">{sale.date}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[12px] font-black text-primary">Rs. {sale.amount.toLocaleString()}</p>
                          <span className={cn(
                            "text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full",
                            sale.status === "Paid" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          )}>{sale.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default StaffDashboard;
