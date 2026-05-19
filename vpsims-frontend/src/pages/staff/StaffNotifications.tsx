import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Bell, CheckCheck, ChevronRight, Loader2,
  Package, MessageSquare, CreditCard, AlertTriangle, Clock, Calendar
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";

interface StaffNotification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  type?: string;
  relatedId?: string;
  createdAt: string;
}

const getTypeStyles = (type?: string) => {
  switch (type) {
    case "SUPPORT_REPLY":
    case "SUPPORT_TICKET_NEW":
    case "SUPPORT_TICKET_ASSIGNED":
    case "SUPPORT_MESSAGE_CUSTOMER":
      return { icon: <MessageSquare className="w-4 h-4" />, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" };
    case "LOW_STOCK":
    case "PART_REQUEST_UPDATE":
      return { icon: <Package className="w-4 h-4" />, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    case "ORDER_PAYMENT_UPDATE":
    case "CREDIT_OVERDUE":
      return { icon: <CreditCard className="w-4 h-4" />, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" };
    case "BOOKING_STATUS":
      return { icon: <Calendar className="w-4 h-4" />, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    default:
      return { icon: <Bell className="w-4 h-4" />, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" };
  }
};

const getRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const StaffNotifications = () => {
  const [notifications, setNotifications] = useState<StaffNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    try {
      const res = await api.get("/notification");
      setNotifications(res.data);
    } catch {
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch("/notification/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Failed to update.");
    }
  };

  const markRead = async (id: number) => {
    try {
      await api.patch(`/notification/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { /* silent */ }
  };

  const filtered = notifications.filter(n => filter === "unread" ? !n.isRead : true);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Bell className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-[15px] font-black tracking-tight text-foreground flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{unreadCount} new</span>
              )}
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Your activity feed</p>
          </div>
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
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-primary inline-block" />
          {notifications.length} Total
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          {unreadCount} Unread
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          {notifications.length - unreadCount} Read
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-7 h-7 animate-spin text-primary/40" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Syncing...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-28 flex flex-col items-center gap-4 bg-card/30 rounded-2xl border border-border/50 border-dashed">
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
                onClick={() => markRead(n.id)}
                className={cn(
                  "group relative flex items-start gap-4 px-5 py-4 cursor-default transition-all duration-200 hover:bg-muted/40",
                  index !== 0 && "border-t border-border/60",
                  !n.isRead && "bg-primary/[0.02]"
                )}
              >
                {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />}

                <div className={cn("mt-0.5 w-9 h-9 rounded-xl border flex items-center justify-center shrink-0", styles.bg, styles.color, styles.border)}>
                  {styles.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[9px] font-black uppercase tracking-[0.15em]", styles.color)}>{n.title}</span>
                        {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />}
                      </div>
                      <p className={cn("text-[13px] leading-snug", !n.isRead ? "font-semibold text-foreground" : "font-normal text-muted-foreground/80")}>
                        {n.message}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 font-medium whitespace-nowrap flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" /> {getRelativeTime(n.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StaffNotifications;
