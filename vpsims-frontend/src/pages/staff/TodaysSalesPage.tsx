import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  ShoppingCart, Search, Filter, Loader2, Package, 
  CalendarDays, ChevronRight, ArrowLeft 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';

interface Order {
  id: number;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: any[];
}

const TodaysSalesPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadOrders = async () => {
    try {
      const res = await api.get('/order');
      // Filter for today's orders
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = res.data.filter((o: Order) => o.createdAt.startsWith(today));
      setOrders(todayOrders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const filtered = orders.filter(o => 
    String(o.id).includes(searchTerm) || 
    o.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link to="/staff"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-black tracking-tight text-foreground">Today's Sales</h1>
          <p className="text-muted-foreground font-medium">Detailed log of every product sold today</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card">
              <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <ShoppingCart className="w-5 h-5" />
                      </div>
                      <div>
                          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                          <p className="text-2xl font-black">NPR {orders.reduce((s, o) => s + o.totalAmount, 0).toLocaleString()}</p>
                      </div>
                  </div>
              </CardContent>
          </Card>
          <Card className="glass-card">
              <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                          <Package className="w-5 h-5" />
                      </div>
                      <div>
                          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Units Dispatched</p>
                          <p className="text-2xl font-black">{orders.reduce((s, o) => s + (o.items?.length || 0), 0)}</p>
                      </div>
                  </div>
              </CardContent>
          </Card>
          <Card className="glass-card">
              <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center text-info">
                          <Filter className="w-5 h-5" />
                      </div>
                      <div>
                          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Transactions</p>
                          <p className="text-2xl font-black">{orders.length}</p>
                      </div>
                  </div>
              </CardContent>
          </Card>
      </div>

      <Card className="glass-card shadow-xl overflow-hidden border-border/40">
        <CardHeader className="border-b border-border/50 bg-muted/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-lg font-black uppercase tracking-widest">Inventory Dispatch Log</CardTitle>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-9 bg-background/50" placeholder="Filter by Ref or Account..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Ref</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Sold Components</TableHead>
                <TableHead>Value (NPR)</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="h-64 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-64 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs">No sales registered today</TableCell></TableRow>
              ) : filtered.map((o) => (
                <TableRow key={o.id} className="group">
                  <TableCell className="pl-6 font-mono font-bold text-primary text-xs">#{o.id}</TableCell>
                  <TableCell className="font-black">{o.customerName}</TableCell>
                  <TableCell>
                      <div className="flex flex-wrap gap-1">
                          {o.items?.map((item: any, idx: number) => (
                              <Badge key={idx} variant="outline" className="bg-muted/50 text-[9px] font-bold">
                                  {item.partName || "Component"} x{item.quantity}
                              </Badge>
                          ))}
                          {(!o.items || o.items.length === 0) && <span className="text-xs text-muted-foreground">Direct Sale</span>}
                      </div>
                  </TableCell>
                  <TableCell className="font-black tabular-nums">Rs. {o.totalAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-xs font-medium text-muted-foreground">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                  <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="sm" asChild className="h-8 text-[10px] font-bold uppercase">
                          <Link to="/staff/sales">View Full Log <ChevronRight className="w-3 h-3 ml-1" /></Link>
                      </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TodaysSalesPage;
