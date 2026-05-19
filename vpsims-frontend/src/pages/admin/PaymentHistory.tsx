import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Receipt, Loader2, Filter, CreditCard, Wallet, Banknote } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PaymentSubmission {
  id: number;
  userName: string;
  orderId: number;
  amountPaid: number;
  paymentMethod: string;
  referenceNumber?: string;
  paymentDate: string;
  status: string;
  submittedAt: string;
}

const PaymentHistory = () => {
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payment/submissions');
      setSubmissions(res.data);
    } catch {
      toast.error("Failed to load payment history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = submissions.filter(s => {
    const matchesSearch = s.userName.toLowerCase().includes(search.toLowerCase()) || 
                         String(s.orderId).includes(search) ||
                         (s.referenceNumber || '').toLowerCase().includes(search.toLowerCase());
    const matchesMethod = methodFilter === "All" || s.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const getMethodIcon = (method: string) => {
    if (method.includes('Stripe') || method.includes('Card')) return <CreditCard className="w-3.5 h-3.5" />;
    if (method.includes('Bank')) return <Wallet className="w-3.5 h-3.5" />;
    return <Banknote className="w-3.5 h-3.5" />;
  };

  return (
    <div className="max-w-[1400px] mx-auto py-6 px-4 space-y-6 bg-background text-foreground min-h-screen">
      {/* Compact Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">Payment Audit Trail</h1>
            <p className="text-muted-foreground text-xs font-medium">Complete record of all verified and pending transactions.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input 
              placeholder="Search by customer, order, ref..." 
              className="pl-9 h-9 w-72 bg-muted/20 text-xs rounded-lg"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="h-9 w-32 text-xs bg-muted/20 rounded-lg border border-input px-3"
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
          >
            <option value="All">All Methods</option>
            <option value="Stripe">Stripe</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="QR Payment">QR Payment</option>
          </select>
        </div>
      </div>

      <Card className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-32 text-center text-muted-foreground text-sm font-medium">No payment records found.</div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b border-border">
                  <TableHead className="pl-6 py-4 text-[10px] font-black uppercase tracking-widest">Transaction Date</TableHead>
                  <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest">Customer</TableHead>
                  <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest">Order ID</TableHead>
                  <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest">Amount</TableHead>
                  <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest">Payment Method</TableHead>
                  <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest">Reference</TableHead>
                  <TableHead className="pr-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((sub) => (
                  <TableRow key={sub.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                    <TableCell className="pl-6 py-4 text-[11px] text-muted-foreground font-medium">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-xs font-bold text-foreground">{sub.userName}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="secondary" className="font-mono font-bold text-[10px]">#{sub.orderId}</Badge>
                    </TableCell>
                    <TableCell className="py-4 tabular-nums">
                      <span className="text-xs font-black text-primary">NPR {sub.amountPaid.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="py-4">
                       <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                            {getMethodIcon(sub.paymentMethod)}
                         </div>
                         <span className="text-xs font-medium">{sub.paymentMethod}</span>
                       </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[120px] block" title={sub.referenceNumber}>
                        {sub.referenceNumber || '—'}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6 py-4 text-right">
                      <Badge variant="outline" className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5",
                        sub.status === 'Verified' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                        sub.status === 'Rejected' ? "bg-red-500/10 text-red-600 border-red-500/20" :
                        "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      )}>
                        {sub.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentHistory;
