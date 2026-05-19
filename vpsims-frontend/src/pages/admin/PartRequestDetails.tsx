import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, Loader2, ArrowLeft,
  Mail, AlertCircle, User
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
  imageUrl?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Available': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'Procuring': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'Rejected': return 'bg-red-500/10 text-red-600 border-red-500/20';
    default: return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
  }
};

const PartRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [request, setRequest] = useState<PartRequest | null>(location.state?.req || null);
  const [loading, setLoading] = useState(!request);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!request) {
      const fetchRequest = async () => {
        try {
          const res = await api.get('/partrequest');
          const found = res.data.find((r: PartRequest) => r.id === parseInt(id || '0'));
          if (found) setRequest(found);
          else {
            toast.error("Part request not found.");
            navigate('/admin/part-requests');
          }
        } catch {
          toast.error("Failed to load part request.");
          navigate('/admin/part-requests');
        } finally {
          setLoading(false);
        }
      };
      fetchRequest();
    }
  }, [id, request, navigate]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!request) return;
    setUpdating(true);
    try {
      await api.patch(`/partrequest/${request.id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      setRequest({ ...request, status: newStatus });
    } catch {
      toast.error("Status update failed.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" /></div>;
  }

  if (!request) return null;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 bg-background text-foreground min-h-screen">
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/part-requests')} className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight">Request Details: {request.partName}</h1>
          <p className="text-muted-foreground text-xs font-medium">Submitted on {new Date(request.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <Card className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
        <CardHeader className="bg-muted/10 border-b border-border p-6">
          <CardTitle className="text-lg font-bold flex items-center justify-between">
            <span>Sourcing Context</span>
            <Badge className={cn("text-xs font-black uppercase border-none px-3 py-1", getStatusColor(request.status))}>{request.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Details & Actions */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer</p>
                   <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 text-primary"><User className="w-4 h-4" /></div>
                      <span className="text-sm font-bold">{request.userName}</span>
                   </div>
                </div>
                <div className="space-y-1.5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Priority</p>
                   <Badge variant="outline" className={cn(
                     "text-[10px] font-black uppercase border-none px-2.5 py-1",
                     request.priority === 'Critical' ? 'bg-red-500 text-white' : request.priority === 'Urgent' ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'
                   )}>
                     {request.priority}
                   </Badge>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-muted/10 border border-border/60 space-y-5">
                 <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Part Name</p>
                       <p className="text-base font-black text-primary">{request.partName} <span className="text-muted-foreground font-semibold text-sm ml-1">x{request.quantity}</span></p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vehicle</p>
                       <p className="text-sm font-bold text-foreground">{request.vehicleModel}</p>
                    </div>
                 </div>
                 {request.partNumber && (
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Manufacturer PN</p>
                      <p className="text-sm font-mono font-bold bg-background inline-block px-2 py-1 rounded-md border border-border">{request.partNumber}</p>
                   </div>
                 )}
                 <div className="pt-5 border-t border-border/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">User Description</p>
                    <p className="text-sm font-medium leading-relaxed italic text-muted-foreground">"{request.description || "No description provided."}"</p>
                 </div>
              </div>

              <div className="space-y-3 pt-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quick Actions</p>
                 <div className="flex flex-wrap gap-3">
                    <Button disabled={updating} onClick={() => handleUpdateStatus('Procuring')} size="sm" variant="outline" className="font-bold h-10 px-4 rounded-xl">
                      {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Package className="w-4 h-4 mr-2" />} Set to Procuring
                    </Button>
                    <Button disabled={updating} onClick={() => handleUpdateStatus('Available')} size="sm" variant="outline" className="font-bold h-10 px-4 rounded-xl border-emerald-500/20 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10">
                      Mark Available
                    </Button>
                    <Button disabled={updating} onClick={() => handleUpdateStatus('Rejected')} size="sm" variant="outline" className="font-bold h-10 px-4 rounded-xl border-red-500/20 text-red-600 bg-red-500/5 hover:bg-red-500/10">
                      Reject Request
                    </Button>
                    <Button size="sm" variant="outline" className="font-bold h-10 px-4 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary border-primary/20" asChild>
                       <a href={`mailto:?subject=Part Request: ${request.partName}`}><Mail className="w-4 h-4 mr-2" /> Email Customer</a>
                    </Button>
                 </div>
              </div>
            </div>

            {/* Right Column: Reference Image */}
            <div className="lg:col-span-1 space-y-3">
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reference Image</p>
               {request.imageUrl ? (
                 <div className="rounded-2xl overflow-hidden border border-border/60 bg-muted/5 flex items-center justify-center h-full max-h-[400px]">
                   <img src={request.imageUrl} alt="Reference" className="w-full h-full object-cover rounded-2xl hover:scale-105 transition-transform duration-500 cursor-pointer" onClick={() => window.open(request.imageUrl, '_blank')} />
                 </div>
               ) : (
                 <div className="rounded-2xl border border-dashed border-border/60 bg-muted/5 h-full min-h-[300px] flex flex-col items-center justify-center text-muted-foreground/40">
                   <AlertCircle className="w-10 h-10 mb-3 opacity-20" />
                   <span className="text-xs font-bold uppercase tracking-wider">No Image Provided</span>
                 </div>
               )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartRequestDetails;
