import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, Check, CheckCheck, ChevronRight, Loader2, Package, 
  Calendar, Info, MessageSquare, CreditCard, Clock
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    if (!n.isRead) await markRead(n.id);
    if (!n.type || !n.relatedId) return;

    switch (n.type) {
      case "SUPPORT_REPLY":
      case "SUPPORT_TICKET_NEW":
      case "SUPPORT_MESSAGE_CUSTOMER":
      case "SUPPORT_TICKET_ASSIGNED":
        navigate(`/customer/support/${n.relatedId}`);
        break;
      case "BOOKING_STATUS":
        navigate("/customer/appointments");
        break;
      case "ORDER_PAYMENT_UPDATE":
        navigate("/customer/payments");
        break;
      case "PART_REQUEST_UPDATE":
        navigate("/customer/request-parts");
        break;
      default:
        break;
    }
  };

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

  const getIcon = (type?: string) => {
    switch (type) {
      case "BOOKING_STATUS": return <Calendar className="w-4 h-4 text-emerald-600" />;
      case "SUPPORT_REPLY": return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case "ORDER_PAYMENT_UPDATE": return <CreditCard className="w-4 h-4 text-purple-600" />;
      case "PART_REQUEST_UPDATE": return <Package className="w-4 h-4 text-amber-600" />;
      default: return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6 bg-background min-h-screen">
      {/* Balanced Professional Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg border border-primary/20">
             <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Notification Center</h1>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Real-time Activity Stream</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-red-500 text-white border-none px-3 py-1 text-[10px] font-black">{unreadCount} PENDING</Badge>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5">
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Solid Professional Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
             <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Updating stream...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-border rounded-2xl bg-card flex flex-col items-center gap-4 shadow-inner">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
               <Package className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">All logs cleared</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <Card 
                key={n.id} 
                onClick={() => handleNotificationClick(n)}
                className={cn(
                  "border border-border rounded-xl overflow-hidden cursor-pointer transition-all hover:translate-x-1 active:scale-[0.98] shadow-sm hover:shadow-md",
                  !n.isRead ? "bg-card border-l-4 border-l-primary" : "bg-muted/30 opacity-80"
                )}
              >
                <CardContent className="p-4 flex items-center gap-5">
                  {/* Icon Box */}
                  <div className={cn(
                    "w-10 h-10 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all",
                    !n.isRead ? "bg-primary/5 border-primary/10" : "bg-muted border-border/50"
                  )}>
                    {getIcon(n.type)}
                  </div>

                  {/* Content Box */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                       <span className={cn("text-[10px] font-black uppercase tracking-widest", !n.isRead ? "text-primary" : "text-muted-foreground")}>
                          {n.title}
                       </span>
                       <span className="text-[10px] font-bold text-muted-foreground/60 uppercase whitespace-nowrap flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {getRelativeTime(n.createdAt)}
                       </span>
                    </div>
                    <p className={cn("text-sm leading-snug", !n.isRead ? "font-bold text-foreground" : "font-medium text-muted-foreground")}>
                      {n.message}
                    </p>
                  </div>

                  {/* Status Box */}
                  <div className="flex-shrink-0">
                    {!n.isRead ? (
                      <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="pt-8 text-center">
        <Button variant="outline" size="sm" className="border-border hover:bg-muted text-[10px] font-black uppercase tracking-[0.2em] px-8 h-10 rounded-xl transition-all" asChild>
          <Link to="/customer">Return to Command Hub</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotificationsPage;
