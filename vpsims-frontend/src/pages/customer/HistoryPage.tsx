import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShoppingCart, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderItem {
  partName: string;
  quantity: number;
}

interface Order {
  id: number;
  createdAt: string;
  totalAmount: number;
  paymentStatus: string;
  status: string;
  items: OrderItem[];
}

interface Booking {
  id: number;
  serviceDate: string;
  timeSlot: string;
  status: string;
  serviceNotes?: string;
  branchName?: string;
  vehicleDetails?: string;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatCurrency = (value: number) =>
  `NPR ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const statusClass = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized === "paid" || normalized === "completed" || normalized === "approved") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800";
  }

  if (normalized === "rejected" || normalized === "cancelled") {
    return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800";
  }

  return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800";
};

const getServiceName = (serviceNotes?: string) => {
  if (!serviceNotes) return "General Service";
  const serviceLine = serviceNotes.split("\n").find(line => line.startsWith("Service:"));
  return serviceLine?.replace("Service:", "").trim() || serviceNotes.split("\n")[0] || "General Service";
};

const HistoryPage = () => {
  const { data: orders = [], isLoading: loadingOrders } = useQuery<Order[]>({
    queryKey: ["customer-history-orders"],
    queryFn: async () => {
      const { data } = await api.get("/order/my");
      return data;
    },
  });

  const { data: bookings = [], isLoading: loadingBookings } = useQuery<Booking[]>({
    queryKey: ["customer-history-bookings"],
    queryFn: async () => {
      const { data } = await api.get("/booking");
      return data;
    },
  });

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders]
  );

  const sortedBookings = useMemo(
    () => [...bookings].sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime()),
    [bookings]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">History</h1>
        <p className="page-subtitle">Your complete purchase and service history</p>
      </div>

      <Tabs defaultValue="purchases">
        <TabsList>
          <TabsTrigger value="purchases" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> Purchases
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" /> Services
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchases">
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingOrders ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center">
                        <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : sortedOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-sm text-muted-foreground">
                        No purchase history found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs text-primary font-bold">
                          INV-{order.id.toString().padStart(6, "0")}
                        </TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          {order.items.length > 0
                            ? order.items.map((item) => `${item.partName} x${item.quantity}`).join(", ")
                            : "Invoice items"}
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(order.totalAmount)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("font-bold", statusClass(order.paymentStatus))}>
                            {order.paymentStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Branch / Slot</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingBookings ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center">
                        <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : sortedBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-sm text-muted-foreground">
                        No service history found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-mono text-xs text-primary font-bold">
                          SVC-{booking.id.toString().padStart(6, "0")}
                        </TableCell>
                        <TableCell>{formatDate(booking.serviceDate)}</TableCell>
                        <TableCell>
                          <div className="font-medium">{getServiceName(booking.serviceNotes)}</div>
                          {booking.vehicleDetails && (
                            <div className="text-xs text-muted-foreground">{booking.vehicleDetails}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>{booking.branchName || "Main Service Center"}</div>
                          <div className="text-xs text-muted-foreground">{booking.timeSlot}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("font-bold", statusClass(booking.status))}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HistoryPage;
