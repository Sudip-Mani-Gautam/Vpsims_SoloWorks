import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, Check, X, Star, MessageSquare, ThumbsUp, ThumbsDown, 
  Trash2, Loader2, AlertCircle, Sparkles, User, Calendar, ShieldCheck
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
}

const ReviewModeration = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Pending");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Admins/Staff use the /all endpoint to see everything including Pending
      const res = await api.get("/review/all");
      setReviews(res.data);
    } catch {
      toast.error("Failed to load reviews for moderation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/review/${id}/status`, { status });
      toast.success(`Review ${status.toLowerCase()} successfully.`);
      // Optimistic update
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch {
      toast.error("Failed to update review status.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    try {
      await api.delete(`/review/${id}`);
      toast.success("Review deleted permanently.");
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch {
      toast.error("Failed to delete review.");
    }
  };

  const pending = reviews.filter(r => r.status === "Pending");
  const approved = reviews.filter(r => r.status === "Approved");
  const rejected = reviews.filter(r => r.status === "Rejected");

  const stats = [
    { label: "Pending Verification", value: pending.length, color: "text-amber-500", bg: "bg-amber-500/10", icon: Clock },
    { label: "Publicly Published", value: approved.length, color: "text-emerald-500", bg: "bg-emerald-500/10", icon: Check },
    { label: "Filtered/Rejected", value: rejected.length, color: "text-red-500", bg: "bg-red-500/10", icon: X },
  ];

  const ReviewCard = ({ r }: { r: Review }) => (
    <Card className="border border-border bg-card rounded-2xl overflow-hidden group hover:shadow-md transition-all">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground border border-border">
                <User className="w-5 h-5" />
             </div>
             <div>
                <p className="text-sm font-black text-foreground leading-tight">{r.userName || "Unknown User"}</p>
                <div className="flex items-center gap-2 mt-1">
                   <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={cn("w-3 h-3", i <= r.rating ? "fill-secondary text-secondary" : "text-border")} />
                      ))}
                   </div>
                   <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(r.createdAt).toLocaleDateString()}
                   </span>
                </div>
             </div>
          </div>
          <Badge variant="outline" className={cn(
             "text-[9px] font-black uppercase px-2 py-0.5",
             r.status === 'Pending' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
             r.status === 'Approved' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
             "bg-red-500/10 text-red-600 border-red-500/20"
          )}>
            {r.status}
          </Badge>
        </div>

        <div className="p-3 rounded-xl bg-muted/20 border border-border/50">
           <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
             "{r.comment || "No comment provided."}"
           </p>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-border/40">
           <div className="flex gap-2">
             {r.status !== 'Approved' && (
               <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm" onClick={() => handleUpdateStatus(r.id, "Approved")}>
                 <ThumbsUp className="w-3.5 h-3.5 mr-1.5" /> Approve
               </Button>
             )}
             {r.status !== 'Rejected' && (
               <Button size="sm" variant="outline" className="h-8 border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg" onClick={() => handleUpdateStatus(r.id, "Rejected")}>
                 <ThumbsDown className="w-3.5 h-3.5 mr-1.5" /> Reject
               </Button>
             )}
           </div>
           <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg p-0 w-8" onClick={() => handleDelete(r.id)}>
              <Trash2 className="w-3.5 h-3.5" />
           </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-[1400px] mx-auto py-6 px-4 space-y-8 bg-background text-foreground min-h-screen">
      {/* Compact Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">Review Governance</h1>
            <p className="text-muted-foreground text-xs font-medium">Verify customer testimonials and ensure platform integrity.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           {stats.map(s => (
             <div key={s.label} className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</span>
                <span className={cn("text-lg font-black tabular-nums", s.color)}>{s.value}</span>
             </div>
           ))}
        </div>
      </div>

      <Tabs defaultValue="Pending" className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-muted/20 border border-border h-10 p-1 rounded-xl">
            <TabsTrigger value="Pending" className="text-xs px-6 h-8 font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg">
              Needs Attention <Badge variant="secondary" className="ml-2 h-4 px-1.5 font-black text-[10px] bg-amber-500/20 text-amber-600">{pending.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="Approved" className="text-xs px-6 h-8 font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg">
              Published
            </TabsTrigger>
            <TabsTrigger value="Rejected" className="text-xs px-6 h-8 font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg">
              Flagged/Hidden
            </TabsTrigger>
          </TabsList>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" /></div>
        ) : (
          <>
            <TabsContent value="Pending" className="m-0 space-y-4">
              {pending.length === 0 ? (
                <EmptyState label="Pending Reviews" icon={Clock} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pending.map(r => <ReviewCard key={r.id} r={r} />)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="Approved" className="m-0 space-y-4">
              {approved.length === 0 ? (
                <EmptyState label="Published Reviews" icon={Check} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {approved.map(r => <ReviewCard key={r.id} r={r} />)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="Rejected" className="m-0 space-y-4">
              {rejected.length === 0 ? (
                <EmptyState label="Rejected Reviews" icon={X} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rejected.map(r => <ReviewCard key={r.id} r={r} />)}
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Moderation Policy Reminder */}
      <Card className="border border-border bg-muted/5 rounded-2xl overflow-hidden mt-8">
         <CardContent className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 flex-shrink-0">
               <AlertCircle className="w-4 h-4" />
            </div>
            <p className="text-xs text-muted-foreground leading-snug">
               <span className="font-bold text-foreground">Moderator Tip:</span> Only approve reviews that provide constructive feedback and appear to be from genuine customers. Avoid publishing spam, offensive content, or reviews mentioning competitors by name.
            </p>
         </CardContent>
      </Card>
    </div>
  );
};

const EmptyState = ({ label, icon: Icon }: { label: string, icon: any }) => (
  <div className="py-20 text-center border-2 border-dashed border-border rounded-[32px] bg-muted/5 flex flex-col items-center gap-3">
    <Icon className="w-10 h-10 text-muted-foreground/20" />
    <p className="text-muted-foreground text-sm font-medium">No {label.toLowerCase()} found.</p>
  </div>
);

export default ReviewModeration;
