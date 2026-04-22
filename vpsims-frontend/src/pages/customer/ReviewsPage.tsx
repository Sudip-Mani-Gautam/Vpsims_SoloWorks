import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Star, MessageSquare, Send, Loader2, Sparkles, User, Calendar, 
  History as HistoryIcon, ShieldCheck, Clock, ChevronLeft, ChevronRight 
} from "lucide-react";
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

const ITEMS_PER_PAGE = 6; // Balanced density

const ReviewsPage = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [publicPage, setPublicPage] = useState(1);
  const [myPage, setMyPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allRes, myRes] = await Promise.all([
        api.get("/review"),
        api.get("/review/my")
      ]);
      setReviews(allRes.data);
      setMyReviews(myRes.data);
    } catch {
      toast.error("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast.error("Select rating.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/review", { rating, comment });
      toast.success("Feedback logged.");
      setRating(0);
      setComment("");
      fetchData(); 
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Submission failed.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const paginate = (items: any[], page: number) => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  };

  const totalPublicPages = Math.ceil(reviews.length / ITEMS_PER_PAGE);
  const totalMyPages = Math.ceil(myReviews.length / ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 bg-background min-h-screen">
      {/* Balanced Professional Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg border border-primary/20">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Community Reviews</h1>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Operational Experience logs</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Feed Column */}
        <div className="xl:col-span-8 space-y-10">
          
          {/* Public Feed - Professional Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-secondary" /> Recent Signal Experiences
              </h2>
              {totalPublicPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setPublicPage(p => Math.max(1, p - 1))} disabled={publicPage === 1} className="h-7 w-7 rounded-lg"><ChevronLeft className="w-4 h-4" /></Button>
                  <span className="text-[10px] font-black tracking-widest">{publicPage} / {totalPublicPages}</span>
                  <Button variant="outline" size="icon" onClick={() => setPublicPage(p => Math.min(totalPublicPages, p + 1))} disabled={publicPage === totalPublicPages} className="h-7 w-7 rounded-lg"><ChevronRight className="w-4 h-4" /></Button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 rounded-xl bg-muted animate-pulse border border-border" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginate(reviews, publicPage).map((r: Review) => (
                  <Card key={r.id} className="border border-border rounded-xl bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                             {r.userName?.[0] || "A"}
                          </div>
                          <span className="font-black text-xs uppercase tracking-tight">{r.userName || "Anonymous"}</span>
                       </div>
                       <div className="flex gap-0.5">
                         {Array.from({ length: 5 }).map((_, i) => (
                           <Star key={i} className={cn("w-3 h-3", i < r.rating ? "fill-secondary text-secondary" : "text-border")} />
                         ))}
                       </div>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed italic">"{r.comment}"</p>
                    <div className="pt-2 flex items-center gap-2 border-t border-border/50">
                       <Clock className="w-3 h-3 text-muted-foreground/40" />
                       <span className="text-[10px] font-bold text-muted-foreground/40 uppercase">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Personal Contributions - Solid List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                 <HistoryIcon className="w-4 h-4" /> Personal Audit Log
              </h2>
              {totalMyPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setMyPage(p => Math.max(1, p - 1))} disabled={myPage === 1} className="h-7 w-7 rounded-lg"><ChevronLeft className="w-4 h-4" /></Button>
                  <span className="text-[10px] font-black tracking-widest">{myPage} / {totalMyPages}</span>
                  <Button variant="outline" size="icon" onClick={() => setMyPage(p => Math.min(totalMyPages, p + 1))} disabled={myPage === totalMyPages} className="h-7 w-7 rounded-lg"><ChevronRight className="w-4 h-4" /></Button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {paginate(myReviews, myPage).map((r: Review) => (
                <div key={r.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl shadow-sm">
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                         <div className="flex gap-0.5">
                           {Array.from({ length: 5 }).map((_, i) => (
                             <Star key={i} className={cn("w-2.5 h-2.5", i < r.rating ? "fill-secondary text-secondary" : "text-border")} />
                           ))}
                         </div>
                         <Badge variant="outline" className={cn(
                            "text-[9px] font-black uppercase px-2 h-4 leading-none border-none",
                            r.status === 'Approved' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                         )}>
                            {r.status}
                         </Badge>
                      </div>
                      <p className="text-sm font-bold text-foreground truncate">"{r.comment}"</p>
                   </div>
                   <span className="text-[10px] font-black text-muted-foreground/50 uppercase whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="xl:col-span-4">
          <Card className="border-2 border-border rounded-2xl bg-card overflow-hidden shadow-xl sticky top-8">
             <CardHeader className="bg-muted p-5 border-b border-border">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                   <Send className="w-4 h-4 text-primary" /> Transmit Feedback
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Intensity (Rating)</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)} className="transition-transform active:scale-90">
                        <Star className={cn("w-8 h-8 transition-all", star <= (hover || rating) ? "fill-secondary text-secondary scale-110" : "text-border")} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operational Data (Comment)</Label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe your operational experience..."
                    className="min-h-[120px] bg-muted/30 border-2 border-border rounded-xl text-sm font-medium focus:border-primary p-4 resize-none transition-all"
                  />
                </div>

                <Button type="submit" disabled={submitting || !rating} className="w-full bg-primary text-white font-black text-xs uppercase tracking-[0.2em] h-12 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit To Registry"}
                </Button>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
