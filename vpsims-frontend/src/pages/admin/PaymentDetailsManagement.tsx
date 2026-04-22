import { useEffect, useState } from 'react';
import api, { API_BASE_URL } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  Plus, Edit2, Trash2, Building2, CheckCircle2, XCircle,
  QrCode, Phone, Mail, CreditCard, Loader2, Search, Clock,
  ToggleLeft, ToggleRight, AlertCircle, Eye, Upload, Receipt, FileText,
  DollarSign, TrendingUp, Wallet
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
  referenceFormat?: string;
  qrCodeImageUrl?: string;
  instructions?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt: string;
}

interface PaymentSubmission {
  id: number;
  userId: number;
  userName: string;
  orderId: number;
  amountPaid: number;
  paymentMethod: string;
  referenceNumber?: string;
  paymentDate: string;
  proofImageUrl?: string;
  notes?: string;
  status: string;
  rejectionReason?: string;
  submittedAt: string;
  stripeSessionId?: string;
}

const emptyDetail: Partial<BusinessPaymentDetail> = {
  bankName: '', accountName: '', accountNumber: '',
  branchCode: '', referenceFormat: '', qrCodeImageUrl: '',
  instructions: '', contactEmail: '', contactPhone: '', isActive: true,
};

const statusColor = (status: string) => {
  if (status === 'Verified') return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
  if (status === 'Rejected') return 'bg-red-500/10 text-red-600 border-red-500/20';
  return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
};

