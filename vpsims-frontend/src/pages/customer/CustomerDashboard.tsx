import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Star, History, Bot, Package, ArrowRight, Wrench, CreditCard, Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="page-title">Welcome Back, {user?.name?.split(' ')[0] || 'Customer'}!</h1>
          <p className="page-subtitle">Your vehicle service and parts overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/customer/notifications"
            className="relative w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>
          <Button asChild className="bg-primary text-white hover:bg-primary/90">
            <Link to="/customer/appointments"><Calendar className="w-4 h-4 mr-2" /> Book Service</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/customer/request-parts"><Package className="w-4 h-4 mr-2" /> Request Part</Link>
          </Button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Purchases" value={(stats?.totalPurchases ?? 0).toString()} icon={<History className="w-4 h-4" />} variant="primary" />
        <StatCard title="Total Spent" value={`NPR ${(stats?.totalSpent ?? 0).toLocaleString()}`} icon={<CreditCard className="w-4 h-4" />} variant="success" />
        <StatCard title="Appointments" value={(stats?.appointmentsCount ?? 0).toString()} icon={<Calendar className="w-4 h-4" />} variant="warning" />
        <StatCard title="Reviews Given" value={(stats?.reviewsCount ?? 0).toString()} icon={<Star className="w-4 h-4" />} variant="info" />
      </div>

      {/* ── Main Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — Insights + Appointment */}
        <div className="lg:col-span-2 space-y-5">
          {/* AI Insights */}
          <Card className="card-standard">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-subheading flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" /> AI Vehicle Insights
              </CardTitle>
              <p className="text-caption mt-0.5">Predictive maintenance based on your vehicle's profile</p>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                <div className="w-9 h-9 rounded-lg bg-white dark:bg-blue-900 border border-blue-200 dark:border-blue-700 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-label text-blue-900 dark:text-blue-200">Brake Pads may need replacement soon</p>
                  <p className="text-caption text-blue-700 dark:text-blue-400 mt-1 leading-relaxed">
                    Based on your vehicle's mileage, brake pads typically need replacement at this point.
                  </p>
                  <Button variant="link" size="sm" className="p-0 h-auto text-blue-600 font-semibold mt-1" asChild>
                    <Link to="/customer/appointments">Schedule Inspection <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800">
                <div className="w-9 h-9 rounded-lg bg-white dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-700 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-label text-emerald-900 dark:text-emerald-200">Oil Change approaching</p>
                  <p className="text-caption text-emerald-700 dark:text-emerald-400 mt-1">
                    Regular oil changes keep your engine healthy. Book a service to stay on schedule.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Service */}
          <Card className="card-standard">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-subheading flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Upcoming Service
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {stats?.upcomingBooking ? (
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group">
                  <div>
                    <p className="text-label">{stats.upcomingBooking.serviceType}</p>
                    <p className="text-sm text-primary font-medium mt-0.5">
                      {new Date(stats.upcomingBooking.serviceDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · {stats.upcomingBooking.timeSlot}
                    </p>
                    <p className="text-caption mt-1">
                      Vehicle: {stats.upcomingBooking.vehicle} · Branch: {stats.upcomingBooking.branchName}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <Calendar className="w-10 h-10 text-muted-foreground opacity-30 mx-auto" />
                  <p className="text-muted-foreground text-sm">No upcoming appointments</p>
                  <Button asChild size="sm" className="bg-primary text-white">
                    <Link to="/customer/appointments">Book a Service</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right — Quick Actions + Notifications */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <Card className="card-standard">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-subheading">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {[
                { title: "Browse Parts Catalog", icon: <Package className="w-4 h-4 text-primary" />, desc: "Find specific components", link: "/customer/request-parts" },
                { title: "View Service History",  icon: <History className="w-4 h-4 text-violet-600" />, desc: "Check past records", link: "/customer/history" },
                { title: "Check Payments",        icon: <CreditCard className="w-4 h-4 text-emerald-600" />, desc: "Invoices and status", link: "/customer/payments" },
                { title: "Write a Review",        icon: <Star className="w-4 h-4 text-amber-500" />, desc: "Share your experience", link: "/customer/reviews" },
              ].map((action) => (
                <Link key={action.link} to={action.link} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted hover:border-primary/30 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                    {action.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{action.title}</p>
                    <p className="text-caption">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card className="card-standard">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-subheading flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" /> Notifications
                </CardTitle>
                {unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {stats?.recentNotifications && stats.recentNotifications.length > 0 ? (
                <div className="divide-y divide-border">
                  {stats.recentNotifications.map((n) => (
                    <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${!n.isRead ? "bg-blue-50/50 dark:bg-blue-950/30" : ""}`}>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                      {n.isRead && <span className="w-2 h-2 mt-1.5 flex-shrink-0" />}
                      <div>
                        <p className={`text-sm ${!n.isRead ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{n.message}</p>
                        <p className="text-caption mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">No notifications yet</div>
              )}
              <div className="p-3 border-t border-border">
                <Button variant="ghost" size="sm" className="w-full text-primary hover:bg-primary/10 text-xs font-semibold" asChild>
                  <Link to="/customer/notifications">View All Notifications</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
