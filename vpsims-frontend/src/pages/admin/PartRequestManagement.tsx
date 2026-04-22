import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { 
  Package, Search, Loader2, CheckCircle2, 
  XCircle, Clock, Filter, Eye, Trash2,
  Mail, MessageSquare, AlertCircle, User
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PartRequest {
  id: number;
  userId: number;
  userName: string;
  partName: string;
  partNumber?: string;
  vehicleModel: string;
  quantity: number;
  priority: string;
  description: string;
  status: string;
  createdAt: string;
}

const PartRequestManagement = () => {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState<PartRequest | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/partrequest');
      setRequests(res.data);
    } catch {
      toast.error("Failed to load part requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    setUpdating(id);
    try {
      await api.patch(`/partrequest/${id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchRequests();
      if (selectedRequest?.id === id) setSelectedRequest(null);
    } catch {
      toast.error("Status update failed.");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete/cancel this sourcing request?")) return;
    try {
      await api.delete(`/partrequest/${id}`);
      toast.success("Request removed successfully.");
      fetchRequests();
    } catch {
      toast.error("Failed to delete request.");
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.partName.toLowerCase().includes(search.toLowerCase()) || 
                         r.userName.toLowerCase().includes(search.toLowerCase()) ||
                         r.vehicleModel.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'Procuring': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'Rejected': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto py-6 px-4 space-y-6 bg-background text-foreground min-h-screen">
      {/* Compact Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">Sourcing Management</h1>
            <p className="text-muted-foreground text-xs font-medium">Coordinate and fulfill customer part requests.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input 
              placeholder="Search request..." 
              className="pl-9 h-9 w-64 bg-muted/20 text-xs rounded-lg"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-32 text-xs bg-muted/20 rounded-lg">
              <Filter className="w-3.5 h-3.5 mr-2 opacity-50" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="All" className="text-xs">All Status</SelectItem>
              <SelectItem value="Pending" className="text-xs">Pending</SelectItem>
              <SelectItem value="Procuring" className="text-xs">Procuring</SelectItem>
              <SelectItem value="Available" className="text-xs">Available</SelectItem>
              <SelectItem value="Rejected" className="text-xs">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" /></div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-32 text-center text-muted-foreground text-sm font-medium">No sourcing requests found matching your filters.</div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b border-border">
                  <TableHead className="pl-6 py-4 text-[10px] font-black uppercase tracking-widest">Submitted</TableHead>
                  <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest">Customer</TableHead>
                  <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest">Part & Vehicle</TableHead>
                  <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-center">Priority</TableHead>
                  <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-center">Status Action</TableHead>
                  <TableHead className="pr-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((req) => (
                  <TableRow key={req.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                    <TableCell className="pl-6 py-4 text-[11px] text-muted-foreground font-medium">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-4">
                       <div className="flex items-center gap-2">
                         <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-black border border-border">
                           {req.userName[0]}
                         </div>
                         <span className="text-xs font-bold">{req.userName}</span>
                       </div>
                    </TableCell>
                    <TableCell className="py-4">
                       <div className="flex flex-col gap-0.5">
                         <span className="font-bold text-xs">{req.partName} <span className="text-muted-foreground font-medium">x{req.quantity}</span></span>
                         <span className="text-[10px] text-muted-foreground font-medium">{req.vehicleModel}</span>
                       </div>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                       <Badge variant="outline" className={cn(
                         "text-[9px] font-black uppercase border-none",
                         req.priority === 'Critical' ? 'bg-red-500 text-white' : req.priority === 'Urgent' ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'
                       )}>
                         {req.priority}
                       </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                       <div className="flex justify-center">
                         <Select 
                           value={req.status} 
                           onValueChange={(val) => handleUpdateStatus(req.id, val)}
                           disabled={updating === req.id}
                         >
                           <SelectTrigger className={cn("h-7 text-[10px] font-black uppercase min-w-[100px] border-none", getStatusColor(req.status))}>
                             {updating === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <SelectValue />}
                           </SelectTrigger>
                           <SelectContent className="bg-card border-border">
                             <SelectItem value="Pending" className="text-[10px] font-bold">Pending</SelectItem>
                             <SelectItem value="Procuring" className="text-[10px] font-bold">Procuring</SelectItem>
                             <SelectItem value="Available" className="text-[10px] font-bold">Available</SelectItem>
                             <SelectItem value="Rejected" className="text-[10px] font-bold">Rejected</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                    </TableCell>
                    <TableCell className="pr-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg" onClick={() => setSelectedRequest(req)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg" onClick={() => handleDelete(req.id)}>
                          <Trash2 className="w-4 h-4" />
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

      {/* ── Details Dialog (Optimized) ── */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-muted/10 border-b border-border">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" /> Request Context
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer</p>
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border"><User className="w-4 h-4" /></div>
                      <span className="text-xs font-bold">{selectedRequest.userName}</span>
                   </div>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Status</p>
                   <Badge className={cn("text-[10px] font-black uppercase border-none", getStatusColor(selectedRequest.status))}>{selectedRequest.status}</Badge>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Part Name</p>
                       <p className="text-sm font-black text-primary">{selectedRequest.partName} x{selectedRequest.quantity}</p>
                    </div>
                    <div className="space-y-0.5">
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vehicle</p>
                       <p className="text-xs font-bold">{selectedRequest.vehicleModel}</p>
                    </div>
                 </div>
                 {selectedRequest.partNumber && (
                   <div className="space-y-0.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Manufacturer PN</p>
                      <p className="text-xs font-mono font-bold">{selectedRequest.partNumber}</p>
                   </div>
                 )}
                 <div className="pt-2 border-t border-border/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">User Description</p>
                    <p className="text-xs font-medium leading-relaxed italic text-muted-foreground mt-1">"{selectedRequest.description}"</p>
                 </div>
              </div>

              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quick Actions</p>
                 <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="text-[11px] font-bold h-8 rounded-lg" onClick={() => handleUpdateStatus(selectedRequest.id, 'Procuring')}>Procuring</Button>
                    <Button size="sm" variant="outline" className="text-[11px] font-bold h-8 rounded-lg border-emerald-500/20 text-emerald-600" onClick={() => handleUpdateStatus(selectedRequest.id, 'Available')}>Mark Available</Button>
                    <Button size="sm" variant="outline" className="text-[11px] font-bold h-8 rounded-lg border-red-500/20 text-red-600" onClick={() => handleUpdateStatus(selectedRequest.id, 'Rejected')}>Reject</Button>
                    <Button size="sm" variant="outline" className="text-[11px] font-bold h-8 rounded-lg" asChild>
                       <a href={`mailto:?subject=Part Request: ${selectedRequest.partName}`}><Mail className="w-3.5 h-3.5 mr-1" /> Email Customer</a>
                    </Button>
                 </div>
              </div>
            </div>
          )}
          <DialogFooter className="p-4 bg-muted/5 border-t border-border">
             <Button variant="ghost" onClick={() => setSelectedRequest(null)} className="w-full text-xs font-bold">Dismiss Details</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartRequestManagement;
