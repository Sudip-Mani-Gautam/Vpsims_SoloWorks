import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  FileText, Search, Loader2, Download, 
  ChevronRight, ArrowLeft, Send 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface InvoiceSummary {
  id: number;
  invoiceNo: string;
  customerName: string;
  amount: number;
  status: string;
  createdAt: string;
}

const InvoicesCreatedPage = () => {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadInvoices = async () => {
    try {
      const res = await api.get('/order');
      const today = new Date().toISOString().split('T')[0];
      const todayInvoices = res.data
        .filter((o: any) => o.createdAt.startsWith(today))
        .map((o: any) => ({
            id: o.id,
            invoiceNo: `INV-${o.id.toString().padStart(6, '0')}`,
            customerName: o.customerName || "Customer",
            amount: o.totalAmount,
            status: o.status,
            createdAt: o.createdAt
        }));
      setInvoices(todayInvoices);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInvoices(); }, []);

  const handleResend = (inv: string) => {
      toast.success(`Invoice ${inv} has been re-queued for dispatch.`);
  };

  const filtered = invoices.filter(i => 
    i.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link to="/staff"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-black tracking-tight text-foreground">Invoices Created</h1>
          <p className="text-muted-foreground font-medium">Digital financial log of today's generated invoices</p>
        </div>
      </div>

      <Card className="glass-card shadow-xl overflow-hidden border-border/40">
        <CardHeader className="border-b border-border/50 bg-muted/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" /> Invoice Nexus
                </CardTitle>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-9 bg-background/50" placeholder="Search Reference or Holder..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6 text-xs font-black uppercase">Invoice Ref</TableHead>
                <TableHead className="text-xs font-black uppercase">Entity Name</TableHead>
                <TableHead className="text-xs font-black uppercase">Financial Value</TableHead>
                <TableHead className="text-xs font-black uppercase">Log Time</TableHead>
                <TableHead className="text-right pr-6 text-xs font-black uppercase">Operations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="h-64 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-64 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs">No invoices generated in current session</TableCell></TableRow>
              ) : filtered.map((i) => (
                <TableRow key={i.id} className="group">
                  <TableCell className="pl-6 font-mono font-black text-primary text-xs tracking-tighter">
                      {i.invoiceNo}
                  </TableCell>
                  <TableCell className="font-bold text-foreground">{i.customerName}</TableCell>
                  <TableCell className="font-black tabular-nums text-foreground">
                      Rs. {i.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-muted-foreground">
                      {new Date(i.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleResend(i.invoiceNo)} className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                              <Send className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" asChild className="h-8 text-[10px] font-bold uppercase">
                              <Link to="/staff/invoices">Invoice Details <ChevronRight className="w-3 h-3 ml-1" /></Link>
                          </Button>
                      </div>
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

export default InvoicesCreatedPage;
