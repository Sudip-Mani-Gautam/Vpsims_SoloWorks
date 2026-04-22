import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { UserPlus, Eye, EyeOff, Ban, Search, Loader2, Car, Mail, Trophy, Star, ShieldCheck, ChevronRight, Filter } from "lucide-react";
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
    queryKey: ['top-loyalty'],
    queryFn: async () => {
      const { data } = await api.get('/user/top-loyalty');
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
    if (!form.name || !form.phone || !form.address || !form.vehicleMake) {
       toast.error("Please provide mandatory registration markers.");
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
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 bg-background min-h-screen">
      {/* Balanced Professional Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg border border-primary/20">
             <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Entity Management</h1>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Verified Customer & Asset Hub</p>
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
             <Button className="h-11 bg-primary text-white font-black text-xs uppercase tracking-widest px-8 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                Register New Customer
             </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-card border-2 border-border shadow-2xl p-0 overflow-hidden rounded-2xl">
             <DialogHeader className="bg-muted p-6 border-b-2 border-border">
                <DialogTitle className="text-xl font-black uppercase tracking-tight">Initialize Registration Protocol</DialogTitle>
             </DialogHeader>
             <form onSubmit={handleRegister} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <p className="text-[10px] font-black uppercase text-primary border-b-2 border-primary/20 pb-2 tracking-[0.2em]">Identity Profile</p>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Legal Full Name*</Label>
                         <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-11 text-sm font-bold border-2 rounded-xl" placeholder="Full Legal Designation" />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location*</Label>
                         <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="h-11 text-sm font-bold border-2 rounded-xl" placeholder="Primary Domicile/Location" />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Number*</Label>
                         <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="h-11 text-sm font-bold border-2 rounded-xl" placeholder="+977-XXXXXXXXXX" />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Communication Email</Label>
                         <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="h-11 text-sm font-bold border-2 rounded-xl" placeholder="email@nexus.com" />
                      </div>
                   </div>
                   <div className="space-y-6">
                      <p className="text-[10px] font-black uppercase text-secondary border-b-2 border-secondary/20 pb-2 tracking-[0.2em]">Asset Linking</p>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Car Name* (Manufacturer)</Label>
                         <Input value={form.vehicleMake} onChange={e => setForm({...form, vehicleMake: e.target.value})} className="h-11 text-sm font-bold border-2 rounded-xl" placeholder="e.g. Toyota, Tesla" />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Model Variant</Label>
                         <Input value={form.vehicleModel} onChange={e => setForm({...form, vehicleModel: e.target.value})} className="h-11 text-sm font-bold border-2 rounded-xl" placeholder="e.g. Corolla, Model 3" />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Plate Number (License)</Label>
                         <Input value={form.licensePlate} onChange={e => setForm({...form, licensePlate: e.target.value})} className="h-11 text-sm font-bold border-2 rounded-xl" placeholder="BA-X-XXXX" />
                      </div>
                   </div>
                </div>
                <div className="pt-6 flex justify-end gap-3 border-t border-border mt-4">
                   <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="text-xs font-black uppercase px-6 h-11">Abort</Button>
                   <Button type="submit" className="bg-primary text-white text-xs font-black uppercase px-10 h-11 rounded-xl shadow-lg shadow-primary/10">Authorize Registry</Button>
                </div>
             </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <TabsList className="bg-muted border-2 border-border h-12 p-1.5 rounded-2xl w-full md:w-auto">
              <TabsTrigger value="all" className="text-[10px] font-black uppercase px-6 h-9 data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all shadow-sm">Verified Logs</TabsTrigger>
              <TabsTrigger value="leaderboard" className="text-[10px] font-black uppercase px-6 h-9 data-[state=active]:bg-secondary data-[state=active]:text-white rounded-xl transition-all flex items-center gap-2 shadow-sm">
                 <Trophy className="w-4 h-4" /> Loyalty Leaderboard
              </TabsTrigger>
           </TabsList>
           
           <div className="relative max-w-sm w-full group">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                className="pl-10 h-11 bg-card border-2 border-border text-sm font-black uppercase rounded-xl shadow-sm focus:border-primary transition-all" 
                placeholder="Search Identity or Asset..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
           </div>
        </div>

        <TabsContent value="all" className="animate-in fade-in slide-in-from-top-2 duration-300 m-0">
          <Card className="border-2 border-border rounded-2xl bg-card overflow-hidden shadow-xl">
            <Table>
              <TableHeader className="bg-muted border-b-2 border-border">
                <TableRow>
                  <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground">Reference</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-foreground">Entity Persona</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-foreground">Tier</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-foreground text-center">Linked Asset</TableHead>
                  <TableHead className="text-right px-6 text-[10px] font-black uppercase tracking-widest text-foreground">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="h-64 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary opacity-20" /></TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-64 text-center text-sm font-medium text-muted-foreground">No records found</TableCell></TableRow>
                ) : filtered.map((c) => (
                  <TableRow key={c.id} className="border-b border-border hover:bg-muted/30 transition-colors h-16">
                    <TableCell className="px-6 font-mono text-sm font-black text-primary uppercase tracking-tighter">C-{c.id.toString().padStart(4, '0')}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-black uppercase tracking-tight">{c.name}</span>
                        <span className="text-xs font-bold text-muted-foreground">{c.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                       <Badge className={cn("text-[9px] font-black uppercase px-2 py-0.5 border-none shadow-sm rounded-sm", getLoyaltyTier(c.loyaltyPoints).color)}>
                          {getLoyaltyTier(c.loyaltyPoints).label}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                       {c.vehicles && c.vehicles.length > 0 ? (
                          <Badge variant="outline" className="text-[9px] font-black uppercase border-border text-muted-foreground px-2 py-0.5 rounded-sm tabular-nums">{c.vehicles[0].licensePlate}</Badge>
                       ) : <span className="text-[9px] font-black text-muted-foreground uppercase italic">No Asset Linked</span>}
                    </TableCell>
                    <TableCell className="text-right px-6">
                       <Button variant="ghost" size="sm" onClick={() => navigate(`${window.location.pathname}/${c.id}`)} className="h-9 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all hover:bg-muted px-4 rounded-lg">
                          Inspect Account <ChevronRight className="w-4 h-4 ml-2" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="animate-in fade-in slide-in-from-top-2 duration-300 m-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {/* Top 3 Focus */}
             <div className="md:col-span-1 space-y-6">
                <Card className="border-2 border-border rounded-2xl bg-card overflow-hidden p-10 text-center space-y-6 shadow-sm">
                   <div className="mx-auto w-24 h-24 rounded-2xl bg-secondary flex items-center justify-center text-white">
                      <Trophy className="w-12 h-12" />
                   </div>
                   <div className="space-y-2">
                      <h3 className="font-black text-xl uppercase tracking-tight">Prime Loyalty Hub</h3>
                      <p className="text-xs font-black text-secondary uppercase tracking-[0.2em]">Tier-1 Revenue Generators</p>
                   </div>
                   <div className="h-0.5 bg-border rounded-full" />
                   <p className="text-sm font-bold text-muted-foreground leading-relaxed uppercase">
                      Top earners are authorized for automatic priority service and exclusive procurement discounts globally.
                   </p>
                </Card>
             </div>

             {/* Full Leaderboard */}
             <div className="md:col-span-2">
                <Card className="border-2 border-border rounded-2xl bg-card overflow-hidden shadow-xl h-full">
                   <CardHeader className="bg-muted p-4 border-b-2 border-border px-6">
                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Global Ranking Statistics</p>
                   </CardHeader>
                   <Table>
                      <TableHeader className="bg-muted border-b border-border">
                         <TableRow>
                            <TableHead className="px-6 text-[10px] font-black uppercase h-10 text-foreground">Rank</TableHead>
                            <TableHead className="text-[10px] font-black uppercase h-10 text-foreground">Verified Persona</TableHead>
                            <TableHead className="text-[10px] font-black uppercase h-10 text-center text-foreground">Point Intensity</TableHead>
                            <TableHead className="text-right px-6 text-[10px] font-black uppercase h-10 text-foreground">Tier</TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                         {loadingTop ? (
                            <TableRow><TableCell colSpan={4} className="h-64 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-secondary opacity-20" /></TableCell></TableRow>
                         ) : topLoyalty.map((u, i) => (
                            <TableRow key={u.id} className="border-b border-border hover:bg-muted transition-colors h-14">
                               <TableCell className="px-6">
                                  <div className={cn(
                                     "w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black",
                                     i === 0 ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" : 
                                     i === 1 ? "bg-slate-400 text-white shadow-md shadow-slate-400/20" : 
                                     i === 2 ? "bg-orange-700 text-white shadow-md shadow-orange-700/20" : "bg-muted text-muted-foreground"
                                  )}>
                                     {i + 1}
                                  </div>
                               </TableCell>
                               <TableCell className="font-black text-sm uppercase tracking-tight">{u.name}</TableCell>
                               <TableCell className="text-center font-black text-sm text-secondary tabular-nums tracking-tighter">{u.loyaltyPoints.toLocaleString()}</TableCell>
                               <TableCell className="text-right px-6">
                                  <Badge className={cn("text-[9px] font-black uppercase px-3 py-1 border-none shadow-sm rounded-sm", getLoyaltyTier(u.loyaltyPoints).color)}>
                                     {getLoyaltyTier(u.loyaltyPoints).label}
                                  </Badge>
                               </TableCell>
                            </TableRow>
                         ))}
                      </TableBody>
                   </Table>
                </Card>
             </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerManagement;
