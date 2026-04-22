import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Car, ShoppingCart, Wrench, Mail, Phone, MapPin, CreditCard, Trophy, Star, Loader2, Package, CheckCircle2, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CustomerData {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  loyaltyPoints: number;
  totalSpent: number;
  pendingPayments: number;
  createdAt: string;
  vehicles: Array<{ id: number; make: string; model: string; year: number; licensePlate: string }>;
  orders: Array<{ id: number; totalAmount: number; status: string; paymentStatus: string; createdAt: string }>;
  requests: Array<{ id: number; partName: string; status: string; createdAt: string }>;
  bookings: Array<{ id: number; serviceType: string; serviceDate: string; status: string; branchName: string }>;
}

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/user/${id}/detail`);
        setData(res.data);
      } catch {
        toast.error("Failed to fetch customer profile.");
        navigate('/staff/customers');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);



  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
    </div>
  );

  if (!data) return null;

  const getLoyaltyTier = (points: number) => {
    if (points >= 1000) return { label: "Platinum", color: "bg-slate-900 text-slate-100", icon: <Trophy className="w-4 h-4" /> };
    if (points >= 500) return { label: "Gold", color: "bg-amber-500 text-white", icon: <Star className="w-4 h-4" /> };
    if (points >= 100) return { label: "Silver", color: "bg-slate-400 text-white", icon: <Star className="w-4 h-4" /> };
    return { label: "Bronze", color: "bg-orange-700 text-white", icon: <Star className="w-4 h-4" /> };
  };

  const tier = getLoyaltyTier(data.loyaltyPoints);
  const isTopBuyer = data.totalSpent > 10000;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 bg-background min-h-screen">
      {/* Balanced Professional Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-2 border-border hover:bg-muted transition-all shadow-sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Customer Intelligence</h1>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">High-Value Relationship Management</p>
          </div>
        </div>
        {isTopBuyer && (
          <Badge className="bg-primary text-white border-none px-4 py-1.5 rounded-full flex items-center gap-2 animate-pulse text-[10px] font-black shadow-lg shadow-primary/20">
            <Trophy className="w-4 h-4" /> TOP BUYER DISTINCTION
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Customer Info Card - Professional Solid */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-2 border-border rounded-2xl bg-card shadow-xl overflow-hidden">
            <div className="h-32 bg-primary/5 border-b-2 border-border flex items-center justify-center relative">
               <div className="w-20 h-20 rounded-2xl bg-background border-2 border-border flex items-center justify-center text-primary text-3xl font-black shadow-xl">
                 {data.name[0]}
               </div>
            </div>
            <CardContent className="pt-8 pb-6 px-6 space-y-6">
              <div className="flex flex-col items-center text-center">
                <h3 className="font-black text-xl uppercase tracking-tight text-foreground">{data.name}</h3>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1">LOG ID: VPS-{data.id.toString().padStart(4, '0')}</p>
                
                <div className="flex flex-wrap justify-center gap-2 mt-5">
                  <Badge className={cn("px-4 py-1 rounded-full border-none shadow-md flex items-center gap-2 text-[10px] font-black uppercase transition-all hover:scale-105", tier.color)}>
                    {tier.icon} {tier.label}
                  </Badge>
                  <Badge variant="outline" className="font-black text-[10px] uppercase border-border px-4 py-1 rounded-full">{data.loyaltyPoints} POINTS</Badge>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-border">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-xl border border-border">
                   <Mail className="w-4 h-4 text-primary" />
                   <span className="text-sm font-bold truncate">{data.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-xl border border-border">
                   <Phone className="w-4 h-4 text-primary" />
                   <span className="text-sm font-bold">{data.phone}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-xl border border-border">
                   <MapPin className="w-4 h-4 text-primary" />
                   <span className="text-sm font-bold truncate">{data.address}</span>
                </div>
              </div>


              <div className="mt-6 p-5 rounded-2xl bg-muted border-2 border-border space-y-4">
                  <div className="flex justify-between items-end">
                      <div>
                          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Lifetime Revenue</p>
                          <p className="text-2xl font-black text-primary">${data.totalSpent.toLocaleString()}</p>
                      </div>
                      <Trophy className="w-8 h-8 text-primary opacity-20" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                      <div>
                          <p className="text-[9px] font-black text-muted-foreground uppercase">Pending Value</p>
                          <p className="text-sm font-black text-destructive">${data.pendingPayments.toLocaleString()}</p>
                      </div>
                      <div>
                          <p className="text-[9px] font-black text-muted-foreground uppercase">Joined On</p>
                          <p className="text-sm font-black text-foreground">{new Date(data.createdAt).toLocaleDateString()}</p>
                      </div>
                  </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Activity/Tabs Area */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs defaultValue="vehicles" className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full bg-muted border-2 border-border p-1.5 rounded-2xl h-14">
              <TabsTrigger value="vehicles" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all">Fleet Registry</TabsTrigger>
              <TabsTrigger value="purchases" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all">Invoicing Log</TabsTrigger>
              <TabsTrigger value="services" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all">Service History</TabsTrigger>
              <TabsTrigger value="requests" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all">Part Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="vehicles" className="space-y-4 animate-in fade-in duration-300">
              <Card className="border-2 border-border rounded-2xl bg-card overflow-hidden shadow-xl">
                <Table>
                  <TableHeader className="bg-muted border-b-2 border-border">
                    <TableRow>
                      <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground">Registry Plate</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-foreground">Manufacturer</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-foreground">Model Variant</TableHead>
                      <TableHead className="text-right px-6 text-[10px] font-black uppercase tracking-widest text-foreground">Year</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.vehicles.map((v) => (
                      <TableRow key={v.id} className="border-b border-border hover:bg-muted/30 transition-colors h-14">
                        <TableCell className="px-6 font-mono text-sm font-black text-primary uppercase tracking-tighter">{v.licensePlate}</TableCell>
                        <TableCell className="font-black text-sm uppercase">{v.make}</TableCell>
                        <TableCell className="font-bold text-sm text-muted-foreground uppercase">{v.model}</TableCell>
                        <TableCell className="text-right px-6 font-black text-sm">{v.year}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="purchases" className="space-y-4 animate-in fade-in duration-300">
              <Card className="border-2 border-border rounded-2xl bg-card overflow-hidden shadow-xl">
                <Table>
                  <TableHeader className="bg-muted border-b-2 border-border">
                    <TableRow>
                      <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground">Invoice Reference</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-foreground">Date</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-foreground">Financial Value</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-foreground">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.orders.map((o) => (
                      <TableRow key={o.id} className="border-b border-border hover:bg-muted/30 transition-colors h-14">
                        <TableCell className="px-6 font-black text-sm">#INV-{o.id.toString().padStart(5, '0')}</TableCell>
                        <TableCell className="text-xs font-bold text-muted-foreground uppercase">{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="font-black text-sm text-foreground tabular-nums">${o.totalAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={cn("text-[9px] font-black uppercase px-2 py-0.5 border-none shadow-sm", o.paymentStatus === "Paid" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white")}>
                            {o.paymentStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="space-y-4 animate-in fade-in duration-300">
              <Card className="border-2 border-border rounded-2xl bg-card overflow-hidden shadow-xl">
                <Table>
                  <TableHeader className="bg-muted border-b-2 border-border">
                    <TableRow>
                      <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground">Booking ID</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-foreground">Service Type</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-foreground">Branch</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-foreground">Status</TableHead>
                      <TableHead className="text-right px-6 text-[10px] font-black uppercase tracking-widest text-foreground">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data.bookings || []).map((b) => (
                      <TableRow key={b.id} className="border-b border-border hover:bg-muted/30 transition-colors h-14">
                        <TableCell className="px-6 font-mono text-xs font-bold text-muted-foreground">#BOK-{b.id}</TableCell>
                        <TableCell className="font-black text-sm uppercase">{b.serviceType}</TableCell>
                        <TableCell className="text-xs font-bold text-muted-foreground uppercase">{b.branchName}</TableCell>
                        <TableCell className="text-center">
                           <Badge variant="outline" className="text-[9px] font-black uppercase border-border/50 px-2 h-5 rounded-sm">{b.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right px-6 text-xs font-bold text-muted-foreground">{new Date(b.serviceDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="requests" className="space-y-4 animate-in fade-in duration-300">
              <Card className="border-2 border-border rounded-2xl bg-card overflow-hidden shadow-xl">
                <Table>
                  <TableHeader className="bg-muted border-b-2 border-border">
                    <TableRow>
                      <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground">Request ID</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-foreground">Part Designation</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-foreground text-center">State</TableHead>
                      <TableHead className="text-right px-6 text-[10px] font-black uppercase tracking-widest text-foreground">Log Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.requests.map((r) => (
                      <TableRow key={r.id} className="border-b border-border hover:bg-muted/30 transition-colors h-14">
                        <TableCell className="px-6 font-mono text-xs font-bold text-muted-foreground">#PRQ-{r.id}</TableCell>
                        <TableCell className="font-black text-sm text-primary uppercase">{r.partName}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-[9px] font-black uppercase border-border/50 px-2 h-5 rounded-sm">{r.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right px-6 text-xs font-bold text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailPage;
