import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  CheckCircle2, XCircle, Clock, Search, Loader2,
  CreditCard, Eye, FileText, Receipt, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

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
}

const statusColor = (status: string) => {
  if (status === 'Verified') return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (status === 'Rejected') return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400';
  return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400';
};

const StaffPaymentView = () => {
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewProof, setViewProof] = useState<PaymentSubmission | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payment/submissions');
      setSubmissions(res.data);
    } catch {
      toast.error('Failed to load payment submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const filtered = submissions.filter(s => {
    const matchSearch =
      s.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(s.orderId).includes(searchTerm) ||
      (s.referenceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalVerified = submissions.filter(s => s.status === 'Verified').length;
  const totalPending = submissions.filter(s => s.status === 'Pending').length;
  const totalRejected = submissions.filter(s => s.status === 'Rejected').length;
  const totalAmount = submissions.filter(s => s.status === 'Verified').reduce((acc, s) => acc + s.amountPaid, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-heading font-black tracking-tight text-foreground">Customer Payments</h1>
        <p className="text-muted-foreground font-medium">
          View all customer payment submissions. Verification is handled by administrators.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Submissions', value: submissions.length, color: 'text-foreground', bg: 'bg-card' },
          { label: 'Pending Review', value: totalPending, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Verified', value: totalVerified, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Verified Revenue', value: `NPR ${totalAmount.toLocaleString()}`, color: 'text-primary', bg: 'bg-primary/5' },
        ].map(stat => (
          <Card key={stat.label} className={`glass-card border-border/40 ${stat.bg}`}>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Card */}
      <Card className="glass-card shadow-xl border-border/40 overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="font-heading font-bold text-lg flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" /> All Submissions
              </CardTitle>
              <CardDescription>Read-only view. Contact admin to verify or reject payments.</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9 h-9 w-52 bg-background/50"
                  placeholder="Search customer, order..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background/50 px-3 text-sm font-medium"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary opacity-40" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="pl-6 font-bold text-xs uppercase tracking-wider">Submitted</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Customer</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Order</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Amount</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Method & Ref</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Paid On</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-right pr-6">Proof</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <CreditCard className="w-10 h-10 opacity-20" />
                        <p className="font-medium">No payment submissions found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.map(sub => (
                  <TableRow key={sub.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="pl-6 text-xs text-muted-foreground">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-semibold text-sm">{sub.userName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono font-bold">#{sub.orderId}</Badge>
                    </TableCell>
                    <TableCell className="font-black text-primary tabular-nums">
                      NPR {sub.amountPaid.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{sub.paymentMethod}</div>
                      <div className="text-xs text-muted-foreground font-mono">{sub.referenceNumber || '—'}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(sub.paymentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${statusColor(sub.status)}`}>
                          {sub.status === 'Verified' && <CheckCircle2 className="w-3 h-3" />}
                          {sub.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                          {sub.status === 'Pending' && <Clock className="w-3 h-3" />}
                          {sub.status}
                        </span>
                        {sub.status === 'Rejected' && sub.rejectionReason && (
                          <p className="text-xs text-red-500 mt-1 max-w-[140px] truncate" title={sub.rejectionReason}>
                            {sub.rejectionReason}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      {sub.proofImageUrl ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs hover:bg-primary/10 hover:text-primary"
                          onClick={() => setViewProof(sub)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> View
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Proof Viewer ── */}
      <Dialog open={!!viewProof} onOpenChange={() => setViewProof(null)}>
        <DialogContent className="max-w-lg glass-card border-white/10">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Payment Proof
            </DialogTitle>
            <DialogDescription>
              Submitted by <strong>{viewProof?.userName}</strong> for Order <strong>#{viewProof?.orderId}</strong>
              {' · '}NPR {viewProof?.amountPaid.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          {viewProof?.proofImageUrl && (
            <img
              src={viewProof.proofImageUrl}
              alt="Payment proof"
              className="w-full rounded-xl border border-border object-contain max-h-[400px]"
            />
          )}
          {viewProof?.notes && (
            <p className="text-sm text-muted-foreground italic border-t border-border/40 pt-3">{viewProof.notes}</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffPaymentView;
