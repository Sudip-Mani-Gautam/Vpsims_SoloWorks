import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import {
  Package, CheckCircle, Send, Loader2, Search, Car,
  History as HistoryIcon, X, AlertTriangle, Ban,
  ArrowUpRight, Clock, Zap, ShieldAlert, ChevronDown, Plus, UploadCloud
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import debounce from "lodash/debounce";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

interface Part {
  id: number;
  name: string;
  partNumber: string;
  categoryName: string;
}

interface Vehicle {
  id: number;
  make: string;
  model: string;
  licensePlate: string;
  year: number;
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

const statusMeta: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  Pending: { label: "Pending", bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/20", dot: "bg-amber-500" },
  Available: { label: "Available", bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20", dot: "bg-emerald-500" },
  Procuring: { label: "Procuring", bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/20", dot: "bg-blue-500" },
  Rejected: { label: "Rejected", bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/20", dot: "bg-red-500" },
  Cancelled: { label: "Cancelled", bg: "bg-slate-400/10", text: "text-slate-500", border: "border-slate-400/20", dot: "bg-slate-400" },
};

const priorityMeta = {
  Normal: { icon: <Clock size={12} />, color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800" },
  Urgent: { icon: <AlertTriangle size={12} />, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/40" },
  Critical: { icon: <ShieldAlert size={12} />, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/40" },
};

const RequestPartsPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<PartRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState<number | null>(null);

  const [form, setForm] = useState({
    partName: '', partNumber: '', vehicleModel: '',
    quantity: 1, priority: 'Normal', description: '', categoryId: '', image: ''
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setForm(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const [suggestions, setSuggestions] = useState<Part[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [myVehicles, setMyVehicles] = useState<Vehicle[]>([]);

  const fetchData = async () => {
    try {
      const hRes = await api.get('/partrequest/my');
      setHistory(hRes.data);
      const vRes = await api.get('/vehicle');
      setMyVehicles(vRes.data);
    } catch { toast.error("Failed to load request data."); }
    finally { setLoadingHistory(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const searchParts = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) { setSuggestions([]); setSearching(false); return; }
      setSearching(true);
      try {
        const res = await api.get(`/part/search?q=${query}`);
        setSuggestions(res.data);
        setShowSuggestions(true);
      } catch { }
      finally { setSearching(false); }
    }, 300), []
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
      toast.error("Please fill in Part Name and Vehicle Model.");
      return;
    }
    setLoading(true);
    try {
      await api.post('/partrequest', form);
      setSubmitted(true);
      fetchData();
      toast.success("Part request submitted successfully!");
    } catch { toast.error("Submission failed. Please try again."); }
    finally { setLoading(false); }
  };

  const handleCancelRequest = async () => {
    if (!requestToCancel) return;
    try {
      await api.patch(`/partrequest/${requestToCancel}/cancel`);
      toast.success("Request cancelled.");
      setCancelDialogOpen(false);
      fetchData();
    } catch { toast.error("Cancellation failed."); }
    finally { setRequestToCancel(null); }
  };

  const pendingCount = history.filter(r => r.status === 'Pending').length;
  const availableCount = history.filter(r => r.status === 'Available').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10" onClick={() => setShowSuggestions(false)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Request Parts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Search and request vehicle parts from our inventory</p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-semibold">
              <Clock size={13} /> {pendingCount} pending
            </div>
          )}
          {availableCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold">
              <CheckCircle size={13} /> {availableCount} ready
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Request Form ── */}
        <div className="lg:col-span-4">
          <Card className="border-border sticky top-6">
            <CardHeader className="border-b border-border py-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Package size={16} />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">New Request</CardTitle>
                  <p className="text-[10px] text-muted-foreground font-medium">Submit a part procurement request</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center py-8 gap-4"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <CheckCircle size={28} className="text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Request Submitted!</h3>
                      <p className="text-xs text-muted-foreground mt-1">Our team will start sourcing immediately.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-semibold mt-2"
                      onClick={() => { setSubmitted(false); setForm({ partName: '', partNumber: '', vehicleModel: '', quantity: 1, priority: 'Normal', description: '', categoryId: '', image: '' }); setImagePreview(null); fetchData(); }}
                    >
                      Submit Another Request
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    {/* Part Search */}
                    <div className="space-y-1.5 relative">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-muted-foreground">Part Name *</Label>
                        <span className="text-[10px] text-primary font-bold uppercase tracking-tighter italic">Select or Type</span>
                      </div>
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        {searching && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />}
                        <Input
                          value={form.partName}
                          onChange={e => handlePartNameChange(e.target.value)}
                          placeholder="Search or type part name..."
                          className="pl-9 h-10 text-sm border-border"
                          onFocus={() => form.partName.length > 1 && setShowSuggestions(true)}
                        />
                      </div>
                      {/* Autocomplete */}
                      <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
                          >
                            {suggestions.map(s => (
                              <button
                                key={s.id}
                                type="button"
                                className="w-full px-4 py-3 flex items-start gap-3 hover:bg-muted text-left border-b border-border last:border-0 transition-colors"
                                onClick={e => { e.stopPropagation(); selectSuggestion(s); }}
                              >
                                <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                                  <Package size={12} />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-foreground">{s.name}</p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.categoryName} · {s.partNumber}</p>
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Quantity + Priority */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground">Quantity</Label>
                        <Input type="number" min="1" value={form.quantity}
                          onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                          className="h-10 text-sm border-border"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground">Priority</Label>
                        <select
                          value={form.priority}
                          onChange={e => setForm({ ...form, priority: e.target.value })}
                          className={cn(
                            "flex h-10 w-full rounded-md border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer bg-background",
                            form.priority === 'Critical' ? "text-red-600 font-semibold" :
                              form.priority === 'Urgent' ? "text-amber-600 font-semibold" : ""
                          )}
                        >
                          <option value="Normal">Normal</option>
                          <option value="Urgent">Urgent</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>
                    </div>

                    {/* Vehicle Model - DUAL INPUT */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-muted-foreground">Vehicle Model *</Label>
                        {myVehicles.length > 0 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button type="button" className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:opacity-70">
                                <Car size={10} /> My Vehicles <ChevronDown size={10} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-xl border-border shadow-xl">
                              <p className="px-3 py-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Select Registered Car</p>
                              <DropdownMenuSeparator />
                              {myVehicles.map(v => (
                                <DropdownMenuItem
                                  key={v.id}
                                  className="p-2 cursor-pointer rounded-lg"
                                  onClick={() => setForm(f => ({ ...f, vehicleModel: `${v.year} ${v.make} ${v.model} (${v.licensePlate})` }))}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                      <Car size={14} />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-foreground">{v.make} {v.model}</p>
                                      <p className="text-[10px] text-muted-foreground">{v.licensePlate}</p>
                                    </div>
                                  </div>
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="p-2 cursor-pointer rounded-lg text-primary text-[10px] font-black uppercase justify-center" onClick={() => setForm(f => ({ ...f, vehicleModel: "" }))}>
                                <Plus size={10} className="mr-1" /> Custom Entry
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      <div className="relative">
                        <Car size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={form.vehicleModel}
                          onChange={e => setForm({ ...form, vehicleModel: e.target.value })}
                          placeholder=" e.g. '2023 Toyota Hilux' or Search"
                          className="pl-9 h-10 text-sm border-border"
                        />
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Reference Image <span className="font-normal opacity-60">(optional)</span></Label>
                      {imagePreview ? (
                        <div className="relative rounded-xl overflow-hidden border border-border bg-muted/30 h-32 flex items-center justify-center group">
                          <img src={imagePreview} alt="Preview" className="h-full w-full object-contain" />
                          <button 
                            type="button" 
                            onClick={() => { setImagePreview(null); setForm(f => ({ ...f, image: '' })); }}
                            className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-xl hover:bg-muted/30 hover:border-primary/50 transition-colors cursor-pointer bg-background">
                          <div className="flex flex-col items-center justify-center pt-4 pb-4">
                            <UploadCloud className="w-6 h-6 text-muted-foreground/50 mb-2" />
                            <p className="text-xs text-muted-foreground font-medium"><span className="text-primary font-bold">Click to upload</span> an image</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">PNG, JPG, GIF up to 5MB</p>
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Description <span className="font-normal opacity-60">(optional)</span></Label>
                      <Textarea
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        placeholder="Specific requirements or part condition notes..."
                        className="resize-none text-sm border-border min-h-[80px]"
                      />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full h-10 font-semibold shadow-md shadow-primary/10">
                      {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Send size={14} className="mr-2" />}
                      {loading ? "Submitting..." : "Submit Request"}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* ── Request History ── */}
        <div className="lg:col-span-8">
          <Card className="border-border">
            <CardHeader className="border-b border-border py-4 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <HistoryIcon size={18} className="text-primary" />
                  <div>
                    <CardTitle className="text-sm font-bold">Request History</CardTitle>
                    <p className="text-[10px] text-muted-foreground font-medium">{history.length} total requests</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 size={24} className="animate-spin text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">Loading your requests...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-8">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3 opacity-50">
                    <Package size={22} className="text-muted-foreground" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">No requests yet</h4>
                  <p className="text-xs text-muted-foreground mt-1">Use the form to submit your first part request</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {history.map((req) => {
                    const sm = statusMeta[req.status] ?? statusMeta['Pending'];
                    const pm = priorityMeta[req.priority as keyof typeof priorityMeta] ?? priorityMeta['Normal'];
                    return (
                      <div
                        key={req.id}
                        className={cn(
                          "flex items-center justify-between gap-4 px-6 py-4 transition-colors",
                          req.status === 'Cancelled' ? "opacity-50" : "hover:bg-muted/30"
                        )}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", sm.bg, sm.text)}>
                            <Package size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn("text-sm font-semibold text-foreground truncate", req.status === 'Cancelled' && "line-through text-muted-foreground")}>
                                {req.partName}
                              </span>
                              <span className="text-xs text-muted-foreground">×{req.quantity}</span>
                              <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold", pm.color, pm.bg)}>
                                {pm.icon} {req.priority}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{req.vehicleModel}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border", sm.bg, sm.text, sm.border)}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", sm.dot)} />
                            {sm.label}
                          </span>
                          {req.status === 'Pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setRequestToCancel(req.id); setCancelDialogOpen(true); }}
                              className="h-8 px-3 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 font-semibold rounded-lg"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Confirm Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl border-border">
          <div className="flex items-start gap-4 pt-2">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500 flex-shrink-0">
              <Ban size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Cancel this request?</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Cancelling will stop the procurement process for this part. This action cannot be undone.
              </p>
            </div>
          </div>
          <DialogFooter className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" className="flex-1 font-semibold" onClick={() => setCancelDialogOpen(false)}>
              Keep Request
            </Button>
            <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold" onClick={handleCancelRequest}>
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestPartsPage;

