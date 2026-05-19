import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Mail, Phone, MapPin, Trophy, Star,
  Loader2, Car, ShoppingCart, Wrench, Package,
  CalendarDays, DollarSign, Clock, CheckCircle2
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CustomerData {
  id: number; name: string; email: string; phone: string; address: string;
  loyaltyPoints: number; totalSpent: number; pendingPayments: number; createdAt: string;
  vehicles:  Array<{ id: number; make: string; model: string; year: number; licensePlate: string }>;
  orders:    Array<{ id: number; totalAmount: number; status: string; paymentStatus: string; createdAt: string }>;
  requests:  Array<{ id: number; partName: string; status: string; createdAt: string }>;
  bookings:  Array<{ id: number; serviceType: string; serviceDate: string; status: string; branchName: string }>;
}

const getLoyaltyTier = (pts: number) => {
  if (pts >= 1000) return { label: "Platinum", cls: "bg-slate-800 text-slate-100" };
  if (pts >= 500)  return { label: "Gold",     cls: "bg-amber-500 text-white"      };
  if (pts >= 100)  return { label: "Silver",   cls: "bg-slate-400 text-white"      };
  return                  { label: "Bronze",   cls: "bg-orange-700 text-white"     };
};

const statusCls = (s: string) => {
  const l = s?.toLowerCase();
  if (l === "paid" || l === "completed" || l === "approved")
    return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800";
  if (l === "pending")
    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800";
  return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
};

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/user/${id}/detail`)
      .then(r => setData(r.data))
      .catch(() => { toast.error("Failed to load customer."); navigate(-1); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return (
    <div className="h-72 flex items-center justify-center">
      <Loader2 className="w-7 h-7 animate-spin text-primary opacity-30" />
    </div>
  );
  if (!data) return null;

  const tier = getLoyaltyTier(data.loyaltyPoints);
  const initials = data.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-3 animate-fade-in">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Customer Profile
            </h1>
            <p className="text-xs text-muted-foreground">Full activity history and account details</p>
          </div>
        </div>
        {data.totalSpent > 10000 && (
          <Badge className="bg-primary/10 text-primary border border-primary/20 gap-1.5 text-xs font-semibold">
            <Trophy className="w-3 h-3" /> Top Buyer
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ── Left: Profile Card ── */}
        <div className="lg:col-span-3 space-y-3">
          <Card className="card-standard overflow-hidden">
            {/* Avatar strip */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-b border-border px-4 pt-5 pb-10 flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/30">
                {initials}
              </div>
            </div>

            <CardContent className="px-4 pb-4 -mt-6 space-y-4">
              {/* Name + ID */}
              <div className="text-center">
                <h2 className="text-base font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                  {data.name}
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  C-{data.id.toString().padStart(4, "0")}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge className={cn("text-[10px] font-semibold border-none px-2.5 py-0.5", tier.cls)}>
                    {tier.label}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-medium px-2.5 py-0.5">
                    {data.loyaltyPoints} pts
                  </Badge>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-1.5 border-t border-border pt-3">
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Mail className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                  <span className="truncate">{data.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                  <span>{data.phone}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                  <span className="truncate">{data.address}</span>
                </div>
              </div>

              {/* Financial metrics */}
              <div className="border-t border-border pt-3 grid grid-cols-1 gap-2">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <div>
                    <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Lifetime Spent</p>
                    <p className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                      NPR {data.totalSpent.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-5 h-5 text-emerald-500 opacity-60" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-muted/60 border border-border">
                    <p className="text-[10px] text-muted-foreground font-medium">Pending</p>
                    <p className="text-sm font-bold text-destructive">NPR {data.pendingPayments.toLocaleString()}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/60 border border-border">
                    <p className="text-[10px] text-muted-foreground font-medium">Joined</p>
                    <p className="text-sm font-bold text-foreground">{new Date(data.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right: Activity Tabs ── */}
        <div className="lg:col-span-9">
          <Tabs defaultValue="vehicles" className="space-y-3">
            <TabsList className="bg-muted border border-border h-8 p-0.5 rounded-lg gap-0.5">
              {[
                { value: "vehicles",  label: "Vehicles",        icon: <Car className="w-3 h-3" />,          count: data.vehicles.length  },
                { value: "purchases", label: "Invoices",        icon: <ShoppingCart className="w-3 h-3" />, count: data.orders.length    },
                { value: "services",  label: "Service History", icon: <Wrench className="w-3 h-3" />,       count: data.bookings.length  },
                { value: "requests",  label: "Part Requests",   icon: <Package className="w-3 h-3" />,      count: data.requests.length  },
              ].map(({ value, label, icon, count }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex items-center gap-1.5 h-7 px-3 text-xs font-semibold rounded-md data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
                >
                  {icon} {label}
                  {count > 0 && (
                    <span className="ml-0.5 text-[10px] font-bold opacity-70">({count})</span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Vehicles */}
            <TabsContent value="vehicles" className="m-0">
              <Card className="card-standard overflow-hidden">
                <CardHeader className="py-2.5 px-4 border-b border-border">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Car className="w-4 h-4 text-primary" /> Fleet Registry
                  </CardTitle>
                </CardHeader>
                {data.vehicles.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground">No vehicles registered</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 h-8">
                        {["License Plate", "Make", "Model", "Year"].map(h => (
                          <TableHead key={h} className="py-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground first:pl-4 last:pr-4 last:text-right">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.vehicles.map(v => (
                        <TableRow key={v.id} className="hover:bg-muted/30 h-10">
                          <TableCell className="pl-4 py-0 font-mono text-xs font-semibold text-primary">{v.licensePlate}</TableCell>
                          <TableCell className="py-0 text-sm font-semibold text-foreground">{v.make}</TableCell>
                          <TableCell className="py-0 text-xs text-muted-foreground">{v.model}</TableCell>
                          <TableCell className="pr-4 py-0 text-right text-xs font-medium text-muted-foreground">{v.year}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Card>
            </TabsContent>

            {/* Invoices */}
            <TabsContent value="purchases" className="m-0">
              <Card className="card-standard overflow-hidden">
                <CardHeader className="py-2.5 px-4 border-b border-border">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-primary" /> Invoice History
                  </CardTitle>
                </CardHeader>
                {data.orders.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground">No orders yet</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 h-8">
                        {["Invoice", "Date", "Amount", "Payment"].map(h => (
                          <TableHead key={h} className="py-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground first:pl-4 last:pr-4 last:text-right">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.orders.map(o => (
                        <TableRow key={o.id} className="hover:bg-muted/30 h-10">
                          <TableCell className="pl-4 py-0 font-mono text-xs text-muted-foreground">#INV-{o.id.toString().padStart(5, "0")}</TableCell>
                          <TableCell className="py-0 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="py-0 text-sm font-semibold text-foreground tabular-nums">NPR {o.totalAmount.toLocaleString()}</TableCell>
                          <TableCell className="pr-4 py-0 text-right">
                            <span className={cn("inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border", statusCls(o.paymentStatus))}>
                              {o.paymentStatus}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Card>
            </TabsContent>

            {/* Service History */}
            <TabsContent value="services" className="m-0">
              <Card className="card-standard overflow-hidden">
                <CardHeader className="py-2.5 px-4 border-b border-border">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-primary" /> Service History
                  </CardTitle>
                </CardHeader>
                {data.bookings.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground">No service bookings</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 h-8">
                        {["Booking", "Service", "Branch", "Date", "Status"].map(h => (
                          <TableHead key={h} className="py-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground first:pl-4 last:pr-4 last:text-right">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.bookings.map(b => (
                        <TableRow key={b.id} className="hover:bg-muted/30 h-10">
                          <TableCell className="pl-4 py-0 font-mono text-xs text-muted-foreground">#BOK-{b.id}</TableCell>
                          <TableCell className="py-0 text-sm font-semibold text-foreground">{b.serviceType}</TableCell>
                          <TableCell className="py-0 text-xs text-muted-foreground">{b.branchName}</TableCell>
                          <TableCell className="py-0 text-xs text-muted-foreground">{new Date(b.serviceDate).toLocaleDateString()}</TableCell>
                          <TableCell className="pr-4 py-0 text-right">
                            <span className={cn("inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border", statusCls(b.status))}>
                              {b.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Card>
            </TabsContent>

            {/* Part Requests */}
            <TabsContent value="requests" className="m-0">
              <Card className="card-standard overflow-hidden">
                <CardHeader className="py-2.5 px-4 border-b border-border">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" /> Part Requests
                  </CardTitle>
                </CardHeader>
                {data.requests.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground">No part requests</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 h-8">
                        {["Request ID", "Part Name", "Date", "Status"].map(h => (
                          <TableHead key={h} className="py-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground first:pl-4 last:pr-4 last:text-right">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.requests.map(r => (
                        <TableRow key={r.id} className="hover:bg-muted/30 h-10">
                          <TableCell className="pl-4 py-0 font-mono text-xs text-muted-foreground">#PRQ-{r.id}</TableCell>
                          <TableCell className="py-0 text-sm font-semibold text-foreground">{r.partName}</TableCell>
                          <TableCell className="py-0 text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="pr-4 py-0 text-right">
                            <span className={cn("inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border", statusCls(r.status))}>
                              {r.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailPage;
