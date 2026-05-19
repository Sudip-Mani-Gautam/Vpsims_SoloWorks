import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Mail, CheckCircle, Clock, Loader2, Search, Link as LinkIcon, Eye, List, Receipt } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Order {
  id: number; customerName: string; totalAmount: number; status: string;
  paymentStatus: string; amountPaid: number; createdAt: string; dueDate?: string;
  items: Array<{ partName: string; quantity: number; unitPrice: number }>;
}

const SalesInvoices = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => { const { data } = await api.get('/order'); return data; }
  });

  const payMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/order/${id}/payment`, { paymentStatus: 'Paid', amountPaid: orders.find(o => o.id === id)?.totalAmount }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['orders'] }); toast.success("Payment marked as paid."); }
  });

  const emailMutation = useMutation({
    mutationFn: (id: number) => api.post(`/order/${id}/send-invoice`),
    onSuccess: () => toast.success("Invoice sent to customer via email."),
    onError: () => toast.error("Failed to send invoice. Please try again.")
  });

  const handleDownloadPdf = async (id: number) => {
    try {
      const response = await api.get(`/order/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_INV-${id.toString().padStart(6, '0')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Invoice PDF downloaded.");
    } catch {
      toast.error("PDF generation failed. Please try again.");
    }
  };

  const fetchPaymentHistory = async (orderId: number) => {
    setLoadingHistory(true);
    try {
      const res = await api.get(`/payment/submissions`);
      const filtered = res.data.filter((s: any) => s.orderId === orderId);
      setPaymentHistory(filtered);
    } catch {
      toast.error("Failed to load payment history.");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    fetchPaymentHistory(order.id);
  };

  const filteredOrders = useMemo(() => orders.filter(o => {
    const matchSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) ||
                        `INV-${o.id.toString().padStart(6, '0')}`.includes(search);
    const matchFilter = filter === "All" || o.paymentStatus === filter;
    return matchSearch && matchFilter;
  }), [orders, search, filter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Sales Invoices</h1>
          <p className="page-subtitle">View, manage and send customer sales invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Invoices</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-primary text-white hover:bg-primary/90 h-9" asChild>
            <Link to="./new"><Plus className="w-4 h-4 mr-2" /> New Invoice</Link>
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="card-standard border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="py-3 px-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 flex items-center justify-center text-blue-600 flex-shrink-0">
            <LinkIcon className="w-4 h-4" />
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            To create a professional invoice, use the{" "}
            <Link to="./new" className="font-semibold underline hover:no-underline">Dedicated Creation Portal</Link>.
            Invoices will appear here automatically after a transaction is finalized.
          </p>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9 h-9"
          placeholder="Search by Invoice ID or customer name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card className="card-standard overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-overline pl-5">Invoice #</TableHead>
                <TableHead className="text-overline">Customer</TableHead>
                <TableHead className="text-overline">Date</TableHead>
                <TableHead className="text-overline">Due Date</TableHead>
                <TableHead className="text-overline">Amount</TableHead>
                <TableHead className="text-overline text-center">Status</TableHead>
                <TableHead className="text-overline text-right pr-5">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-caption">Loading invoices…</p>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-foreground">No invoices found</p>
                    <p className="text-caption mt-1">Create a sale through the Sales Portal to generate an invoice.</p>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.map((inv) => {
                const isOverdue = inv.paymentStatus !== "Paid" && inv.dueDate && new Date(inv.dueDate) < new Date();
                return (
                  <TableRow key={inv.id} className={cn("hover:bg-muted/40 transition-colors", isOverdue && "bg-red-50/50 dark:bg-red-950/20")}>
                    <TableCell className="pl-5 font-mono font-bold text-primary text-sm">
                      INV-{inv.id.toString().padStart(6, "0")}
                      {isOverdue && <Badge className="ml-2 bg-red-100 text-red-700 border border-red-200 text-[9px] dark:bg-red-950 dark:text-red-300 dark:border-red-800">OVERDUE</Badge>}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">{inv.customerName}</TableCell>
                    <TableCell className="text-caption">{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className={cn("text-sm", isOverdue ? "text-red-600 font-semibold" : "text-caption")}>
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="font-bold tabular-nums text-foreground">NPR {inv.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border",
                          inv.paymentStatus === "Paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                        )}>
                          {inv.paymentStatus === "Paid" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {inv.paymentStatus}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-5">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => handleDownloadPdf(inv.id)} title="Download PDF">
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-3 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => emailMutation.mutate(inv.id)}
                          disabled={emailMutation.isPending || inv.paymentStatus === "Paid"}>
                          <Mail className="w-3.5 h-3.5 mr-1.5" /> Email
                        </Button>
                         {inv.paymentStatus !== "Paid" && (
                          <Button size="sm" className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => payMutation.mutate(inv.id)}
                            disabled={payMutation.isPending}>
                            Mark Paid
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs border-primary/20 text-primary hover:bg-primary/5"
                          onClick={() => handleViewDetails(inv)}>
                          <Eye className="w-3.5 h-3.5 mr-1.5" /> Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Order Details & Payment History Modal ── */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 glass-card border-white/10">
          <DialogHeader className="p-6 pb-4 border-b border-border/40">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-2xl font-heading font-black tracking-tight">
                  Invoice INV-{selectedOrder?.id.toString().padStart(6, '0')}
                </DialogTitle>
                <DialogDescription className="text-base font-medium">
                  Detailed view for <span className="text-foreground font-bold">{selectedOrder?.customerName}</span>'s purchase.
                </DialogDescription>
              </div>
              <Badge className={cn("text-sm px-3 py-1", 
                selectedOrder?.paymentStatus === "Paid" ? "bg-emerald-500" : "bg-amber-500"
              )}>
                {selectedOrder?.paymentStatus}
              </Badge>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Grid for Items and Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column: Items */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <List className="w-4 h-4" /> Order Items
                </h3>
                <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="text-[10px] font-bold">Part</TableHead>
                        <TableHead className="text-[10px] font-bold text-center">Qty</TableHead>
                        <TableHead className="text-[10px] font-bold text-right">Price</TableHead>
                        <TableHead className="text-[10px] font-bold text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder?.items.map((item, idx) => (
                        <TableRow key={idx} className="hover:bg-muted/30">
                          <TableCell className="text-xs font-semibold py-2">{item.partName}</TableCell>
                          <TableCell className="text-xs text-center py-2">{item.quantity}</TableCell>
                          <TableCell className="text-xs text-right py-2 tabular-nums">NPR {item.unitPrice.toLocaleString()}</TableCell>
                          <TableCell className="text-xs text-right py-2 font-bold tabular-nums">NPR {(item.quantity * item.unitPrice).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="p-4 bg-muted/10 border-t border-border/40 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-muted-foreground">Total Invoice Amount</span>
                    <span className="text-lg font-black text-foreground">NPR {selectedOrder?.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Payment History */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Receipt className="w-4 h-4" /> Payment History
                </h3>
                {loadingHistory ? (
                  <div className="h-32 flex items-center justify-center border border-dashed border-border rounded-xl">
                    <Loader2 className="w-6 h-6 animate-spin text-primary opacity-40" />
                  </div>
                ) : paymentHistory.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center border border-dashed border-border rounded-xl text-muted-foreground gap-2">
                    <Clock className="w-8 h-8 opacity-20" />
                    <p className="text-xs font-medium">No payment attempts found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentHistory.map((pay) => (
                      <div key={pay.id} className="p-3 rounded-xl border border-border/50 bg-muted/10 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(pay.paymentDate || pay.submittedAt).toLocaleDateString()}</span>
                          <Badge className={cn("text-[9px] uppercase font-bold", 
                            pay.status === "Verified" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                            pay.status === "Rejected" ? "bg-red-100 text-red-700 border-red-200" :
                            "bg-amber-100 text-amber-700 border-amber-200"
                          )}>
                            {pay.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-sm font-black text-foreground">NPR {pay.amountPaid.toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">{pay.paymentMethod} • Ref: {pay.referenceNumber || 'N/A'}</p>
                          </div>
                          {pay.proofImageUrl && (
                            <Button variant="link" size="sm" className="h-auto p-0 text-[10px] font-bold text-primary" asChild>
                              <a href={pay.proofImageUrl} target="_blank" rel="noreferrer">View Proof</a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Outstanding Balance */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                  <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase">
                    <span>Total Paid</span>
                    <span className="text-emerald-600">NPR {selectedOrder?.amountPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black uppercase">
                    <span>Remaining</span>
                    <span className="text-primary text-base">NPR {((selectedOrder?.totalAmount || 0) - (selectedOrder?.amountPaid || 0)).toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="p-4 border-t border-border/40 bg-muted/5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedOrder(null)} className="font-bold">Close Details</Button>
            {selectedOrder?.paymentStatus !== "Paid" && (
              <Button className="bg-primary text-white font-bold" onClick={() => {
                handleDownloadPdf(selectedOrder!.id);
                setSelectedOrder(null);
              }}>
                Download PDF Invoice
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesInvoices;

