import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Star, MessageSquare, Send, Loader2, Sparkles,
  History as HistoryIcon, Clock, ChevronLeft, ChevronRight, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 6;

const StarRating = ({
  value, hover, onRate, onHover, size = "lg"
}: {
  value: number; hover: number; onRate: (v: number) => void;
  onHover: (v: number) => void; size?: "sm" | "lg";
}) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onRate(star)}
        onMouseEnter={() => onHover(star)}
        onMouseLeave={() => onHover(0)}
        className="transition-transform active:scale-90 focus:outline-none"
      >
        <Star
          className={cn(
            "transition-all duration-150",
            size === "lg" ? "w-8 h-8" : "w-3.5 h-3.5",
            star <= (hover || value)
              ? "fill-amber-400 text-amber-400 scale-110"
              : "text-muted-foreground/30 hover:text-amber-300"
          )}
        />
      </button>
    ))}
  </div>
);

const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

const ReviewsPage = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { toast.error("Please select a star rating."); return; }
    setSubmitting(true);
    try {
      await api.post("/review", { rating, comment });
      toast.success("Review submitted! Thank you for your feedback.");
      setSubmitted(true);
      setRating(0);
      setComment("");
      fetchData();
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Submission failed. Please try again.");
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

  // Average rating
  const avgRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8 min-h-screen">

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Customer Reviews</h1>
          <p className="text-sm text-muted-foreground mt-0.5">See what our customers are saying about their experience</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-xl font-black text-foreground">{avgRating}</span>
              <span className="text-sm text-muted-foreground">/ 5</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">{reviews.length} reviews total</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* ── Main Feed Column ── */}
        <div className="xl:col-span-8 space-y-8">

          {/* Public Reviews Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Recent Reviews
              </h2>
              {totalPublicPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setPublicPage(p => Math.max(1, p - 1))} disabled={publicPage === 1} className="h-7 w-7 rounded-lg">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground font-medium">{publicPage} / {totalPublicPages}</span>
                  <Button variant="outline" size="icon" onClick={() => setPublicPage(p => Math.min(totalPublicPages, p + 1))} disabled={publicPage === totalPublicPages} className="h-7 w-7 rounded-lg">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-36 rounded-xl bg-muted animate-pulse border border-border" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <h3 className="font-semibold text-foreground">No reviews yet</h3>
                <p className="text-sm text-muted-foreground mt-1">Be the first to share your experience!</p>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {paginate(reviews, publicPage).map((r: Review) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <Card className="border border-border rounded-xl bg-card p-5 space-y-3 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group h-full">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
                              {r.userName?.[0]?.toUpperCase() || "A"}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-foreground leading-none">{r.userName || "Anonymous"}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={cn("w-3 h-3", i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20")} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground/40 flex-shrink-0">
                            <Clock className="w-3 h-3" />
                            <span className="text-[10px] font-medium">{new Date(r.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-border pl-3">
                          "{r.comment}"
                        </p>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* My Reviews */}
          {myReviews.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <HistoryIcon className="w-4 h-4 text-primary" />
                  My Reviews
                  <span className="text-xs font-normal text-muted-foreground">({myReviews.length})</span>
                </h2>
                {totalMyPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setMyPage(p => Math.max(1, p - 1))} disabled={myPage === 1} className="h-7 w-7 rounded-lg">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground font-medium">{myPage} / {totalMyPages}</span>
                    <Button variant="outline" size="icon" onClick={() => setMyPage(p => Math.min(totalMyPages, p + 1))} disabled={myPage === totalMyPages} className="h-7 w-7 rounded-lg">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {paginate(myReviews, myPage).map((r: Review) => (
                  <div key={r.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={cn("w-3 h-3", i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20")} />
                          ))}
                        </div>
                        <Badge
                          className={cn(
                            "text-[9px] font-semibold uppercase px-1.5 py-0 h-4 leading-none border-none",
                            r.status === 'Approved'
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-amber-500/10 text-amber-600"
                          )}
                        >
                          {r.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground font-medium truncate">"{r.comment}"</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap flex-shrink-0">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Review Form Column ── */}
        <div className="xl:col-span-4">
          <Card className="border border-border rounded-2xl bg-card shadow-sm sticky top-8">
            <CardHeader className="border-b border-border py-4 px-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">Write a Review</CardTitle>
                  <p className="text-[10px] text-muted-foreground font-medium">Share your service experience</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-10 flex flex-col items-center text-center gap-3"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 size={28} className="text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Thank you!</h3>
                      <p className="text-xs text-muted-foreground mt-1">Your review has been submitted.</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    {/* Star Rating */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground">Your Rating *</Label>
                      <StarRating value={rating} hover={hover} onRate={setRating} onHover={setHover} size="lg" />
                      {(hover || rating) > 0 && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs font-semibold text-amber-500"
                        >
                          {ratingLabels[hover || rating]}
                        </motion.p>
                      )}
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground">
                        Your Comment <span className="font-normal opacity-60">(optional)</span>
                      </Label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us about your experience — what went well, what could be improved..."
                        className="min-h-[120px] text-sm border-border resize-none focus:border-primary"
                      />
                      <p className="text-[10px] text-muted-foreground text-right">{comment.length} characters</p>
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting || !rating}
                      className="w-full h-10 font-semibold shadow-md shadow-primary/10"
                    >
                      {submitting
                        ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</>
                        : <><Send className="w-4 h-4 mr-2" /> Submit Review</>
                      }
                    </Button>

                    {!rating && (
                      <p className="text-center text-[10px] text-muted-foreground">
                        Select a star rating above to submit
                      </p>
                    )}
                  </motion.form>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default ReviewsPage;
