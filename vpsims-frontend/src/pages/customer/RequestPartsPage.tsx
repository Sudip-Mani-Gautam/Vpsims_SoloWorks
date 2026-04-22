import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, 
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  Package, CheckCircle, Clock, Send, Loader2, X, XCircle, 
  AlertTriangle, Search, Filter, Tag, Cpu, Car, AlertCircle, Ban,
  History as HistoryIcon, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import debounce from "lodash/debounce";

interface Part {
  id: number;
  name: string;
  partNumber: string;
  categoryName: string;
}

interface Category {
  id: number;
  name: string;
}

interface PartRequest {
  id: number;
  partName: string;
  partNumber?: string;
  vehicleModel: string;
  quantity: number;
  priority: string;
  description: string;
  status: string;
  createdAt: string;
}

const RequestPartsPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<PartRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState<number | null>(null);
  
  const [form, setForm] = useState({ 
    partName: '', 
    partNumber: '', 
    vehicleModel: '', 
    quantity: 1, 
    priority: 'Normal', 
    description: '',
    categoryId: ''
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestions, setSuggestions] = useState<Part[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchData = async () => {
    try {
      const [hRes, cRes] = await Promise.all([
        api.get('/partrequest/my'),
        api.get('/category')
      ]);
      setHistory(hRes.data);
      setCategories(cRes.data);
    } catch {
      toast.error("Sync failed.");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const searchParts = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        setSearching(false);
        return;
      }
      setSearching(true);
      try {
        const res = await api.get(`/part/search?q=${query}`);
        setSuggestions(res.data);
        setShowSuggestions(true);
      } catch { }
      finally { setSearching(false); }
    }, 300),
    []
  );

  const handlePartNameChange = (val: string) => {
    setForm(prev => ({ ...prev, partName: val }));
    searchParts(val);
  };

  const selectSuggestion = (part: Part) => {
    setForm(prev => ({ ...prev, partName: part.name, partNumber: part.partNumber }));
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.partName || !form.vehicleModel) {
      toast.error("Input missing.");
      return;
    }
    setLoading(true);
    try {
      await api.post('/partrequest', form);
      setSubmitted(true);
      fetchData();
      toast.success("Request sent.");
    } catch {
      toast.error("Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!requestToCancel) return;
    try {
      await api.patch(`/partrequest/${requestToCancel}/cancel`);
      toast.success("Cancelled.");
      setCancelDialogOpen(false);
      fetchData();
    } catch {
      toast.error("Cancellation failed.");
    } finally {
      setRequestToCancel(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500 text-white';
      case 'Procuring': return 'bg-blue-500 text-white';
      case 'Rejected': return 'bg-red-500 text-white';
      case 'Cancelled': return 'bg-slate-500 text-white';
      default: return 'bg-amber-500 text-white';
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 bg-background min-h-screen" onClick={() => setShowSuggestions(false)}>
      {/* Balanced Professional Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg border border-primary/20">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Part Procurement</h1>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Sourcing & Acquisition Node</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Balanced Form Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-2 border-border rounded-2xl bg-card overflow-hidden shadow-xl">
            <CardHeader className="bg-muted p-5 border-b border-border">
               <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                  <Send className="w-4 h-4 text-primary" /> Initialize Sourcing
               </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {submitted ? (
                <div className="text-center py-10 space-y-6">
                  <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500 shadow-lg shadow-emerald-500/10">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-black text-sm uppercase">Request Authenticated</h3>
                    <p className="text-xs font-medium text-muted-foreground">Our team is initiating the search.</p>
                  </div>
                  <Button className="w-full text-xs font-black uppercase tracking-widest h-11 rounded-xl" variant="outline" onClick={() => { setSubmitted(false); setForm({ partName: '', partNumber: '', vehicleModel: '', quantity: 1, priority: 'Normal', description: '', categoryId: '' }); }}>
                    Submit New Request
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2 relative">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Part Designation *</Label>
                    <div className="relative">
                      <Input value={form.partName} onChange={e => handlePartNameChange(e.target.value)} placeholder="Search parts inventory..." className="bg-muted/30 border-2 border-border text-sm h-11 pl-10 font-bold rounded-xl focus:border-primary transition-all" onFocus={() => form.partName.length > 1 && setShowSuggestions(true)} />
                      <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                    </div>
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-2 bg-card border-2 border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                        {suggestions.map(s => (
                          <button key={s.id} type="button" className="w-full px-4 py-3 flex flex-col items-start gap-1 hover:bg-primary/5 text-left border-b border-border last:border-0 transition-colors" onClick={(e) => { e.stopPropagation(); selectSuggestion(s); }}>
                            <span className="text-xs font-black uppercase">{s.name}</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{s.categoryName} • {s.partNumber}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quantity</Label>
                      <Input type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} className="bg-muted/30 border-2 border-border text-sm h-11 font-bold rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Priority</Label>
                      <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="flex h-11 w-full rounded-xl border-2 border-border bg-muted/30 px-3 text-sm font-bold focus:outline-none appearance-none transition-all focus:border-primary cursor-pointer">
                        <option value="Normal">NORMAL</option>
                        <option value="Urgent">URGENT</option>
                        <option value="Critical">CRITICAL</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vehicle Asset Model *</Label>
                    <Input value={form.vehicleModel} onChange={e => setForm({ ...form, vehicleModel: e.target.value })} placeholder="e.g. 2018 Toyota Camry" className="bg-muted/30 border-2 border-border text-sm h-11 font-bold rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operational Details</Label>
                    <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Specific part requirements..." className="bg-muted/30 border-2 border-border text-sm min-h-[100px] p-4 resize-none font-medium rounded-xl focus:border-primary transition-all" />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-primary text-white font-black text-xs uppercase tracking-[0.2em] h-12 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all mt-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize Transmission"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Balanced History Table */}
        <div className="lg:col-span-8">
          <Card className="border-2 border-border rounded-2xl bg-card overflow-hidden shadow-xl h-full flex flex-col">
            <CardHeader className="bg-muted p-5 border-b border-border flex flex-row items-center justify-between space-y-0">
               <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                  <HistoryIcon className="w-4 h-4 text-primary" /> Acquisition Log
               </CardTitle>
               <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black px-2 py-0.5 rounded-sm">{history.length} RECORDS</Badge>
            </CardHeader>
            <div className="flex-1 overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50 border-b-2 border-border">
                  <TableRow>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-12 px-6 text-foreground">Asset & Part</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-12 text-center text-foreground">Status</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-12 px-6 text-right text-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingHistory ? (
                    <TableRow><TableCell colSpan={3} className="h-64 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary opacity-20" /></TableCell></TableRow>
                  ) : history.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="h-64 text-center text-sm font-medium text-muted-foreground">No records found</TableCell></TableRow>
                  ) : history.map((req) => (
                    <TableRow key={req.id} className={cn("border-b border-border transition-all h-14", req.status === 'Cancelled' ? "bg-muted/20 opacity-60" : "hover:bg-muted/40")}>
                      <TableCell className="px-6 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className={cn("font-black text-sm uppercase tracking-tight", req.status === 'Cancelled' && "line-through text-muted-foreground")}>
                             {req.partName} <span className="text-primary font-black ml-1 text-xs">x{req.quantity}</span>
                          </span>
                          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{req.vehicleModel}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <Badge className={cn("text-[9px] font-black uppercase px-2 py-0.5 border-none shadow-sm", getStatusColor(req.status))}>
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 text-right py-3">
                        {req.status === 'Pending' ? (
                          <Button variant="ghost" size="sm" onClick={() => { setRequestToCancel(req.id); setCancelDialogOpen(true); }} className="text-[10px] font-black uppercase text-red-500 hover:bg-red-50 hover:text-red-600 h-8 px-4 rounded-lg">
                             Abort
                          </Button>
                        ) : (
                           <div className="flex items-center justify-end gap-1.5 text-muted-foreground/30">
                              <span className="text-[9px] font-black uppercase italic">Closed</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                           </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-md bg-card border-2 border-border shadow-2xl p-8 rounded-2xl">
           <div className="space-y-6">
              <div className="flex items-center gap-4 text-red-600">
                 <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                    <Ban className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-lg font-black uppercase tracking-tight">Abort Procurement</h2>
                    <p className="text-xs font-bold text-muted-foreground">Permanent cancellation request</p>
                 </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                 Are you sure you want to cancel this acquisition log? Our procurement team will immediately halt the global parts search.
              </p>
              <div className="flex gap-3 pt-2">
                 <Button variant="outline" onClick={() => setCancelDialogOpen(false)} className="flex-1 text-xs font-black uppercase h-11 rounded-xl">Discard</Button>
                 <Button onClick={handleCancelRequest} className="flex-1 bg-red-600 text-white text-xs font-black uppercase h-11 rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all">
                    Confirm Abort
                 </Button>
              </div>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestPartsPage;