const PaymentDetailsManagement = () => {
  const { user } = useAuth();
  const [details, setDetails] = useState<BusinessPaymentDetail[]>([]);
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<BusinessPaymentDetail>>(emptyDetail);
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rejectModal, setRejectModal] = useState<{ id: number } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewProof, setViewProof] = useState<PaymentSubmission | null>(null);
  const [uploadingQr, setUploadingQr] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payment/details');
      setDetails(res.data);
    } catch { toast.error('Failed to load payment methods.'); }
    finally { setLoading(false); }
  };

  const fetchSubmissions = async () => {
    setSubmissionsLoading(true);
    try {
      const res = await api.get('/payment/submissions');
      setSubmissions(res.data);
    } catch { toast.error('Failed to load payment submissions.'); }
    finally { setSubmissionsLoading(false); }
  };

  useEffect(() => { fetchDetails(); fetchSubmissions(); }, []);

  const openAdd = () => { setEditing({ ...emptyDetail }); setIsEditMode(false); setModalOpen(true); };
  const openEdit = (d: BusinessPaymentDetail) => { setEditing({ ...d }); setIsEditMode(true); setModalOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditMode && editing.id) {
        await api.put(`/payment/details/${editing.id}`, editing);
        toast.success('Payment method updated.');
      } else {
        await api.post('/payment/details', editing);
        toast.success('Payment method added.');
      }
      setModalOpen(false);
      fetchDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Save failed.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this payment method?')) return;
    try {
      await api.delete(`/payment/details/${id}`);
      toast.success('Payment method removed.');
      fetchDetails();
    } catch { toast.error('Delete failed.'); }
  };

  const handleVerify = async (id: number) => {
    try {
      await api.patch(`/payment/submissions/${id}/status`, { status: 'Verified' });
      toast.success('Payment verified.');
      fetchSubmissions();
    } catch { toast.error('Verification failed.'); }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    if (!rejectionReason.trim()) { toast.error('Reason required.'); return; }
    try {
      await api.patch(`/payment/submissions/${rejectModal.id}/status`, { status: 'Rejected', rejectionReason });
      toast.success('Payment rejected.');
      setRejectModal(null);
      setRejectionReason('');
      fetchSubmissions();
    } catch { toast.error('Rejection failed.'); }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQr(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/upload/qr-code', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditing({ ...editing, qrCodeImageUrl: res.data.url });
      toast.success('QR Code uploaded.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploadingQr(false);
    }
  };

  const filteredSubmissions = submissions.filter(s => {
    const matchSearch = s.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(s.orderId).includes(searchTerm) || (s.referenceNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalFunds = submissions.filter(s => s.status === 'Verified').reduce((acc, curr) => acc + curr.amountPaid, 0);
  const stripeFunds = submissions.filter(s => s.status === 'Verified' && s.paymentMethod === 'Stripe').reduce((acc, curr) => acc + curr.amountPaid, 0);
  const pendingFunds = submissions.filter(s => s.status === 'Pending').reduce((acc, curr) => acc + curr.amountPaid, 0);

  return (
    <div className="max-w-[1400px] mx-auto py-6 px-4 space-y-8 bg-background text-foreground min-h-screen">
      {/* Compact Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">Financial Nexus</h1>
            <p className="text-muted-foreground text-xs font-medium">Coordinate business payment channels and revenue reconciliation.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Verified Revenue</span>
              <span className="text-lg font-black text-emerald-600 tabular-nums">NPR {totalFunds.toLocaleString()}</span>
           </div>
           <div className="h-10 w-px bg-border" />
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-primary">Stripe Earnings</span>
              <span className="text-lg font-black text-primary tabular-nums">NPR {stripeFunds.toLocaleString()}</span>
           </div>
        </div>
      </div>

      {/* Stats QuickView */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-border bg-card p-4 flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
           </div>
           <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Verified Collections</p>
              <p className="text-sm font-black mt-1">NPR {totalFunds.toLocaleString()}</p>
           </div>
        </Card>
        <Card className="border border-border bg-card p-4 flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 border border-blue-500/20">
              <CreditCard className="w-5 h-5" />
           </div>
           <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Stripe Integration</p>
              <p className="text-sm font-black mt-1">NPR {stripeFunds.toLocaleString()}</p>
           </div>
        </Card>
        <Card className="border border-border bg-card p-4 flex items-center gap-4 border-l-amber-500/50">
           <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
              <Clock className="w-5 h-5" />
           </div>
           <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Pending Verification</p>
              <p className="text-sm font-black mt-1">NPR {pendingFunds.toLocaleString()}</p>
           </div>
        </Card>
      </div>

      <Tabs defaultValue="submissions" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-muted/20 border border-border h-9 p-1">
            <TabsTrigger value="submissions" className="text-xs px-4 h-7 font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm">Submissions</TabsTrigger>
            <TabsTrigger value="methods" className="text-xs px-4 h-7 font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm">Payment Channels</TabsTrigger>
          </TabsList>
          
          <TabsContent value="submissions" className="m-0">
             <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <Input className="pl-8 h-8 w-48 text-xs bg-muted/20 border-border" placeholder="Search customer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-8 text-xs bg-muted/20 rounded-md border border-border px-2">
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                  <option value="Rejected">Rejected</option>
                </select>
             </div>
          </TabsContent>
          
          <TabsContent value="methods" className="m-0">
             <Button onClick={openAdd} size="sm" className="h-8 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> New Account
             </Button>
          </TabsContent>
        </div>

        <TabsContent value="submissions" className="m-0">
          <Card className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
            <CardContent className="p-0">
              {submissionsLoading ? (
                <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary opacity-20" /></div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-b border-border">
                      <TableHead className="pl-6 py-3 text-[10px] font-black uppercase tracking-widest">Submitted</TableHead>
                      <TableHead className="py-3 text-[10px] font-black uppercase tracking-widest">Customer</TableHead>
                      <TableHead className="py-3 text-[10px] font-black uppercase tracking-widest text-center">Order</TableHead>
                      <TableHead className="py-3 text-[10px] font-black uppercase tracking-widest">Amount</TableHead>
                      <TableHead className="py-3 text-[10px] font-black uppercase tracking-widest">Source</TableHead>
                      <TableHead className="py-3 text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
                      <TableHead className="pr-6 py-3 text-[10px] font-black uppercase tracking-widest text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map(sub => (
                      <TableRow key={sub.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                        <TableCell className="pl-6 py-4 text-[11px] text-muted-foreground font-medium">
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="py-4">
                           <span className="text-xs font-bold">{sub.userName}</span>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                           <Badge variant="outline" className="text-[10px] font-mono font-bold">#{sub.orderId}</Badge>
                        </TableCell>
                        <TableCell className="py-4 font-black text-xs tabular-nums text-primary">
                          NPR {sub.amountPaid.toLocaleString()}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-medium">{sub.paymentMethod}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{sub.referenceNumber || '—'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <Badge variant="outline" className={cn("text-[9px] font-black uppercase", statusColor(sub.status))}>
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-1">
                             <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary rounded-lg" onClick={() => setViewProof(sub)}>
                               <Eye className="w-3.5 h-3.5" />
                             </Button>
                             {sub.status === 'Pending' && (
                               <>
                                 <Button size="sm" className="h-7 w-7 p-0 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg" onClick={() => handleVerify(sub.id)}>
                                   <CheckCircle2 className="w-3.5 h-3.5" />
                                 </Button>
                                 <Button size="sm" className="h-7 w-7 p-0 bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20 rounded-lg" onClick={() => setRejectModal({ id: sub.id })}>
                                   <XCircle className="w-3.5 h-3.5" />
                                 </Button>
                               </>
                             )}
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

        <TabsContent value="methods" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {details.map(d => (
              <Card key={d.id} className="border border-border bg-card rounded-2xl overflow-hidden group hover:shadow-md transition-all">
                <div className={cn("h-1.5 w-full", d.isActive ? "bg-emerald-500" : "bg-muted")} />
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm leading-tight">{d.bankName}</span>
                        <Badge variant="outline" className={cn("text-[8px] h-4 font-black uppercase mt-1 px-1.5", d.isActive ? "border-emerald-500 text-emerald-600" : "text-muted-foreground")}>
                          {d.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary rounded-lg" onClick={() => openEdit(d)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500 rounded-lg" onClick={() => handleDelete(d.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-muted-foreground font-bold uppercase tracking-widest">Account Name</span>
                      <span className="font-bold text-foreground">{d.accountName}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-muted-foreground font-bold uppercase tracking-widest">Account No.</span>
                      <span className="font-black text-primary font-mono">{d.accountNumber}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                     <div className="flex-1 p-2 rounded-lg bg-muted/20 border border-border flex items-center justify-center">
                        <QrCode className={cn("w-5 h-5", d.qrCodeImageUrl ? "text-primary" : "text-muted-foreground opacity-20")} />
                     </div>
                     <div className="flex-1 p-2 rounded-lg bg-muted/20 border border-border flex items-center justify-center">
                        <Phone className={cn("w-5 h-5", d.contactPhone ? "text-primary" : "text-muted-foreground opacity-20")} />
                     </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Viewer Modal (Already Optimized) */}
      <Dialog open={!!viewProof} onOpenChange={() => setViewProof(null)}>
        <DialogContent className="max-w-2xl bg-card border-border shadow-2xl rounded-2xl p-0 overflow-hidden">
          <div className="p-6 bg-muted/10 border-b border-border flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Receipt className="w-5 h-5" /></div>
             <div>
                <h3 className="font-black text-lg">Transaction Details</h3>
                <p className="text-xs text-muted-foreground">Verification data for Order #{viewProof?.orderId}</p>
             </div>
          </div>
          <div className="p-6 grid grid-cols-2 gap-8">
             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-muted-foreground">Amount</p>
                      <p className="text-lg font-black text-emerald-600">NPR {viewProof?.amountPaid.toLocaleString()}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-muted-foreground">Status</p>
                      <Badge className={cn("text-[10px] font-black uppercase border-none px-2", statusColor(viewProof?.status || ''))}>{viewProof?.status}</Badge>
                   </div>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase text-muted-foreground">Payment Method</p>
                   <p className="text-xs font-bold">{viewProof?.paymentMethod}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border font-mono text-[10px] break-all text-muted-foreground">
                   {viewProof?.referenceNumber || 'NO_REF_KEY'}
                </div>
                {viewProof?.notes && (
                   <p className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded-xl border border-border/50">"{viewProof.notes}"</p>
                )}
             </div>
             <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Attachment</p>
                <div className="aspect-[3/4] rounded-2xl border border-border overflow-hidden bg-black/5 flex items-center justify-center">
                   {viewProof?.proofImageUrl ? (
                      <img src={viewProof.proofImageUrl.startsWith('http') ? viewProof.proofImageUrl : `${API_BASE_URL}${viewProof.proofImageUrl}`} className="w-full h-full object-cover" />
                   ) : (
                      <div className="text-center opacity-20"><FileText className="w-12 h-12 mx-auto" /><p className="text-[10px] font-bold mt-2">NO PREVIEW</p></div>
                   )}
                </div>
             </div>
          </div>
          <div className="p-4 bg-muted/5 border-t border-border flex justify-end">
             <Button variant="ghost" className="text-xs font-bold" onClick={() => setViewProof(null)}>Dismiss Viewer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentDetailsManagement;
