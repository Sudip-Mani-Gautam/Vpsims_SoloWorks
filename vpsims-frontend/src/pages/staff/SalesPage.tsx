import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ShoppingCart, Plus, Minus, Trash2, X, Clock, CheckCircle, 
  AlertCircle, XCircle, ExternalLink, Loader2, Search, Filter, 
  ChevronRight, CalendarDays, DollarSign, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OrderItem {
  partId: string;
  quantity: number;
}

interface Order {
  id: number;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: any[];
}

interface Part {
  id: number;
  name: string;
  price: number;
  stockQuantity: number;
}

const SalesPage = () => {
  const { user } = useAuth();
  const isAdminOrStaff = user?.role === 'Admin' || user?.role === 'Staff';
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([{ partId: '', quantity: 1 }]);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const calculateTotal = () => {
    let subtotal = 0;
    orderItems.forEach(item => {
      const part = parts.find(p => p.id === parseInt(item.partId));
      if (part) subtotal += part.price * item.quantity;
    });
    const isLoyalty = subtotal > 5000;
    const discount = isLoyalty ? subtotal * 0.1 : 0;
    return { subtotal, discount, total: subtotal - discount, isLoyalty };
  };

  const { subtotal, discount, total, isLoyalty } = calculateTotal();

  const load = async () => {
    try {
      const [ordersRes, partsRes] = await Promise.all([
        isAdminOrStaff ? api.get('/order') : api.get('/order/my'),
        api.get('/part'),
      ]);
      setOrders(ordersRes.data);
      setParts(partsRes.data);
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to load procurement registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addItem = () => setOrderItems([...orderItems, { partId: '', quantity: 1 }]);
  const removeItem = (i: number) => setOrderItems(orderItems.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof OrderItem, val: string | number) => {
    const updated = [...orderItems];
    updated[i] = { ...updated[i], [field]: val };
    setOrderItems(updated);
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.some(it => !it.partId)) {
        toast.warning("Please select a component for each line item.");
        return;
    }
    setSubmitting(true);
    const payload = { items: orderItems.map((it) => ({ partId: parseInt(it.partId), quantity: it.quantity })) };
    try {
      await api.post('/order', payload);
      toast.success("Procurement request submitted to the blockchain.");
      setIsModalOpen(false);
      setOrderItems([{ partId: '', quantity: 1 }]);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Order request failed. Verify stock availability.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/order/${id}/status`, { status });
      toast.success(`Order status updated to ${status}`);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Status update failed.');
    }
  };

  const getStatusBadge = (s: string) => {
    const map: any = { 
      Pending: { color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock }, 
      Processing: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: ExternalLink }, 
      Completed: { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle }, 
      Cancelled: { color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', icon: XCircle } 
    };
    const { color, icon: Icon } = map[s] || { color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: AlertCircle };
    return (
      <Badge variant="outline" className={`${color} font-bold flex items-center gap-1.5 px-2 py-0.5`}>
        <Icon className="w-3 h-3" /> {s}
      </Badge>
    );
  };

  const filtered = orders.filter(o => 
    String(o.id).includes(search) || 
    o.customerName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-black tracking-tight text-foreground">Sales & Orders</h1>
          <p className="text-muted-foreground font-medium">
            {isAdminOrStaff ? 'Execute and monitor the global procurement log.' : 'Track your personal procurement history.'}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-primary text-white hover:bg-primary/90 font-bold shadow-lg shadow-primary/20 hover-lift">
          <ShoppingCart className="w-4 h-4 mr-2" /> Place Order Request
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
                className="pl-11 h-11 bg-card border-border/50 focus:border-primary transition-all rounded-xl" 
                placeholder="Search by Reference or Account Holder..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
            />
        </div>
        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl">
            <Filter className="w-4 h-4" />
        </Button>
      </div>

      <Card className="glass-card shadow-xl overflow-hidden border-border/40">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold text-xs uppercase tracking-wider pl-6">Reference</TableHead>
                {isAdminOrStaff && <TableHead className="font-bold text-xs uppercase tracking-wider">Customer Entity</TableHead>}
                <TableHead className="font-bold text-xs uppercase tracking-wider">Line Items</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Total Value (NPR)</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">System State</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Log Date</TableHead>
                {isAdminOrStaff && <TableHead className="font-bold text-xs uppercase tracking-wider text-right pr-6">Lifecycle Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={isAdminOrStaff ? 7 : 5} className="h-64 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground font-medium">Fetching procurement data...</p>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={isAdminOrStaff ? 7 : 5} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                            <Package className="w-12 h-12 text-muted-foreground opacity-20" />
                            <p className="text-muted-foreground font-medium">No order history available.</p>
                        </div>
                    </TableCell>
                </TableRow>
              ) : filtered.map((o) => (
                <TableRow key={o.id} className="hover:bg-muted/20 transition-colors group">
                  <TableCell className="pl-6 font-black text-primary">
                    <div className="flex items-center gap-2">
                        <code className="text-xs">ORD-{String(o.id).padStart(5, '0')}</code>
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </TableCell>
                  {isAdminOrStaff && (
                    <TableCell>
                        <div className="flex items-center gap-2">
                             <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center text-[10px] font-black text-secondary">
                                {o.customerName?.[0]?.toUpperCase()}
                            </div>
                            <span className="font-bold text-foreground">{o.customerName}</span>
                        </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge variant="secondary" className="font-bold text-[10px] uppercase bg-muted/50 border-border/50">
                        {o.items?.length || 0} Components
                    </Badge>
                  </TableCell>
                  <TableCell className="font-black tabular-nums text-foreground">
                    Rs. {(o.totalAmount ?? 0).toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(o.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </TableCell>
                  {isAdminOrStaff && (
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-[9px] font-black uppercase tracking-tighter hover:bg-primary hover:text-white transition-all"
                            onClick={() => {
                                toast.promise(api.post(`/order/${o.id}/send-invoice`), {
                                    loading: 'Dispatching invoice...',
                                    success: 'Invoice transmitted to customer.',
                                    error: 'Transmission failed.'
                                });
                            }}
                        >
                            <Mail className="w-3 h-3 mr-1" /> Send Invoice
                        </Button>
                        <Select value={o.status} onValueChange={(val) => updateStatus(o.id, val)}>
                            <SelectTrigger className="w-[120px] h-8 text-[9px] font-black bg-background/50 uppercase">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {['Pending', 'Processing', 'Completed', 'Cancelled'].map((s) => (
                                    <SelectItem key={s} value={s} className="text-[10px] font-bold uppercase">{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl border-white/10 shadow-2xl rounded-2xl overflow-hidden glass-card p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-muted/10">
            <DialogTitle className="text-2xl font-heading font-bold">New Order Request</DialogTitle>
            <DialogDescription>Select components from the inventory to generate a new procurement transaction.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOrder}>
            <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
                {orderItems.map((item, i) => (
                   <div key={i} className="group relative grid grid-cols-1 md:grid-cols-[1fr,120px] gap-4 items-end bg-muted/10 p-4 rounded-xl border border-border/30 hover:border-primary/20 transition-all">
                        <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Component Specification</Label>
                             <Select value={item.partId} onValueChange={(val) => updateItem(i, 'partId', val)}>
                                <SelectTrigger className="bg-background/50 h-10">
                                    <SelectValue placeholder="Select component..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {parts.filter(p => p.stockQuantity > 0 || p.id === parseInt(item.partId)).map((p) => (
                                        <SelectItem key={p.id} value={p.id.toString()} className="text-sm">
                                            <div className="flex flex-col">
                                                <span className="font-bold">{p.name}</span>
                                                <span className="text-[10px] text-muted-foreground">Rs. {(p.price ?? 0).toLocaleString()} • {p.stockQuantity ?? 0} in stock</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                             </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quantity</Label>
                            <div className="flex h-10 items-center justify-between bg-background/50 border border-input rounded-md px-2">
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateItem(i, 'quantity', Math.max(1, item.quantity - 1))}><Minus className="w-3 h-3" /></Button>
                                <span className="font-black text-sm w-8 text-center tabular-nums">{item.quantity}</span>
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateItem(i, 'quantity', item.quantity + 1)}><Plus className="w-3 h-3" /></Button>
                            </div>
                        </div>
                        {orderItems.length > 1 && (
                            <button 
                                type="button" 
                                onClick={() => removeItem(i)}
                                className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                   </div>
                ))}

                <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full border-dashed border-2 hover:bg-primary/5 hover:border-primary/30 transition-all font-bold"
                    onClick={addItem}
                >
                    <Plus className="w-4 h-4 mr-2" /> Append Line Item
                </Button>

                <div className="pt-4 border-t border-border/50 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase">
                        <span>Subtotal Value</span>
                        <span>NPR {(subtotal ?? 0).toLocaleString()}</span>
                    </div>
                    {isLoyalty && (
                        <div className="flex justify-between text-xs font-black text-emerald-500 uppercase animate-pulse">
                            <span>Loyalty Protocol Applied (-10%)</span>
                            <span>- NPR {(discount ?? 0).toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-lg font-black text-foreground">
                        <span>Grand Strategy Total</span>
                        <span className="text-primary font-black">NPR {(total ?? 0).toLocaleString()}</span>
                    </div>
                </div>
            </div>
            
            <DialogFooter className="p-6 bg-muted/5 border-t border-border/50">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="font-bold">Discard</Button>
              <div className="flex-1" />
              <Button type="submit" className="bg-primary text-white hover:bg-primary/90 font-bold shadow-lg shadow-primary/20" disabled={submitting}>
                 {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <><CheckCircle className="w-4 h-4 mr-2" /> Finalize Order Strategy</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesPage;
