import { useEffect, useState } from 'react';
import api, { API_BASE_URL } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  Building2, CreditCard, QrCode, Phone, Mail, Upload,
  Clock, CheckCircle2, XCircle, Loader2, Send, FileText,
  AlertCircle, History, Receipt, ArrowRight, ShieldCheck,
  Zap, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BusinessPaymentDetail {
  id: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode?: string;
  qrCodeImageUrl?: string;
  instructions?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
}

interface PaymentSubmission {
  id: number;
  orderId: number;
  amountPaid: number;
  paymentMethod: string;
  referenceNumber?: string;
  paymentDate: string;
  proofImageUrl?: string;
  status: string;
  rejectionReason?: string;
  submittedAt: string;
}

interface Order {
  id: number;
  totalAmount: number;
  paymentStatus: string;
  amountPaid: number;
  status: string;
  createdAt: string;
}

const emptyForm = {
  orderId: '',
  amountPaid: '',
  paymentMethod: 'Bank Transfer',
  referenceNumber: '',
  paymentDate: new Date().toISOString().split('T')[0],
  notes: '',
  proofImageUrl: '',
};

const CustomerPaymentPage = () => {
  const { user } = useAuth();
  const [details, setDetails] = useState<BusinessPaymentDetail[]>([]);
  const [history, setHistory] = useState<PaymentSubmission[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [viewProof, setViewProof] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [stripeLoading, setStripeLoading] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("methods");

  const fetchData = async () => {
    setLoadingDetails(true);
    setLoadingHistory(true);
    setLoadingOrders(true);
    try {
      const [dRes, hRes, oRes] = await Promise.all([
        api.get('/payment/details'),
        api.get('/payment/submissions/my'),
        api.get('/order/my')
      ]);
      setDetails(dRes.data.filter((d: BusinessPaymentDetail) => d.isActive));
      setHistory(hRes.data);
      setOrders(oRes.data);
    } catch { toast.error('Failed to sync payment data.'); }
    finally {
      setLoadingDetails(false);
      setLoadingHistory(false);
      setLoadingOrders(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.orderId || !form.amountPaid) { toast.error('Order ID and amount are required.'); return; }
    setSubmitting(true);
    try {
      await api.post('/payment/submissions', {
        ...form,
        orderId: parseInt(form.orderId),
        amountPaid: parseFloat(form.amountPaid),
        paymentDate: new Date(form.paymentDate).toISOString()
      });
      toast.success('Proof submitted! Admin will verify soon.');
      setForm(emptyForm);
      setSubmitOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally { setSubmitting(false); }
  };

  const handleStripePayment = async (orderId: number) => {
    setStripeLoading(orderId);
    try {
      const res = await api.post('/stripe/create-session', { orderId });
      window.location.href = res.data.url;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Stripe error.');
    } finally { setStripeLoading(null); }
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProof(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/upload/payment-proof', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm({ ...form, proofImageUrl: res.data.url });
      toast.success('Proof uploaded.');
    } catch { toast.error('Upload failed.'); }
    finally { setUploadingProof(false); }
  };

  const firstPendingOrder = orders.find(o => o.paymentStatus !== 'Paid');

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6 bg-background text-foreground min-h-screen">
      {/* Compact Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">Payments & Billing</h1>
            <p className="text-muted-foreground text-xs font-medium">Manage your invoices and payment methods.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-9 px-4 rounded-lg bg-emerald-500/5 text-emerald-600 border-emerald-500/20 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Secure Transactions
          </Badge>
          <Button onClick={() => setSubmitOpen(true)} size="sm" className="bg-primary text-white font-bold h-9 rounded-lg">
            <Upload className="w-3.5 h-3.5 mr-2" /> Submit Proof
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl w-full md:w-auto">
          <TabsTrigger value="methods" className="rounded-lg px-6 text-xs font-bold">Payment Methods</TabsTrigger>
          <TabsTrigger value="orders" className="rounded-lg px-6 text-xs font-bold">Pending Invoices</TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg px-6 text-xs font-bold">History</TabsTrigger>
        </TabsList>

        {/* ── Tab: Payment Methods ── */}
        <TabsContent value="methods" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Stripe Card */}
            <Card className="border border-border rounded-2xl overflow-hidden bg-card shadow-lg hover:shadow-xl transition-all group">
               <CardHeader className="py-4 px-5 bg-indigo-500/5 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 px-3 rounded-xl bg-white border border-indigo-100 flex items-center justify-center shadow-sm">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" className="h-5 object-contain" alt="Stripe" />
                    </div>
                    <CardTitle className="text-sm font-black text-indigo-700">Credit/Debit Card</CardTitle>
                  </div>
                  <Badge className="bg-indigo-600 text-[10px] font-black uppercase">Secure Checkout</Badge>
               </CardHeader>
               <CardContent className="p-5 space-y-4">
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                    Pay instantly using Visa, Mastercard, or American Express. Automated confirmation and instant receipt.
                  </p>
                  <div className="flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-all text-xl">
                     <i className="fa-brands fa-cc-visa text-[#1A1F71]" />
                     <i className="fa-brands fa-cc-mastercard text-[#EB001B]" />
                     <i className="fa-brands fa-stripe text-indigo-600 ml-auto text-2xl" />
                  </div>
                  {firstPendingOrder ? (
                    <Button 
                      className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20"
                      onClick={() => handleStripePayment(firstPendingOrder.id)}
                      disabled={stripeLoading === firstPendingOrder.id}
                    >
                      {stripeLoading === firstPendingOrder.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
                      Pay Order #{firstPendingOrder.id}
                    </Button>
                  ) : (
                    <Button disabled variant="outline" className="w-full h-10 rounded-xl opacity-50">No Pending Invoices</Button>
                  )}
               </CardContent>
            </Card>

            {/* Khalti Card */}
            <Card className="border border-border rounded-2xl overflow-hidden bg-card shadow-lg hover:shadow-xl transition-all group">
               <CardHeader className="py-4 px-5 bg-purple-500/5 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 px-3 rounded-xl bg-white border border-purple-100 flex items-center justify-center shadow-sm overflow-hidden">
                      <img src="/khalti.png" className="h-6 object-contain" alt="Khalti" />
                    </div>
                    <CardTitle className="text-sm font-black text-purple-700">Khalti Wallet</CardTitle>
                  </div>
                  <Badge className="bg-purple-600 text-[10px] font-black uppercase">Local Pay</Badge>
               </CardHeader>
               <CardContent className="p-5 space-y-4">
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                    Fastest way to pay via Khalti Wallet or Bank Link. Supports 20+ Nepali banks and direct wallet transfers.
                  </p>
                  <div className="flex items-center gap-2">
                     <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded text-[10px] font-bold text-purple-600 uppercase tracking-tighter">Instant Wallet Transfer</div>
                  </div>
                  <Button 
                    className="w-full h-10 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20"
                    onClick={() => setActiveTab("orders")}
                  >
                    Proceed to Pay
                  </Button>
               </CardContent>
            </Card>

            {/* Existing Bank Accounts */}
            {loadingDetails ? (
              [1].map(i => <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />)
            ) : details.map(d => (
              <Card key={d.id} className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-all">
                <CardHeader className="py-4 px-5 border-b border-border bg-muted/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-sm font-bold">{d.bankName}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account Name</span>
                      <span className="text-xs font-bold">{d.accountName}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account Number</span>
                      <span className="text-sm font-mono font-black text-primary tracking-wider">{d.accountNumber}</span>
                    </div>
                  </div>

                  {d.qrCodeImageUrl && (
                    <div className="p-3 bg-muted/30 rounded-xl flex flex-col items-center gap-2 border border-border/50">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1">
                        <QrCode className="w-3 h-3" /> QR Scanner
                      </span>
                      <img
                        src={d.qrCodeImageUrl.startsWith('http') ? d.qrCodeImageUrl : `${API_BASE_URL}${d.qrCodeImageUrl}`}
                        alt="QR Code"
                        className="w-20 h-20 object-contain rounded-md border border-border bg-white"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}

                  <Button variant="outline" className="w-full h-9 border-primary/20 text-primary hover:bg-primary hover:text-white text-xs font-bold rounded-lg transition-all" onClick={() => setSubmitOpen(true)}>
                    Manual Transfer Proof
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Tab: Pending Invoices ── */}
        <TabsContent value="orders">
          <Card className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
            <CardHeader className="py-4 px-6 bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" /> Unpaid Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingOrders ? (
                <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary opacity-20" /></div>
              ) : orders.filter(o => o.paymentStatus !== 'Paid').length === 0 ? (
                <div className="py-16 text-center text-muted-foreground text-sm font-medium">No pending payments found.</div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-b border-border">
                      <TableHead className="pl-6 py-3 text-[10px] font-black uppercase tracking-widest">Order ID</TableHead>
                      <TableHead className="py-3 text-[10px] font-black uppercase tracking-widest">Amount</TableHead>
                      <TableHead className="py-3 text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                      <TableHead className="pr-6 py-3 text-[10px] font-black uppercase tracking-widest text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.filter(o => o.paymentStatus !== 'Paid').map(order => (
                      <TableRow key={order.id} className="border-b border-border/50 hover:bg-muted/10">
                        <TableCell className="pl-6 font-mono font-bold text-xs text-primary">#{order.id}</TableCell>
                        <TableCell className="text-xs">
                           <div className="font-bold">NPR {(order.totalAmount - order.amountPaid).toLocaleString()}</div>
                           <div className="text-[10px] text-muted-foreground">Total: NPR {order.totalAmount.toLocaleString()}</div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tight">{order.paymentStatus}</Badge></TableCell>
                        <TableCell className="pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-8 text-[11px] font-bold rounded-lg" onClick={() => handleStripePayment(order.id)} disabled={stripeLoading === order.id}>
                              {stripeLoading === order.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CreditCard className="w-3 h-3 mr-1" />} Stripe
                            </Button>
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 h-8 text-[11px] font-bold rounded-lg" onClick={() => toast.info("Khalti Integration Coming Soon!")}>
                              Khalti
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 text-[11px] font-bold rounded-lg" onClick={() => { setForm({ ...emptyForm, orderId: order.id.toString(), amountPaid: (order.totalAmount - order.amountPaid).toString() }); setSubmitOpen(true); }}>
                              Manual
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: History ── */}
        <TabsContent value="history">
          <Card className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
            <CardHeader className="py-4 px-6 bg-muted/20 border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <History className="w-4 h-4 text-primary" /> Submission Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingHistory ? (
                <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary opacity-20" /></div>
              ) : history.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground text-sm font-medium">No history found.</div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-b border-border">
                      <TableHead className="pl-6 py-3 text-[10px] font-black uppercase tracking-widest">Order</TableHead>
                      <TableHead className="py-3 text-[10px] font-black uppercase tracking-widest">Amount</TableHead>
                      <TableHead className="py-3 text-[10px] font-black uppercase tracking-widest">Date</TableHead>
                      <TableHead className="py-3 text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                      <TableHead className="pr-6 py-3 text-[10px] font-black uppercase tracking-widest text-right">View</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map(h => (
                      <TableRow key={h.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                        <TableCell className="pl-6 font-mono font-bold text-xs text-primary">#{h.orderId}</TableCell>
                        <TableCell className="text-xs font-bold">NPR {h.amountPaid.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(h.paymentDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            "text-[10px] font-bold uppercase tracking-tight",
                            h.status === 'Verified' ? 'border-emerald-500 text-emerald-600 bg-emerald-500/5' :
                            h.status === 'Rejected' ? 'border-red-500 text-red-600 bg-red-500/5' : 'border-amber-500 text-amber-600 bg-amber-500/5'
                          )}>
                            {h.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          {h.proofImageUrl ? (
                            <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black uppercase" onClick={() => setViewProof(h.proofImageUrl!)}>
                              <FileText className="w-3 h-3 mr-1" /> View
                            </Button>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Dialogs ── */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-muted/10 border-b border-border">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" /> Submit Proof
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order ID</Label>
                <Input required type="number" value={form.orderId} onChange={e => setForm({ ...form, orderId: e.target.value })} className="bg-muted/20 font-mono h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</Label>
                <Input required type="number" step="0.01" value={form.amountPaid} onChange={e => setForm({ ...form, amountPaid: e.target.value })} className="bg-muted/20 font-mono h-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Attachment</Label>
              <div 
                className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:bg-muted/20 transition-all"
                onClick={() => document.getElementById('file-up')?.click()}
              >
                {form.proofImageUrl ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" /> Receipt Attached
                  </div>
                ) : (
                  <div className="text-muted-foreground text-[11px] font-medium">Click to upload Screenshot/PDF</div>
                )}
                <input id="file-up" type="file" accept="image/*,application/pdf" className="hidden" onChange={handleProofUpload} />
              </div>
            </div>
            <DialogFooter className="pt-4 gap-2">
              <Button type="button" variant="ghost" onClick={() => setSubmitOpen(false)} className="text-xs">Cancel</Button>
              <Button type="submit" className="bg-primary text-white font-bold h-10 px-6 rounded-xl" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />} Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewProof} onOpenChange={() => setViewProof(null)}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader><DialogTitle className="text-sm font-bold">Proof Document</DialogTitle></DialogHeader>
          {viewProof && <img src={viewProof.startsWith('http') ? viewProof : `${API_BASE_URL}${viewProof}`} className="w-full rounded-xl border border-border shadow-2xl" />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerPaymentPage;
