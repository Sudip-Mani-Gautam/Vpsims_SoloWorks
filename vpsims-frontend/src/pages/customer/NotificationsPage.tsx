import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Bell, CheckCheck, ChevronRight, Loader2, Package, 
  Calendar, MessageSquare, CreditCard, Clock
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";

interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  type?: string;
  relatedId?: string;
  createdAt: string;
}

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notification');
      setNotifications(res.data);
    } catch (err) {
      toast.error("Failed to sync notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/notification/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("All acknowledged.");
    } catch (err) {
      toast.error("Failed to update.");
    }
  };

  const markRead = async (id: number) => {
    try {
      await api.patch(`/notification/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      toast.error("Failed to mark read.");
    }
  };

  const handleNotificationClick = async (n: Notification) => {
    // Mark as read first if not already
    if (!n.isRead) {
      await markRead(n.id);
    }

    // Direct redirection based on type
    switch (n.type) {
      case "BOOKING_STATUS":
        navigate("/customer/appointments");
        break;
      case "PART_REQUEST_UPDATE":
        navigate("/customer/request-parts");
        break;
      case "ORDER_PAYMENT_UPDATE":
        navigate("/customer/payments");
        break;
      case "SUPPORT_REPLY":
        if (n.relatedId) {
          navigate(`/customer/support/${n.relatedId}`);
        } else {
          navigate("/customer/support");
        }
        break;
      default:
        // No specific redirection for generic notifications
        break;
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return date.toLocaleDateString();
  };

  const getTypeStyles = (type?: string) => {
    switch (type) {
      case "BOOKING_STATUS": return { icon: <Calendar className="w-4 h-4" />, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
      case "SUPPORT_REPLY": return { icon: <MessageSquare className="w-4 h-4" />, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" };
      case "ORDER_PAYMENT_UPDATE": return { icon: <CreditCard className="w-4 h-4" />, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" };
      case "PART_REQUEST_UPDATE": return { icon: <Package className="w-4 h-4" />, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
      default: return { icon: <Bell className="w-4 h-4" />, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" };
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-muted/10">
      {/* Page Header Bar */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-[15px] font-black tracking-tight text-foreground">Notification Center</h1>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Real-time Activity Feed</p>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                {unreadCount} NEW
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead} 
                className="text-[10px] font-black text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all uppercase tracking-wider"
              >
                Mark All Read
              </button>
            )}
            <div className="flex items-center bg-muted border border-border rounded-lg p-0.5">
              <button 
                onClick={() => setFilter("all")}
                className={cn("px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all", 
                  filter === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                All
              </button>
              <button 
                onClick={() => setFilter("unread")}
                className={cn("px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all flex items-center gap-1.5", 
                  filter === "unread" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                Unread
                {unreadCount > 0 && <span className="bg-red-500 text-white text-[8px] font-black px-1.5 rounded-full">{unreadCount}</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="max-w-5xl mx-auto px-6 pb-3 flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
            {notifications.length} Total
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
            {unreadCount} Unread
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
            {notifications.length - unreadCount} Read
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Synchronizing feed...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 flex flex-col items-center gap-4 bg-card/50 rounded-2xl border border-border/50 border-dashed mt-4">
            <div className="w-14 h-14 rounded-full bg-muted/50 border border-border flex items-center justify-center">
              <CheckCheck className="w-6 h-6 text-muted-foreground/30" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-[13px] font-black text-foreground">All caught up</p>
              <p className="text-[11px] text-muted-foreground">No {filter === "unread" ? "unread " : ""}notifications to show</p>
            </div>
            {filter === "unread" && (
              <button onClick={() => setFilter("all")} className="text-[10px] font-black text-primary hover:underline uppercase tracking-wider">
                View all history
              </button>
            )}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            {filtered.map((n, index) => {
              const styles = getTypeStyles(n.type);
              return (
                <div 
                  key={n.id} 
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    "group relative flex items-start gap-4 px-5 py-4 cursor-pointer transition-all duration-200",
                    "hover:bg-muted/40",
                    index !== 0 && "border-t border-border/60",
                    !n.isRead && "bg-primary/[0.02]"
                  )}
                >
                  {/* Unread Indicator */}
                  {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />}

                  {/* Icon */}
                  <div className={cn(
                    "mt-0.5 w-9 h-9 rounded-xl border flex items-center justify-center shrink-0",
                    styles.bg, styles.color, styles.border
                  )}>
                    {styles.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-6">
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-[9px] font-black uppercase tracking-[0.15em]", styles.color)}>
                            {n.title}
                          </span>
                          {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />}
                        </div>
                        <p className={cn(
                          "text-[13px] leading-snug",
                          !n.isRead ? "font-semibold text-foreground" : "font-normal text-muted-foreground/80"
                        )}>
                          {n.message}
                        </p>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1.5">
                        <span className="text-[10px] text-muted-foreground/60 font-medium whitespace-nowrap flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {getRelativeTime(n.createdAt)}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-border/50 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">© 2026 VPSIMS Enterprise</p>
          <Button variant="outline" size="sm" className="h-9 px-5 rounded-xl text-[10px] font-black uppercase tracking-wider border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all" asChild>
            <Link to="/customer" className="flex items-center gap-2">
              Return to Dashboard <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
