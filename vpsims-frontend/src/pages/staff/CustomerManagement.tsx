import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { UserPlus, Eye, EyeOff, Ban, Search, Loader2, Car, Mail, Trophy, Star, ShieldCheck, ChevronRight, Filter, LayoutGrid, List, Phone } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Customer {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  loyaltyPoints: number;
  createdAt: string;
  vehicles?: Array<{ make: string, model: string, licensePlate: string }>;
}

const CustomerManagement = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [lbPeriod, setLbPeriod] = useState<'quarterly'|'half-year'|'yearly'|'all'>('all');
  const [form, setForm] = useState({ 
    name: "", email: "", password: "Customer@123", 
    phone: "", address: "",
    vehicleMake: "", vehicleModel: "", vehicleYear: new Date().getFullYear(), licensePlate: "" 
  });

  const { data: users = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data } = await api.get('/user');
      return data.filter((u: any) => u.role?.toLowerCase() === 'customer');
    }
  });

  const { data: topLoyalty = [], isLoading: loadingTop } = useQuery<any[]>({
    queryKey: ['top-loyalty', lbPeriod],
    queryFn: async () => {
      const { data } = await api.get('/user/top-loyalty', { params: { period: lbPeriod } });
      return data;
    }
  });

  const registerMutation = useMutation({
    mutationFn: (payload: any) => api.post('/auth/register', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success("Identity Registry Established.");
      setIsOpen(false);
      setForm({ 
        name: "", email: "", password: "Customer@123", 
        phone: "", address: "",
        vehicleMake: "", vehicleModel: "", vehicleYear: new Date().getFullYear(), licensePlate: "" 
      });
    }
  });

  const filtered = useMemo(() => {
    return users.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search) ||
      `C-${c.id.toString().padStart(4, '0')}`.toLowerCase().includes(search.toLowerCase()) ||
      c.vehicles?.some(v => v.licensePlate.toLowerCase().includes(search.toLowerCase()))
    );
  }, [users, search]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
       toast.error("Please fill in all required fields.");
       return;
    }
    registerMutation.mutate({ ...form, role: 'Customer' });
  };

  const getLoyaltyTier = (points: number = 0) => {
    if (points >= 1000) return { label: "PLATINUM", color: "bg-slate-900 text-slate-100" };
    if (points >= 500) return { label: "GOLD", color: "bg-amber-500 text-white" };
    if (points >= 100) return { label: "SILVER", color: "bg-slate-400 text-white" };
    return { label: "BRONZE", color: "bg-orange-700 text-white" };
  };

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Customers</h1>
          <p className="text-xs text-muted-foreground">Manage registered customers and their assets</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
             <Button size="sm" className="h-8 bg-primary text-white text-xs gap-1.5">
                <UserPlus className="w-3.5 h-3.5" /> Register Customer
             </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl bg-card border border-border shadow-xl p-0 overflow-hidden rounded-xl">
             <DialogHeader className="px-5 py-4 border-b border-border">
                <DialogTitle className="text-base font-bold">Register New Customer</DialogTitle>
             </DialogHeader>
             <form onSubmit={handleRegister} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-3">
                      <p className="text-xs font-semibold text-foreground border-b border-border pb-1">Personal Details</p>
                      <div className="space-y-1.5"><Label className="text-xs font-medium">Full Name*</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-8 text-sm" placeholder="Full name" /></div>
                      <div className="space-y-1.5"><Label className="text-xs font-medium">Location*</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="h-8 text-sm" placeholder="Address" /></div>
                      <div className="space-y-1.5"><Label className="text-xs font-medium">Phone*</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="h-8 text-sm" placeholder="+977-XXXXXXXXXX" /></div>
                      <div className="space-y-1.5"><Label className="text-xs font-medium">Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="h-8 text-sm" placeholder="email@example.com" /></div>
                   </div>
                   <div className="space-y-3">
                      <p className="text-xs font-semibold text-foreground border-b border-border pb-1">Vehicle details (optional)</p>
                      <div className="space-y-1.5"><Label className="text-xs font-medium">Make</Label><Input value={form.vehicleMake} onChange={e => setForm({...form, vehicleMake: e.target.value})} className="h-8 text-sm" placeholder="Toyota, Honda…" /></div>
                      <div className="space-y-1.5"><Label className="text-xs font-medium">Model</Label><Input value={form.vehicleModel} onChange={e => setForm({...form, vehicleModel: e.target.value})} className="h-8 text-sm" placeholder="Corolla, City…" /></div>
                      <div className="space-y-1.5"><Label className="text-xs font-medium">License Plate</Label><Input value={form.licensePlate} onChange={e => setForm({...form, licensePlate: e.target.value})} className="h-8 text-sm" placeholder="BA-X-XXXX" /></div>
                   </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-border pt-3 mt-1">
                   <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
                   <Button type="submit" size="sm" className="bg-primary text-white">Register Customer</Button>
                </div>
             </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-muted/20 p-2 rounded-xl border border-border/40">
           <TabsList className="bg-muted border border-border h-8 p-0.5 rounded-lg">
              <TabsTrigger value="all" className="text-xs font-semibold px-4 h-7 data-[state=active]:bg-primary data-[state=active]:text-white rounded-md transition-all">Customers</TabsTrigger>
              <TabsTrigger value="leaderboard" className="text-xs font-semibold px-4 h-7 data-[state=active]:bg-primary data-[state=active]:text-white rounded-md transition-all flex items-center gap-1.5">
                 <Trophy className="w-3 h-3" /> Leaderboard
              </TabsTrigger>
           </TabsList>
           
           <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center bg-muted border border-border rounded-lg p-0.5 h-8">
                 <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-1.5 rounded-md transition-all",
                      viewMode === 'list' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                    title="List View"
                 >
                    <List className="w-4 h-4" />
                 </button>
                 <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-1.5 rounded-md transition-all",
                      viewMode === 'grid' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Grid View"
                 >
                    <LayoutGrid className="w-4 h-4" />
                 </button>
              </div>

              <div className="relative flex-1 sm:w-56">
                 <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                 <Input className="pl-8 h-8 text-xs bg-background/50" placeholder="Search customers…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
           </div>
        </div>

        <TabsContent value="all" className="m-0">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <div className="col-span-full h-32 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 animate-spin text-primary opacity-30" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="col-span-full h-32 flex items-center justify-center text-xs text-muted-foreground italic font-semibold">
                  No records found
                </div>
              ) : filtered.map((c) => (
                <Card key={c.id} className="glass-card hover-lift h-full flex flex-col justify-between border-border/40 bg-card">
                  <CardContent className="pt-6 flex flex-col justify-between h-full space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                            {c.name[0]}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-heading font-black text-foreground truncate text-sm leading-tight">{c.name}</h3>
                            <p className="text-[10px] font-bold text-primary font-mono mt-0.5">C-{c.id.toString().padStart(4, '0')}</p>
                          </div>
                        </div>
                        <Badge className={cn("text-[9px] font-bold uppercase px-2 py-0.5 border-none rounded", getLoyaltyTier(c.loyaltyPoints).color)}>
                          {getLoyaltyTier(c.loyaltyPoints).label}
                        </Badge>
                      </div>

                      <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2 truncate">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground/60" />
                          {c.email}
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-muted-foreground/60" />
                            {c.phone}
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <Car className="w-3.5 h-3.5 text-muted-foreground/60 mt-0.5" />
                          <div className="flex-1">
                            {c.vehicles && c.vehicles.length > 0 ? (
                              c.vehicles.map((v, index) => (
                                <div key={index} className="font-mono text-foreground font-semibold">
                                  {v.make} {v.model} ({v.licensePlate})
                                </div>
                              ))
                            ) : (
                              <span className="italic text-muted-foreground/50">No vehicle registered</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/50 flex justify-between items-center text-xs">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Loyalty: {c.loyaltyPoints} pts</span>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`${window.location.pathname}/${c.id}`)} className="h-7 text-xs text-primary hover:bg-primary/10 px-3 gap-1">
                        View Profile <ChevronRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="card-standard overflow-hidden border-border/40">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 h-8">
                    <TableHead className="pl-4 py-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ref</TableHead>
                    <TableHead className="py-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Customer</TableHead>
                    <TableHead className="py-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tier</TableHead>
                    <TableHead className="py-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Vehicle</TableHead>
                    <TableHead className="text-right pr-4 py-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={5} className="h-20 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary opacity-30" /></TableCell></TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="h-20 text-center text-xs text-muted-foreground">No records found</TableCell></TableRow>
                  ) : filtered.map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted/30 transition-colors h-11">
                      <TableCell className="pl-4 py-0 font-mono text-xs font-bold text-primary">C-{c.id.toString().padStart(4, '0')}</TableCell>
                      <TableCell className="py-0">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground">{c.name}</span>
                          <span className="text-xs text-muted-foreground">{c.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-0">
                         <Badge className={cn("text-[10px] font-bold uppercase px-2 py-0.5 border-none rounded", getLoyaltyTier(c.loyaltyPoints).color)}>
                            {getLoyaltyTier(c.loyaltyPoints).label}
                         </Badge>
                      </TableCell>
                      <TableCell className="py-0">
                         {c.vehicles && c.vehicles.length > 0
                            ? <span className="text-xs font-mono text-muted-foreground">{c.vehicles[0].licensePlate}</span>
                            : <span className="text-xs text-muted-foreground/50 italic">No vehicle</span>}
                      </TableCell>
                      <TableCell className="py-0 text-right pr-4">
                         <Button variant="ghost" size="sm" onClick={() => navigate(`${window.location.pathname}/${c.id}`)} className="h-7 text-xs text-primary hover:bg-primary/10 px-3 gap-1">
                            View <ChevronRight className="w-3 h-3" />
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="m-0">
          <Card className="card-standard overflow-hidden">
            {/* Info banner + Period filters */}
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border bg-amber-50/50 dark:bg-amber-950/20">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">Loyalty Leaderboard</p>
                  <p className="text-[11px] text-muted-foreground">Ranked by loyalty points earned in the selected period</p>
                </div>
              </div>
              {/* Period filter pills */}
              <div className="flex items-center gap-1 bg-muted/60 border border-border rounded-lg p-0.5">
                {([
                  { value: 'quarterly',  label: 'Quarterly' },
                  { value: 'half-year', label: 'Half Year' },
                  { value: 'yearly',    label: 'Yearly'    },
                  { value: 'all',       label: 'All Time'  },
                ] as const).map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setLbPeriod(value)}
                    className={cn(
                      "px-3 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap",
                      lbPeriod === value
                        ? "bg-amber-500 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 h-8">
                  <TableHead className="pl-4 py-0 w-16 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rank</TableHead>
                  <TableHead className="py-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Customer</TableHead>
                  <TableHead className="py-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">
                    {lbPeriod === 'all' ? 'Total Points' : 'Period Points'}
                  </TableHead>
                  <TableHead className="py-0 pr-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">Tier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingTop ? (
                  <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary opacity-30" /></TableCell></TableRow>
                ) : topLoyalty.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="h-24 text-center text-xs text-muted-foreground">No loyalty data yet</TableCell></TableRow>
                ) : topLoyalty.map((u, i) => (
                  <TableRow key={u.id} className="hover:bg-muted/30 transition-colors h-11">
                    <TableCell className="pl-4 py-0">
                      <div className={cn(
                        "w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold",
                        i === 0 ? "bg-amber-500 text-white" :
                        i === 1 ? "bg-slate-400 text-white" :
                        i === 2 ? "bg-orange-700 text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {i + 1}
                      </div>
                    </TableCell>
                    <TableCell className="py-0 font-semibold text-sm text-foreground">{u.name}</TableCell>
                    <TableCell className="py-0 text-center font-bold text-sm tabular-nums text-primary">{u.loyaltyPoints.toLocaleString()}</TableCell>
                    <TableCell className="py-0 pr-4 text-right">
                      <Badge className={cn("text-[10px] font-bold uppercase px-2 py-0.5 border-none rounded", getLoyaltyTier(u.loyaltyPoints).color)}>
                        {getLoyaltyTier(u.loyaltyPoints).label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerManagement;
