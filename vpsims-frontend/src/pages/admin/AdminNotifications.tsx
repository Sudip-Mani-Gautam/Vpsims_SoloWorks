import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, AlertTriangle, Package, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const notifications = [
  { id: 1, type: "stock", title: "Low Stock Alert", message: "Brake Pad Set - Toyota (BP-TOY-001) is below 10 units. Current stock: 5", time: "2 hours ago", icon: <Package className="w-5 h-5" /> },
  { id: 2, type: "stock", title: "Low Stock Alert", message: "Oil Filter - Honda (OF-HON-034) is below 10 units. Current stock: 3", time: "3 hours ago", icon: <Package className="w-5 h-5" /> },
  { id: 3, type: "credit", title: "Overdue Credit Payment", message: "Customer Bikash Rai has an unpaid balance of $450 overdue by 45 days. Email reminder sent.", time: "1 day ago", icon: <CreditCard className="w-5 h-5" /> },
  { id: 4, type: "stock", title: "Low Stock Alert", message: "Spark Plug Set - Suzuki (SP-SUZ-012) is below 10 units. Current stock: 8", time: "1 day ago", icon: <Package className="w-5 h-5" /> },
  { id: 5, type: "credit", title: "Overdue Credit Payment", message: "Customer Anita Gurung has an unpaid balance of $320 overdue by 38 days. Email reminder sent.", time: "2 days ago", icon: <CreditCard className="w-5 h-5" /> },
];

const AdminNotifications = () => (
  <div className="space-y-6">
    <div>
      <h1 className="page-title">Notifications</h1>
      <p className="page-subtitle">System alerts and automated notifications</p>
    </div>
    <div className="space-y-3">
      {notifications.map((n) => (
        <Card key={n.id} className="glass-card hover-lift">
          <CardContent className="p-4 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${n.type === "stock" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>
              {n.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-foreground">{n.title}</h3>
                <Badge variant="secondary" className="text-xs">{n.type === "stock" ? "Stock" : "Credit"}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{n.message}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">{n.time}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default AdminNotifications;
