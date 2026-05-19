import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, Star, History, Bot, Package, ArrowRight, 
  Wrench, CreditCard, Bell, Loader2, Zap, 
  Activity, Clock, MapPin, CheckCircle2, AlertTriangle, ShieldCheck,
  Settings, LifeBuoy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CustomerStats {
  totalPurchases: number;
  totalSpent: number;
  appointmentsCount: number;
  reviewsCount: number;
  upcomingBooking: {
    id: number;
    serviceType: string;
    serviceDate: string;
    timeSlot: string;
    branchName: string;
    vehicle: string;
  } | null;
  recentNotifications: {
    id: number;
    message: string;
    isRead: boolean;
    time: string;
  }[];
}

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const { data } = await api.get(`/dashboard/customer-stats/${user.id}`);
        setStats(data);
      } catch (e) {
        console.error("Failed to load customer dashboard:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const unreadCount = stats?.recentNotifications?.filter(n => !n.isRead).length ?? 0;

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <Bot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Analyzing vehicle data...</p>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      {/* ── Dashboard Header ── */}
      <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">Customer Portal</span>
            <span className="text-[10px] text-muted-foreground font-medium">• {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight leading-none">
            Welcome Back, <span className="text-primary">{user?.name?.split(' ')[0]}</span>!
          </h1>
          <p className="text-muted-foreground text-sm mt-2 font-medium">Your vehicle systems are currently performing optimally.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center bg-muted/50 border border-border p-1 rounded-xl">
            {[
              { id: "7d", label: "7D" },
              { id: "30d", label: "30D" },
              { id: "1y", label: "1Y" },
            ].map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300",
                  timeRange === range.id 
                    ? "bg-background text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {range.label}
              </button>
            ))}
          </div>


          <Button asChild size="lg" className="rounded-xl px-6 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white font-bold">
            <Link to="/customer/appointments"><Zap className="w-4 h-4 mr-2 fill-current" /> Schedule Service</Link>
          </Button>
        </div>
      </motion.div>

      {/* ── Key Metrics ── */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Purchases", value: stats?.totalPurchases ?? 0, icon: History, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40", barColor: "bg-blue-600", sub: "Total Visits", showChart: true, link: "/customer/history" },
          { label: "Total Spent", value: `NPR ${(stats?.totalSpent ?? 0).toLocaleString()}`, icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40", barColor: "bg-emerald-600", sub: "Lifetime Spent", showChart: true, link: "/customer/payments" },
          { label: "Appointments", value: stats?.appointmentsCount ?? 0, icon: Calendar, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/40", barColor: "bg-amber-600", sub: "Pending Services", showChart: true, link: "/customer/appointments" },
          { label: "Reviews Given", value: stats?.reviewsCount ?? 0, icon: Star, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/40", barColor: "bg-indigo-600", sub: "Reviews Shared", showChart: true, link: "/customer/reviews" },
        ].map((stat, i) => (
          <Card 
            key={i} 
            onClick={() => navigate(stat.link)}
            className="relative overflow-hidden group border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 cursor-pointer active:scale-[0.98]"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-black text-foreground tracking-tighter">{stat.value}</h3>
                  <p className="text-[10px] font-semibold text-muted-foreground/60 mt-1">{stat.sub}</p>
                </div>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                  <stat.icon size={20} strokeWidth={2.5} />
                </div>
              </div>

              {/* Mini Bar Graph */}
              {stat.showChart && (
                <div className="mt-4 h-8 flex items-end gap-1 px-1 relative group/chart">
                  {(stat.value === 0 || stat.value === "NPR 0") ? (
                    <>
                      {[20, 20, 20, 20, 20, 20, 20].map((height, idx) => (
                        <div key={idx} className="flex-1 bg-muted/40 rounded-t-sm" style={{ height: `${height}%` }} />
                      ))}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/40 bg-background/50 px-2 py-0.5 rounded shadow-sm">No data yet</span>
                      </div>
                    </>
                  ) : (
                    [40, 70, 45, 90, 65, 80, 50].map((height, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + (idx * 0.05) }}
                        className={cn("flex-1 rounded-t-sm opacity-40", stat.barColor)}
                      />
                    ))
                  )}
                </div>
              )}

              <div className="absolute bottom-0 left-0 h-1 bg-primary/10 w-full overflow-hidden">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                  className={cn("h-full w-full opacity-20", stat.color.replace('text', 'bg'))}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Center Content: AI & Vehicle Health ── */}
        <div className="lg:col-span-8 space-y-6">
          {/* AI Vehicle Intelligence */}
          <motion.div variants={item}>
            <Card className="border-border/60 shadow-sm overflow-hidden bg-gradient-to-br from-card to-muted/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Bot size={22} />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold tracking-tight">AI Vehicle Intelligence</CardTitle>
                    <p className="text-xs text-muted-foreground font-medium">Predictive diagnostics & performance optimization</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase flex items-center gap-1.5 border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  System Healthy
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                {[
                  { 
                    title: "Brake Component Monitoring", 
                    desc: "Brake pad thickness estimated at 15%. Replacement recommended within next 1,200km.",
                    type: "warning",
                    icon: AlertTriangle,
                    action: "Book Inspection",
                    level: 85
                  },
                  { 
                    title: "Lubrication System", 
                    desc: "Oil viscosity remains within optimal parameters. Next scheduled change in 3,500km.",
                    type: "success",
                    icon: CheckCircle2,
                    action: null,
                    level: 40
                  }
                ].map((insight, i) => (
                  <div key={i} className="group relative flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border border-border bg-card/50 hover:bg-card hover:shadow-md transition-all duration-300">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border",
                      insight.type === 'warning' ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/30 dark:border-amber-800" : "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-800"
                    )}>
                      <insight.icon size={22} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-sm font-bold text-foreground">{insight.title}</h4>
                        <span className="text-[10px] font-black uppercase text-muted-foreground opacity-60">Status: {insight.type}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">{insight.desc}</p>
                      
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${insight.level}%` }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            className={cn("h-full rounded-full", insight.type === 'warning' ? "bg-amber-500" : "bg-emerald-500")}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground">{insight.level}% Wear</span>
                      </div>
                    </div>
                    {insight.action && (
                      <div className="sm:border-l border-border sm:pl-4 flex items-center">
                        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 font-bold text-xs" asChild>
                          <Link to="/customer/appointments">{insight.action} <ArrowRight className="ml-1 w-3.5 h-3.5" /></Link>
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Service Card */}
          <motion.div variants={item}>
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-primary" />
                  <CardTitle className="text-md font-bold tracking-tight">Active Service Appointments</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {stats?.upcomingBooking ? (
                  <div className="relative group p-5 rounded-2xl border-2 border-primary/20 bg-primary/[0.02] overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-background border border-border flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-[10px] font-black uppercase text-primary leading-none mb-1">
                            {new Date(stats.upcomingBooking.serviceDate).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-xl font-black text-foreground tracking-tighter leading-none">
                            {new Date(stats.upcomingBooking.serviceDate).getDate()}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase text-primary tracking-widest mb-1">{stats.upcomingBooking.serviceType}</p>
                          <h4 className="text-lg font-bold text-foreground leading-tight">{stats.upcomingBooking.vehicle}</h4>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                              <Clock size={13} className="text-primary/70" />
                              {stats.upcomingBooking.timeSlot}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                              <MapPin size={13} className="text-primary/70" />
                              {stats.upcomingBooking.branchName}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" className="rounded-lg font-bold text-xs border-border/60">Modify</Button>
                        <Button className="rounded-lg font-bold text-xs shadow-md shadow-primary/10">View Details</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl border border-dashed border-border text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4 opacity-50">
                      <Calendar size={24} />
                    </div>
                    <h5 className="text-sm font-bold text-foreground">No Pending Appointments</h5>
                    <p className="text-xs text-muted-foreground mt-1 mb-6 max-w-[240px]">Maintain your vehicle's performance with regular certified inspections.</p>
                    <Button asChild size="sm" className="rounded-lg font-bold px-6">
                      <Link to="/customer/appointments">Book a Service Now</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── Sidebar: Activity & Actions ── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Recent Activity Timeline */}
          <motion.div variants={item}>
            <Card className="border-border/60 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity size={18} className="text-primary" />
                    <CardTitle className="text-sm font-bold tracking-tight">Recent Activity</CardTitle>
                  </div>
                  {unreadCount > 0 && <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-primary text-white">{unreadCount} NEW</span>}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {stats?.recentNotifications && stats.recentNotifications.length > 0 ? (
                  <div className="relative pt-6 pb-2 px-6">
                    {/* Vertical Line */}
                    <div className="absolute left-8 top-6 bottom-6 w-[2px] bg-gradient-to-b from-primary/30 via-border to-transparent" />
                    
                    <div className="space-y-8 relative">
                      {stats.recentNotifications.map((n, i) => (
                        <div key={n.id} className="flex gap-4 group">
                          <div className={cn(
                            "relative z-10 w-4 h-4 rounded-full border-2 bg-background flex-shrink-0 mt-0.5 transition-all duration-300 group-hover:scale-125",
                            !n.isRead ? "border-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]" : "border-muted-foreground/30"
                          )} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-tighter">{n.time}</span>
                              {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                            </div>
                            <p className={cn(
                              "text-xs leading-relaxed transition-colors",
                              !n.isRead ? "text-foreground font-bold" : "text-muted-foreground font-medium"
                            )}>
                              {n.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-10 text-center text-xs text-muted-foreground font-medium opacity-50">
                    Syncing activity stream...
                  </div>
                )}
                <div className="p-4 border-t border-border bg-muted/20">
                  <Button variant="ghost" size="sm" className="w-full text-[11px] font-black uppercase tracking-widest text-primary hover:bg-primary/5" asChild>
                    <Link to="/customer/notifications">Full Event Log <ArrowRight size={12} className="ml-2" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Shortcuts */}
          <motion.div variants={item}>
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-bold tracking-tight">Quick Shortcuts</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {[
                  { label: "Browse Parts Catalog", icon: Package,    color: "text-blue-500",   bg: "bg-blue-500/10",   link: "/customer/request-parts" },
                  { label: "View Service History", icon: History,    color: "text-violet-500", bg: "bg-violet-500/10", link: "/customer/history" },
                  { label: "Check Payments",       icon: CreditCard, color: "text-emerald-500",bg: "bg-emerald-500/10",link: "/customer/payments" },
                  { label: "Write a Review",       icon: Star,       color: "text-amber-500",  bg: "bg-amber-500/10",  link: "/customer/reviews" },
                ].map((action, i) => (
                  <Link 
                    key={i} 
                    to={action.link} 
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card hover:bg-muted hover:border-primary/20 transition-all duration-300 group"
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", action.bg, action.color)}>
                      <action.icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-foreground text-center leading-tight">{action.label}</span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Verification Badge */}
          <motion.div variants={item} className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-indigo-500/10 border border-primary/20 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white dark:bg-background border border-primary/20 flex items-center justify-center text-primary shadow-sm">
              <ShieldCheck size={26} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase text-primary tracking-widest">Verified Account</p>
              <p className="text-[10px] font-medium text-muted-foreground mt-0.5">Authorized for all VPSIMS vehicle information services.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CustomerDashboard;
